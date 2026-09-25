import React from "react";
import { Sparkles, Clock, Info } from "lucide-react";
import {
  AudienceType,
  AUDIENCE_OPTIONS,
  getWeatherSuggestion,
} from "../data/weatherSuggestions";
import { formatSingaporeTime } from "../data/weatherData";

interface TipCardProps {
  forecastText: string;
  selectedAreaName: string;
  validPeriod: { start: string | null; end: string | null; text: string | null } | null;
  selectedAudience: AudienceType;
  onSelectAudience: (audience: AudienceType) => void;
  isValidAndFresh: boolean;
}

export const TipCard: React.FC<TipCardProps> = ({
  forecastText,
  selectedAreaName,
  validPeriod,
  selectedAudience,
  onSelectAudience,
  isValidAndFresh,
}) => {
  const suggestion = getWeatherSuggestion(forecastText, selectedAudience);

  const validityLabel = validPeriod?.text
    ? `${validPeriod.text} SGT`
    : validPeriod?.start && validPeriod?.end
    ? `${formatSingaporeTime(validPeriod.start)} to ${formatSingaporeTime(validPeriod.end)} SGT`
    : null;

  return (
    <section
      id="daily-tip-card"
      aria-label="A little tip for your day"
      className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs space-y-4"
    >
      {/* Header & Audience Picker */}
      <div>
        <div className="flex items-center justify-between flex-wrap gap-2 mb-3">
          <h2 className="text-base font-bold text-slate-900 flex items-center gap-1.5">
            <Sparkles className="w-4 h-4 text-amber-500" aria-hidden="true" />
            <span>A little tip for your day</span>
          </h2>
          <span className="text-[11px] font-medium text-slate-500">
            Gentle &amp; optional
          </span>
        </div>

        {/* Audience Selector Tabs: "Just me", "For my child", "For my beloved ones" */}
        <div
          role="radiogroup"
          aria-label="Choose who this tip is for"
          className="grid grid-cols-3 gap-1.5 bg-slate-100 p-1 rounded-xl"
        >
          {AUDIENCE_OPTIONS.map((opt) => {
            const isSelected = selectedAudience === opt.id;
            return (
              <button
                key={opt.id}
                id={`audience-option-${opt.id}`}
                type="button"
                role="radio"
                aria-checked={isSelected}
                onClick={() => onSelectAudience(opt.id)}
                className={`py-2 px-1 text-center text-xs font-semibold rounded-lg transition-all cursor-pointer truncate ${
                  isSelected
                    ? "bg-white text-sky-900 shadow-xs font-bold"
                    : "text-slate-600 hover:text-slate-900 hover:bg-white/50"
                }`}
              >
                {opt.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Tip Content Area */}
      {!isValidAndFresh ? (
        // State when data is missing, loading, or expired
        <div
          id="tip-waiting-notice"
          className="p-4 rounded-xl bg-amber-50/70 border border-amber-200 text-amber-950 flex items-start gap-3"
        >
          <Clock className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" aria-hidden="true" />
          <div>
            <p className="text-sm font-semibold leading-relaxed">
              We’re waiting for an up-to-date forecast before suggesting a plan.
            </p>
            <p className="text-xs text-amber-800/80 mt-1">
              Suggestions appear automatically once a current forecast is confirmed.
            </p>
          </div>
        </div>
      ) : (
        // Live Suggestion Card (Soft pastel theme matching category)
        <div
          id="tip-suggestion-box"
          className={`p-4 rounded-xl border transition-colors ${suggestion.theme.container}`}
        >
          <div className="flex items-start gap-3">
            {/* Small weather emoji in soft round badge */}
            <div
              className={`w-10 h-10 rounded-xl flex items-center justify-center text-xl shrink-0 ${suggestion.theme.iconBg}`}
              aria-hidden="true"
            >
              {suggestion.emoji}
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                <span
                  className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md border ${suggestion.theme.badgeBg}`}
                >
                  {suggestion.badge}
                </span>
                <span className="text-[11px] text-slate-500 font-medium">
                  for {AUDIENCE_OPTIONS.find((a) => a.id === selectedAudience)?.label.toLowerCase()}
                </span>
              </div>

              {/* Suggestion text */}
              <p className="text-base font-bold text-slate-900 leading-snug">
                {suggestion.text}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Provenance & Attribution Footer under card */}
      <div
        id="tip-provenance-footer"
        className="pt-2 border-t border-slate-100 space-y-1 text-xs text-slate-500"
      >
        <div className="flex items-start gap-1.5">
          <Info className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" aria-hidden="true" />
          <div className="leading-relaxed">
            {forecastText ? (
              <span>
                Based on: <strong className="text-slate-700 font-semibold">{forecastText}</strong> ·{" "}
                <span className="text-slate-700 font-medium">{selectedAreaName}</span>
                {validityLabel && (
                  <span className="text-slate-500 block sm:inline sm:ml-1">
                    ({validityLabel})
                  </span>
                )}
              </span>
            ) : (
              <span>Based on: Live forecast · {selectedAreaName}</span>
            )}
          </div>
        </div>

        <p className="text-[11px] text-slate-400 pl-5">
          Suggestion by SkyLah; forecast from data.gov.sg.
        </p>
      </div>
    </section>
  );
};
