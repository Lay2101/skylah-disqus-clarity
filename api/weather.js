import {
  getCredentialInfo,
  fetchTwoHourForecastUpstream,
  sendJson,
} from "./_upstream.js";

/**
 * Serverless handler for Singapore 2-Hour Weather Forecast (/api/weather):
 * - Does NOT require an API key; keyConfigured: false does not block the request.
 * - Attaches x-api-key ONLY if an API key is configured in the environment.
 * - Distinguishes timeouts, reachability failures, upstream refusals, and invalid responses.
 * - Filters payload strictly to fields needed by the UI.
 * - Sets cache header s-maxage=20, stale-while-revalidate=40 for live updates.
 * - Never exposes credentials or internal stack traces.
 */
export default async function handler(req, res) {
  // 1. Get credential info if available (optional for this public endpoint)
  const credential = getCredentialInfo();
  const apiKey = credential.isConfigured ? credential.value : null;

  // 2. Fetch from upstream data.gov.sg
  const upstreamResult = await fetchTwoHourForecastUpstream(apiKey);

  // 3. Upstream timed out
  if (upstreamResult.isTimeout) {
    if (typeof res.setHeader === "function") {
      res.setHeader("Cache-Control", "no-store, max-age=0");
    }
    return sendJson(res, 504, {
      error: true,
      errorType: "timeout",
      upstreamStatus: null,
      message: "The weather service request timed out. Please try again shortly.",
    });
  }

  // 4. Upstream unreachable (network failure, DNS error)
  if (!upstreamResult.answered || !upstreamResult.response) {
    if (typeof res.setHeader === "function") {
      res.setHeader("Cache-Control", "no-store, max-age=0");
    }
    return sendJson(res, 503, {
      error: true,
      errorType: "unreachable",
      upstreamStatus: null,
      message: "We couldn’t reach the weather service. Please try again shortly.",
    });
  }

  // 5. Upstream refused (non-2xx status code)
  if (!upstreamResult.ok) {
    if (typeof res.setHeader === "function") {
      res.setHeader("Cache-Control", "no-store, max-age=0");
    }
    const status = upstreamResult.status || 502;
    const reason =
      status === 429
        ? "The weather service is receiving too many requests. Please wait a moment and try again."
        : "The weather service declined this request. Please try again later.";

    return sendJson(res, status, {
      error: true,
      errorType: "refused",
      upstreamStatus: status,
      message: reason,
    });
  }

  // 6. Read and parse body safely
  let rawJson;
  try {
    const rawText = await upstreamResult.response.text();
    rawJson = JSON.parse(rawText);
  } catch (_err) {
    if (typeof res.setHeader === "function") {
      res.setHeader("Cache-Control", "no-store, max-age=0");
    }
    return sendJson(res, 502, {
      error: true,
      errorType: "invalid_response",
      upstreamStatus: upstreamResult.status,
      message: "The weather service returned an unreadable response. Please try again shortly.",
    });
  }

  // 7. Validate response payload structure
  const areaMetadata = rawJson?.data?.area_metadata;
  const items = rawJson?.data?.items;

  if (!Array.isArray(areaMetadata) || !Array.isArray(items) || items.length === 0) {
    if (typeof res.setHeader === "function") {
      res.setHeader("Cache-Control", "no-store, max-age=0");
    }
    return sendJson(res, 502, {
      error: true,
      errorType: "invalid_response",
      upstreamStatus: upstreamResult.status,
      message: "The weather service returned an unexpected response structure. Please try again shortly.",
    });
  }

  const firstItem = items[0];
  const forecasts = firstItem?.forecasts;

  if (!Array.isArray(forecasts)) {
    if (typeof res.setHeader === "function") {
      res.setHeader("Cache-Control", "no-store, max-age=0");
    }
    return sendJson(res, 502, {
      error: true,
      errorType: "invalid_response",
      upstreamStatus: upstreamResult.status,
      message: "The weather service returned an unexpected response structure. Please try again shortly.",
    });
  }

  // Handle empty forecasts array
  if (forecasts.length === 0) {
    if (typeof res.setHeader === "function") {
      res.setHeader("Cache-Control", "s-maxage=20, stale-while-revalidate=40");
    }
    return sendJson(res, 200, {
      areas: [],
      validPeriod: firstItem.valid_period || null,
      sourceTimestamps: {
        updateTimestamp: firstItem.update_timestamp || null,
        timestamp: firstItem.timestamp || null,
      },
      retrievedAt: new Date().toISOString(),
      empty: true,
      message: "No forecast is available for this area right now.",
    });
  }

  // 8. Map forecasts by area name
  const forecastMap = new Map();
  for (const item of forecasts) {
    if (item && typeof item.area === "string") {
      forecastMap.set(item.area.trim().toLowerCase(), item.forecast || "");
    }
  }

  const areas = [];
  for (const meta of areaMetadata) {
    if (meta && typeof meta.name === "string") {
      const name = meta.name.trim();
      areas.push({
        name,
        forecast: forecastMap.get(name.toLowerCase()) || "No forecast is available for this area right now.",
      });
    }
  }

  if (typeof res.setHeader === "function") {
    res.setHeader("Cache-Control", "s-maxage=20, stale-while-revalidate=40");
  }

  return sendJson(res, 200, {
    areas,
    validPeriod: firstItem.valid_period || null,
    sourceTimestamps: {
      updateTimestamp: firstItem.update_timestamp || null,
      timestamp: firstItem.timestamp || null,
    },
    retrievedAt: new Date().toISOString(),
  });
}
