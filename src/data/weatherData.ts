/**
 * Singapore Weather Helpers
 * Utilities for formatting Singapore time and dates for data.gov.sg forecasts.
 */

/**
 * Helper to format ISO timestamp into Singapore Time (SGT, 12-hour am/pm).
 */
export function formatSingaporeTime(dateStr?: string | null): string {
  if (!dateStr) return "N/A";
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    return new Intl.DateTimeFormat("en-SG", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
      timeZone: "Asia/Singapore",
    }).format(d);
  } catch {
    return dateStr;
  }
}

/**
 * Helper to format access date into UK/Singapore long date (e.g. 14 September 2026).
 */
export function formatSingaporeDate(dateStr?: string | null): string {
  if (!dateStr) return "N/A";
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    return new Intl.DateTimeFormat("en-GB", {
      day: "numeric",
      month: "long",
      year: "numeric",
      timeZone: "Asia/Singapore",
    }).format(d);
  } catch {
    return dateStr;
  }
}

/**
 * Evaluates whether the forecast has expired based on valid_period.end or update_timestamp.
 */
export function isForecastExpired(validPeriodEnd?: string | null): boolean {
  if (!validPeriodEnd) return false;
  try {
    const endTime = new Date(validPeriodEnd).getTime();
    if (isNaN(endTime)) return false;
    return Date.now() > endTime;
  } catch {
    return false;
  }
}
