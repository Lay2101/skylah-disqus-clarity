import weatherHandler from "./weather.js";

/**
 * Skylah Weather Forecasting serverless handler alias.
 * Points to the main /api/weather handler.
 */
export default async function handler(req, res) {
  return weatherHandler(req, res);
}
