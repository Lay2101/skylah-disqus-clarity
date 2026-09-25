import {
  fetchTwoHourForecastUpstream,
  sendJson,
} from "./_upstream.js";

/**
 * Health check endpoint reporting:
 * - keyConfigured: boolean (reflects whether process.env.DATA_GOV_SG_API_KEY contains a non-empty value)
 * - upstreamAnswered: boolean (whether the upstream server replied)
 * - upstreamStatus: number | null (HTTP status code returned by upstream)
 *
 * Never prints or logs the credential or any part of it.
 * When configured, uses process.env.DATA_GOV_SG_API_KEY in the x-api-key header for server-side government API requests.
 * Keeps unauthenticated requests working when the variable is absent.
 */
export default async function handler(req, res) {
  if (typeof res.setHeader === "function") {
    res.setHeader("Cache-Control", "no-store, max-age=0");
  }

  const rawKey = process.env.DATA_GOV_SG_API_KEY;
  const keyConfigured =
    typeof rawKey === "string" &&
    rawKey.trim().length > 0 &&
    rawKey.trim().toLowerCase() !== "undefined" &&
    rawKey.trim().toLowerCase() !== "null";

  const apiKey = keyConfigured ? rawKey.trim() : null;
  const upstreamResult = await fetchTwoHourForecastUpstream(apiKey);

  const payload = {
    keyConfigured,
    upstreamAnswered: upstreamResult.answered,
    upstreamStatus: upstreamResult.status,
  };

  return sendJson(res, 200, payload);
}
