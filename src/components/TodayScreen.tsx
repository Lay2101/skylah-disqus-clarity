import React, { useState } from "react";
import {
  MapPin,
  Clock,
  AlertTriangle,
  RefreshCw,
  Calendar,
  HelpCircle,
} from "lucide-react";
import { formatSingaporeTime, isForecastExpired } from "../data/weatherData";
import { WeatherIcon } from "./WeatherIcon";
import { TipCard } from "./TipCard";
import { AudienceType } from "../data/weatherSuggestions";

export type ForecastState =
  | "loading"
  | "success"
  | "empty"
  | "not_found"
  | "timeout"
  | "unreachable"
  | "refused"
  | "invalid_response";

interface TodayScreenProps {
  selectedAreaName: string;
  allAreas: Array<{ name: string; forecast: string }>;
  onSelectArea: (areaName: string) => void;
  forecastState?: ForecastState;
  statusSentence?: string;
  isLoading: boolean;
  errorMessage: string | null;
  validPeriod: { start: string | null; end: string | null; text: string | null } | null;
  sourceTimestamps: { updateTimestamp: string | null; timestamp: string | null } | null;
  onRetry?: () => void;
}

export const TodayScreen: React.FC<TodayScreenProps> = ({
  selectedAreaName,
  allAreas,
  onSelectArea,
  forecastState = "loading",
  statusSentence,
  isLoading,
  validPeriod,
  sourceTimestamps,
  onRetry,
}) => {
  // Audience selection state defaults to "just_me"
  const [selectedAudience, setSelectedAudience] = useState<AudienceType>("just_me");

  // Find current area forecast
  const currentArea = allAreas.find(
    (a) => a.name.toLowerCase() === selectedAreaName.toLowerCase()
  );
  const realForecastText = currentArea?.forecast || "";

  // Check if forecast timestamp is older than validity
  const isStale = isForecastExpired(validPeriod?.end || sourceTimestamps?.updateTimestamp || null);

  // Forecast is valid and fresh only when API returned success, has a forecast description, and is not expired
  const isValidAndFresh =
    forecastState === "success" &&
    !isLoading &&
    Boolean(realForecastText) &&
    !isStale;

  // Quick areas for convenient mobile switching
  const quickAreas = ["City", "Ang Mo Kio", "Bedok", "Jurong West", "Woodlands", "Tampines"];

  return (
    <div className="space-y-4 pb-6">
      {/* Location Selector Card */}
      <section
        id="location-selector-card"
        className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200 shadow-xs"
      >
        <label
          htmlFor="neighbourhood-select"
          className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2 flex items-center gap-1.5"
        >
          <MapPin className="w-4 h-4 text-sky-700" aria-hidden="true" />
          Select Forecast Area (data.gov.sg)
        </label>

        <div className="relative">
          <select
            id="neighbourhood-select"
            value={selectedAreaName}
            onChange={(e) => onSelectArea(e.target.value)}
            disabled={allAreas.length === 0}
            className={`w-full min-h-[52px] text-lg font-bold text-slate-900 bg-slate-50 border-2 rounded-xl px-4 py-2.5 focus:border-sky-600 focus:bg-white focus:outline-hidden focus:ring-3 focus:ring-sky-100 transition-colors ${
              allAreas.length === 0 && !isLoading
                ? "border-amber-300 bg-amber-50/40 text-slate-600"
                : "border-slate-300"
            }`}
          >
            {isLoading ? (
              <option value="City" disabled>
                Loading forecast areas…
              </option>
            ) : allAreas.length === 0 ? (
              <option value="City" disabled>
                Forecast areas unavailable
              </option>
            ) : (
              allAreas.map((item) => (
                <option key={item.name} value={item.name} className="text-base py-1">
                  {item.name}
                </option>
              ))
            )}
          </select>
        </div>

        {/* Inline error notice below selector if areas failed to load */}
        {allAreas.length === 0 && !isLoading && (
          <div
            id="location-selector-error"
            className="mt-2.5 p-3 bg-amber-50 border border-amber-200 rounded-xl flex items-center justify-between gap-2 text-xs text-amber-900"
          >
            <div className="flex items-center gap-2 min-w-0">
              <AlertTriangle className="w-4 h-4 text-amber-700 shrink-0" aria-hidden="true" />
              <span className="truncate">
                Forecast areas unavailable. {statusSentence || "Please check connection."}
              </span>
            </div>
            {onRetry && (
              <button
                type="button"
                onClick={onRetry}
                className="px-2.5 py-1 bg-amber-800 hover:bg-amber-900 text-white font-semibold rounded-md transition-colors shrink-0 cursor-pointer text-xs"
              >
                Retry
              </button>
            )}
          </div>
        )}

        {/* Quick Tap Area Chips */}
        {allAreas.length > 0 && (
          <div className="mt-3 pt-3 border-t border-slate-100">
            <p className="text-xs text-slate-500 font-medium mb-2">Quick switch area:</p>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {quickAreas.map((areaName) => {
                const isSelected = selectedAreaName.toLowerCase() === areaName.toLowerCase();
                const exists = allAreas.some((a) => a.name.toLowerCase() === areaName.toLowerCase());
                if (!exists) return null;

                return (
                  <button
                    key={areaName}
                    id={`quick-select-${areaName.toLowerCase().replace(/\s+/g, "-")}`}
                    onClick={() => onSelectArea(areaName)}
                    type="button"
                    className={`min-h-[44px] px-3 py-2 text-left text-sm font-medium rounded-lg border transition-all flex items-center justify-between ${
                      isSelected
                        ? "bg-sky-700 text-white border-sky-700 font-semibold shadow-xs"
                        : "bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100 cursor-pointer"
                    }`}
                  >
                    <span className="truncate">{areaName}</span>
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </section>

      {/* Connected 2-Hour Weather Forecast Card */}
      <section
        id="today-weather-summary-card"
        className="bg-white rounded-2xl border-2 border-sky-600 p-5 shadow-xs relative overflow-hidden"
      >
        {/* Header with location & connection badge */}
        <div className="border-b border-slate-100 pb-3 mb-4">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-sky-900 bg-sky-100 px-3 py-1 rounded-full border border-sky-300">
              2-Hour Forecast
            </span>
            {sourceTimestamps?.updateTimestamp && (
              <span className="text-xs font-semibold text-slate-600 flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-slate-400" />
                Updated: {formatSingaporeTime(sourceTimestamps.updateTimestamp)} SGT
              </span>
            )}
          </div>

          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-2 flex items-center gap-2">
            <MapPin className="w-6 h-6 text-sky-700 shrink-0" aria-hidden="true" />
            <span>{selectedAreaName}</span>
          </h1>

          {/* Validity Period in Singapore Time */}
          {validPeriod && (
            <p className="text-xs sm:text-sm text-slate-600 mt-1 flex items-center gap-1.5 font-medium">
              <Calendar className="w-4 h-4 text-sky-700 shrink-0" />
              <span>
                Valid:{" "}
                <strong className="text-slate-800 font-semibold">
                  {validPeriod.text
                    ? `${validPeriod.text} SGT`
                    : `${formatSingaporeTime(validPeriod.start)} to ${formatSingaporeTime(validPeriod.end)} SGT`}
                </strong>
              </span>
            </p>
          )}
        </div>

        {/* Stale Data Warning if expired */}
        {isStale && sourceTimestamps?.updateTimestamp && (
          <div
            id="stale-forecast-warning"
            className="mb-4 p-3 bg-amber-50 border border-amber-300 rounded-xl text-amber-950 text-xs flex items-start gap-2"
          >
            <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold">Notice:</span> The latest forecast timestamp from
              data.gov.sg has expired (last updated at{" "}
              {formatSingaporeTime(sourceTimestamps.updateTimestamp)} SGT).
            </div>
          </div>
        )}

        {/* State 1: Loading */}
        {forecastState === "loading" && (
          <div
            id="weather-state-loading"
            className="py-10 text-center space-y-3 bg-slate-50 rounded-xl border border-slate-200"
          >
            <div className="flex justify-center">
              <RefreshCw className="w-8 h-8 text-sky-600 animate-spin" />
            </div>
            <p className="text-base font-semibold text-slate-800">
              Getting the latest two-hour forecast…
            </p>
          </div>
        )}

        {/* State 2: Route Not Found (404) */}
        {forecastState === "not_found" && (
          <div
            id="weather-state-not-found"
            className="py-8 px-4 text-center space-y-3 bg-amber-50 rounded-xl border border-amber-300 text-amber-950"
          >
            <div className="flex justify-center">
              <AlertTriangle className="w-8 h-8 text-amber-700" />
            </div>
            <p className="text-base font-bold leading-relaxed max-w-sm mx-auto">
              {statusSentence || "The weather endpoint was not found on this server."}
            </p>
            {onRetry && (
              <button
                type="button"
                onClick={onRetry}
                className="mt-2 min-h-[44px] px-4 py-2 bg-amber-800 hover:bg-amber-900 text-white text-sm font-semibold rounded-lg transition-colors inline-flex items-center gap-2 cursor-pointer"
              >
                <RefreshCw className="w-4 h-4" />
                Retry
              </button>
            )}
          </div>
        )}

        {/* State 3: Upstream Timeout (504) */}
        {forecastState === "timeout" && (
          <div
            id="weather-state-timeout"
            className="py-8 px-4 text-center space-y-3 bg-amber-50 rounded-xl border border-amber-300 text-amber-950"
          >
            <div className="flex justify-center">
              <Clock className="w-8 h-8 text-amber-700" />
            </div>
            <p className="text-base font-bold leading-relaxed max-w-sm mx-auto">
              {statusSentence || "The weather service request timed out. Please try again shortly."}
            </p>
            {onRetry && (
              <button
                type="button"
                onClick={onRetry}
                className="mt-2 min-h-[44px] px-4 py-2 bg-amber-800 hover:bg-amber-900 text-white text-sm font-semibold rounded-lg transition-colors inline-flex items-center gap-2 cursor-pointer"
              >
                <RefreshCw className="w-4 h-4" />
                Retry
              </button>
            )}
          </div>
        )}

        {/* State 4: Upstream Refused (401, 403, 429) */}
        {forecastState === "refused" && (
          <div
            id="weather-state-refused"
            className="py-8 px-4 text-center space-y-3 bg-amber-50 rounded-xl border border-amber-300 text-amber-950"
          >
            <div className="flex justify-center">
              <AlertTriangle className="w-8 h-8 text-amber-700" />
            </div>
            <p className="text-base font-bold leading-relaxed max-w-sm mx-auto">
              {statusSentence || "The weather service declined this request. Please try again later."}
            </p>
            {onRetry && (
              <button
                type="button"
                onClick={onRetry}
                className="mt-2 min-h-[44px] px-4 py-2 bg-amber-800 hover:bg-amber-900 text-white text-sm font-semibold rounded-lg transition-colors inline-flex items-center gap-2 cursor-pointer"
              >
                <RefreshCw className="w-4 h-4" />
                Retry
              </button>
            )}
          </div>
        )}

        {/* State 5: Upstream Unreachable (Network / DNS error) */}
        {forecastState === "unreachable" && (
          <div
            id="weather-state-unreachable"
            className="py-8 px-4 text-center space-y-3 bg-rose-50 rounded-xl border border-rose-200 text-rose-950"
          >
            <div className="flex justify-center">
              <AlertTriangle className="w-8 h-8 text-rose-600" />
            </div>
            <p className="text-base font-bold leading-relaxed max-w-sm mx-auto">
              {statusSentence || "We couldn’t reach the weather service. Please try again shortly."}
            </p>
            {onRetry && (
              <button
                type="button"
                onClick={onRetry}
                className="mt-2 min-h-[44px] px-4 py-2 bg-rose-700 hover:bg-rose-800 text-white text-sm font-semibold rounded-lg transition-colors inline-flex items-center gap-2 cursor-pointer"
              >
                <RefreshCw className="w-4 h-4" />
                Retry
              </button>
            )}
          </div>
        )}

        {/* State 6: Invalid Response Structure (502) */}
        {forecastState === "invalid_response" && (
          <div
            id="weather-state-invalid-response"
            className="py-8 px-4 text-center space-y-3 bg-rose-50 rounded-xl border border-rose-200 text-rose-950"
          >
            <div className="flex justify-center">
              <AlertTriangle className="w-8 h-8 text-rose-600" />
            </div>
            <p className="text-base font-bold leading-relaxed max-w-sm mx-auto">
              {statusSentence || "The weather service returned an invalid response. Please try again shortly."}
            </p>
            {onRetry && (
              <button
                type="button"
                onClick={onRetry}
                className="mt-2 min-h-[44px] px-4 py-2 bg-rose-700 hover:bg-rose-800 text-white text-sm font-semibold rounded-lg transition-colors inline-flex items-center gap-2 cursor-pointer"
              >
                <RefreshCw className="w-4 h-4" />
                Retry
              </button>
            )}
          </div>
        )}

        {/* State 7: Empty Data */}
        {(forecastState === "empty" || (forecastState === "success" && !realForecastText)) && (
          <div
            id="weather-state-empty"
            className="py-8 px-4 text-center space-y-2 bg-slate-50 rounded-xl border border-slate-200"
          >
            <HelpCircle className="w-8 h-8 text-slate-400 mx-auto" />
            <p className="text-base font-semibold text-slate-700">
              No forecast is available for this area right now.
            </p>
          </div>
        )}

        {/* State 8: Live Sourced Forecast Display */}
        {forecastState === "success" && realForecastText && (
          <div
            id="weather-state-success"
            className="bg-sky-50/60 p-5 rounded-xl border border-sky-200"
          >
            <div className="text-xs font-bold uppercase tracking-wider text-sky-800 mb-2">
              Current Forecast Description
            </div>
            <div className="flex items-center gap-4">
              <div className="p-3.5 bg-white rounded-xl shadow-xs border border-sky-100 shrink-0">
                <WeatherIcon condition={realForecastText} className="w-14 h-14" size={56} />
              </div>
              <div className="min-w-0">
                <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight leading-tight">
                  {realForecastText}
                </div>
                <div className="text-xs text-slate-600 font-medium mt-1">
                  Area: <strong className="text-slate-800">{selectedAreaName}</strong>
                </div>
              </div>
            </div>
          </div>
        )}
      </section>

      {/* "A little tip for your day" Card below the real forecast */}
      <TipCard
        forecastText={realForecastText}
        selectedAreaName={selectedAreaName}
        validPeriod={validPeriod}
        selectedAudience={selectedAudience}
        onSelectAudience={(aud) => setSelectedAudience(aud)}
        isValidAndFresh={isValidAndFresh}
      />
    </div>
  );
};
