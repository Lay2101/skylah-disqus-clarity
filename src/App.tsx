import React, { useState, useEffect, useCallback } from "react";
import { AppHeader } from "./components/AppHeader";
import { SourceAttributionBanner } from "./components/SourceAttributionBanner";
import { Navigation, ScreenId } from "./components/Navigation";
import { TodayScreen, ForecastState } from "./components/TodayScreen";
import { LocationsScreen } from "./components/LocationsScreen";
import { DisqusComments } from "./components/DisqusComments";
import { FooterAttribution } from "./components/FooterAttribution";

export interface WeatherArea {
  name: string;
  forecast: string;
}

export interface WeatherDataResponse {
  areas: WeatherArea[];
  sourceTimestamps: {
    updateTimestamp: string | null;
    timestamp: string | null;
  } | null;
  validPeriod: {
    start: string | null;
    end: string | null;
    text: string | null;
  } | null;
  retrievedAt: string;
  empty?: boolean;
  error?: boolean;
  errorType?: "not_found" | "timeout" | "unreachable" | "refused" | "invalid_response";
  message?: string;
}

export default function App() {
  const [selectedAreaName, setSelectedAreaName] = useState<string>("City");
  const [activeScreen, setActiveScreen] = useState<ScreenId>("today");

  // Distinct states: loading, empty, not_found, timeout, unreachable, refused, invalid_response, success
  const [forecastState, setForecastState] = useState<ForecastState>("loading");
  const [statusSentence, setStatusSentence] = useState<string>(
    "Getting the latest two-hour forecast…"
  );

  // Real weather API state
  const [areas, setAreas] = useState<WeatherArea[]>([]);
  const [sourceTimestamps, setSourceTimestamps] = useState<{
    updateTimestamp: string | null;
    timestamp: string | null;
  } | null>(null);
  const [validPeriod, setValidPeriod] = useState<{
    start: string | null;
    end: string | null;
    text: string | null;
  } | null>(null);
  const [retrievedAt, setRetrievedAt] = useState<string | null>(null);

  // Fetch all areas on mount from our serverless function (/api/weather)
  const fetchWeather = useCallback(async () => {
    setForecastState("loading");
    setStatusSentence("Getting the latest two-hour forecast…");

    try {
      const response = await fetch("/api/weather", {
        headers: { Accept: "application/json" },
      });

      const contentType = response.headers.get("content-type") || "";

      // Check for non-JSON responses (e.g. server returning HTML 404 or SPA rewrite)
      if (!contentType.includes("application/json")) {
        if (response.status === 404) {
          setForecastState("not_found");
          setStatusSentence("The weather service endpoint was not found (404).");
        } else {
          setForecastState("invalid_response");
          setStatusSentence("The weather service returned an unexpected response format. Please try again shortly.");
        }
        return;
      }

      const data: WeatherDataResponse = await response.json();

      // Handle serverless function or upstream error responses
      if (!response.ok || data.error) {
        if (response.status === 404 || data.errorType === "not_found") {
          setForecastState("not_found");
          setStatusSentence(data.message || "The weather service endpoint was not found (404).");
        } else if (response.status === 504 || data.errorType === "timeout") {
          setForecastState("timeout");
          setStatusSentence(data.message || "The weather service request timed out. Please try again shortly.");
        } else if (response.status === 503 || data.errorType === "unreachable") {
          setForecastState("unreachable");
          setStatusSentence(data.message || "We couldn’t reach the weather service. Please try again shortly.");
        } else if (response.status === 502 || data.errorType === "invalid_response") {
          setForecastState("invalid_response");
          setStatusSentence(data.message || "The weather service returned an unreadable response. Please try again shortly.");
        } else {
          // 401, 403, 429 or other upstream refusal
          setForecastState("refused");
          setStatusSentence(data.message || "The weather service declined this request. Please try again later.");
        }
        return;
      }

      // Handle empty forecast data
      if (data.empty || !Array.isArray(data.areas) || data.areas.length === 0) {
        setForecastState("empty");
        setStatusSentence(data.message || "No forecast is available for this area right now.");
        setAreas([]);
        return;
      }

      // Success with live real forecast data
      setForecastState("success");
      setStatusSentence("");
      setAreas(data.areas);
      setSourceTimestamps(data.sourceTimestamps || null);
      setValidPeriod(data.validPeriod || null);
      setRetrievedAt(data.retrievedAt || new Date().toISOString());

      // Default to "City" if available, else retain current or fall back to first area
      setSelectedAreaName((current) => {
        const hasCity = data.areas.some(
          (a) => a.name.toLowerCase() === "city"
        );
        if (hasCity) return "City";
        const exists = data.areas.some(
          (a) => a.name.toLowerCase() === current.toLowerCase()
        );
        return exists ? current : data.areas[0].name;
      });
    } catch (_err) {
      // Network failure / client offline / DNS unreachable
      setForecastState("unreachable");
      setStatusSentence("We couldn’t reach the weather service. Please try again shortly.");
    }
  }, []);

  useEffect(() => {
    fetchWeather();
  }, [fetchWeather]);

  const handleSelectArea = (areaName: string) => {
    setSelectedAreaName(areaName);
  };

  const handleSelectAreaAndOpenToday = (areaName: string) => {
    setSelectedAreaName(areaName);
    setActiveScreen("today");
  };

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900 font-sans antialiased flex flex-col">
      {/* Top Header with Selected Location */}
      <AppHeader
        selectedAreaName={selectedAreaName}
        onOpenLocations={() => setActiveScreen("locations")}
      />

      {/* Official Source Attribution Banner */}
      <SourceAttributionBanner />

      {/* Main Content Area */}
      <main className="flex-1 w-full max-w-md mx-auto px-4 pt-4 pb-24">
        {activeScreen === "today" && (
          <TodayScreen
            selectedAreaName={selectedAreaName}
            allAreas={areas}
            onSelectArea={handleSelectArea}
            forecastState={forecastState}
            statusSentence={statusSentence}
            isLoading={forecastState === "loading"}
            errorMessage={
              forecastState !== "loading" && forecastState !== "success"
                ? statusSentence
                : null
            }
            validPeriod={validPeriod}
            sourceTimestamps={sourceTimestamps}
            onRetry={fetchWeather}
          />
        )}

        {activeScreen === "locations" && (
          <LocationsScreen
            selectedAreaName={selectedAreaName}
            allAreas={areas}
            onSelectAreaAndOpenToday={handleSelectAreaAndOpenToday}
            isLoading={forecastState === "loading"}
            validPeriod={validPeriod}
            statusSentence={statusSentence}
            onRetry={fetchWeather}
          />
        )}

        {activeScreen === "feedback" && (
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-4 sm:p-6 mb-6">
            <DisqusComments />
          </div>
        )}

        {/* Singapore data.gov.sg attribution footer */}
        <FooterAttribution retrievedAt={retrievedAt} />
      </main>

      {/* Persistent Bottom Tab Navigation */}
      <Navigation
        activeScreen={activeScreen}
        onNavigate={(screen) => setActiveScreen(screen)}
      />
    </div>
  );
}
