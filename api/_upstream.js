/**
 * Shared helper for calling Singapore data.gov.sg two-hour forecast API.
 * Safely manages credential presence, upstream timeout, and response serialization.
 * Never prints or logs the credential in responses or console outputs.
 */

const UPSTREAM_URL = "https://api-open.data.gov.sg/v2/real-time/api/two-hr-forecast";
const REQUEST_TIMEOUT_MS = 8000;

const POSSIBLE_ENV_VARS = [
  "DATA_GOV_SG_API_KEY",
  "VARIABLE_NAME",
  "SKYLAH_WEATHER_API_KEY",
  "SKYLAH_API_KEY",
  "API_KEY",
];

export function getCredentialInfo() {
  const raw = process.env.DATA_GOV_SG_API_KEY;
  if (
    typeof raw === "string" &&
    raw.trim().length > 0 &&
    raw.trim().toLowerCase() !== "undefined" &&
    raw.trim().toLowerCase() !== "null"
  ) {
    return {
      varName: "DATA_GOV_SG_API_KEY",
      isConfigured: true,
      value: raw.trim(),
    };
  }

  // Check fallback variables if any
  for (const name of POSSIBLE_ENV_VARS) {
    if (process.env[name] !== undefined) {
      const rawVal = process.env[name];
      const isValid =
        typeof rawVal === "string" &&
        rawVal.trim().length > 0 &&
        rawVal.trim().toLowerCase() !== "undefined" &&
        rawVal.trim().toLowerCase() !== "null";
      if (isValid) {
        return {
          varName: name,
          isConfigured: true,
          value: rawVal.trim(),
        };
      }
    }
  }

  return {
    varName: "DATA_GOV_SG_API_KEY",
    isConfigured: false,
    value: null,
  };
}

export function isKeyConfigured() {
  return getCredentialInfo().isConfigured;
}

export async function fetchTwoHourForecastUpstream(apiKey = null) {
  const headers = {
    Accept: "application/json",
  };

  // Only attach key if non-empty string and not literal "undefined"
  if (
    typeof apiKey === "string" &&
    apiKey.trim().length > 0 &&
    apiKey.trim().toLowerCase() !== "undefined"
  ) {
    headers["x-api-key"] = apiKey.trim();
  }

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  try {
    const response = await fetch(UPSTREAM_URL, {
      method: "GET",
      headers,
      signal: controller.signal,
    });

    return {
      answered: true,
      status: response.status,
      ok: response.ok,
      response,
      error: null,
    };
  } catch (err) {
    const isTimeout = err?.name === "AbortError";
    return {
      answered: false,
      status: null,
      ok: false,
      response: null,
      isTimeout,
      error: err,
    };
  } finally {
    clearTimeout(timer);
  }
}

export function sendJson(res, statusCode, data) {
  if (typeof res.status === "function") {
    res.status(statusCode);
    if (typeof res.json === "function") {
      return res.json(data);
    }
    if (typeof res.send === "function") {
      return res.send(JSON.stringify(data));
    }
  }
  res.statusCode = statusCode;
  if (typeof res.setHeader === "function") {
    res.setHeader("Content-Type", "application/json");
  }
  if (typeof res.json === "function") {
    return res.json(data);
  }
  if (typeof res.end === "function") {
    return res.end(JSON.stringify(data));
  }
}
