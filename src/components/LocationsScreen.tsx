import React, { useState } from "react";
import {
  MapPin,
  ChevronRight,
  Check,
  Search,
  Clock,
} from "lucide-react";
import { formatSingaporeTime } from "../data/weatherData";
import { WeatherIcon } from "./WeatherIcon";

interface LocationsScreenProps {
  selectedAreaName: string;
  allAreas: Array<{ name: string; forecast: string }>;
  onSelectAreaAndOpenToday: (areaName: string) => void;
  isLoading: boolean;
  validPeriod: { start: string | null; end: string | null; text: string | null } | null;
  statusSentence?: string;
  onRetry?: () => void;
}

export const LocationsScreen: React.FC<LocationsScreenProps> = ({
  selectedAreaName,
  allAreas,
  onSelectAreaAndOpenToday,
  isLoading,
  validPeriod,
  statusSentence,
  onRetry,
}) => {
  const [searchQuery, setSearchQuery] = useState("");

  const filteredAreas = allAreas.filter((item) =>
    item.name.toLowerCase().includes(searchQuery.toLowerCase().trim())
  );

  return (
    <div className="space-y-4 pb-6">
      {/* Screen Header */}
      <section
        id="locations-header-card"
        className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs"
      >
        <div className="flex items-center justify-between flex-wrap gap-2">
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 flex items-center gap-2">
            <MapPin className="w-6 h-6 text-sky-700" aria-hidden="true" />
            <span>Singapore Areas Comparison</span>
          </h1>
          {validPeriod && (
            <span className="text-xs font-semibold text-sky-800 bg-sky-50 px-2.5 py-1 rounded-full border border-sky-200 flex items-center gap-1">
              <Clock className="w-3.5 h-3.5" />
              Valid: {validPeriod.text || `${formatSingaporeTime(validPeriod.start)} - ${formatSingaporeTime(validPeriod.end)}`}
            </span>
          )}
        </div>

        <p className="text-xs sm:text-sm text-slate-600 mt-1">
          Comparing 2-hour forecasts from data.gov.sg across {allAreas.length} Singapore areas. Tap any area to select it.
        </p>

        {/* Search input for quick lookup */}
        <div className="mt-3 relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            id="locations-search-input"
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search Singapore area (e.g. City, Bedok, Jurong)..."
            className="w-full pl-9 pr-4 py-2 text-sm bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:border-sky-600 focus:outline-hidden focus:ring-2 focus:ring-sky-100"
          />
        </div>
      </section>

      {/* Loading state */}
      {isLoading && allAreas.length === 0 && (
        <div className="py-12 text-center bg-white rounded-2xl border border-slate-200 text-slate-600">
          <p className="text-base font-semibold">Loading Singapore forecast areas…</p>
        </div>
      )}

      {/* Error state if areas failed to load */}
      {!isLoading && allAreas.length === 0 && (
        <div className="py-10 px-4 text-center bg-white rounded-2xl border border-amber-300 text-slate-800 space-y-3">
          <p className="text-base font-bold text-amber-950">
            {statusSentence || "Forecast areas are currently unavailable."}
          </p>
          {onRetry && (
            <button
              type="button"
              onClick={onRetry}
              className="px-4 py-2 bg-amber-800 hover:bg-amber-900 text-white font-semibold text-sm rounded-lg transition-colors cursor-pointer"
            >
              Retry
            </button>
          )}
        </div>
      )}

      {/* Grid / List of Areas */}
      <section
        id="neighbourhoods-comparison-list"
        aria-label="Singapore Forecast Areas"
        className="space-y-2"
      >
        {filteredAreas.map((area) => {
          const isSelected = area.name.toLowerCase() === selectedAreaName.toLowerCase();

          return (
            <button
              key={area.name}
              id={`area-card-${area.name.toLowerCase().replace(/\s+/g, "-")}`}
              type="button"
              onClick={() => onSelectAreaAndOpenToday(area.name)}
              className={`w-full text-left rounded-2xl p-4 border transition-all cursor-pointer flex items-center justify-between gap-3 ${
                isSelected
                  ? "bg-sky-50/90 border-sky-600 ring-2 ring-sky-300 shadow-sm"
                  : "bg-white border-slate-200 hover:border-slate-300 shadow-xs hover:shadow-sm"
              }`}
            >
              {/* Left Side: Name and Selection status */}
              <div className="flex items-center gap-3 min-w-0">
                <div className="p-2 bg-sky-50 rounded-xl shrink-0 border border-sky-100">
                  <WeatherIcon condition={area.forecast} className="w-6 h-6" size={24} />
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-base font-bold text-slate-900 truncate">
                      {area.name}
                    </span>
                    {isSelected && (
                      <span className="inline-flex items-center gap-1 text-[10px] font-black uppercase tracking-wider bg-sky-700 text-white px-2 py-0.5 rounded-full shrink-0">
                        <Check className="w-3 h-3" />
                        Selected
                      </span>
                    )}
                  </div>
                  <span className="text-xs font-semibold text-slate-600 block truncate mt-0.5">
                    {area.forecast}
                  </span>
                </div>
              </div>

              {/* Right Side: View Chevron */}
              <div className="flex items-center gap-1 text-slate-400 shrink-0">
                <ChevronRight className="w-5 h-5 text-sky-700" aria-hidden="true" />
              </div>
            </button>
          );
        })}

        {filteredAreas.length === 0 && (
          <div className="py-8 text-center bg-slate-50 rounded-xl border border-slate-200 text-slate-500 text-sm">
            No Singapore forecast areas matching &ldquo;{searchQuery}&rdquo;.
          </div>
        )}
      </section>
    </div>
  );
};
