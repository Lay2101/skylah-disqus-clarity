import React, { useState, useEffect, useCallback, useRef } from "react";
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

// Key used to remember the visitor's chosen forecast area in this browser
const AREA_STORAGE_KEY = "skylah_area";

function readSavedArea(): string | null {
  try {
    const saved = window.localStorage.getItem(AREA_STORAGE_KEY);
    return saved && saved.trim() ? saved : null;
  } catch (_err) {
    // Storage blocked (private mode, disabled cookies): the app still works without it
    return null;
  }
}

function saveArea(areaName: string) {
  try {
    window.localStorage.setItem(AREA_STORAGE_KEY, areaName);
  } catch (_err) {
    // Storage blocked: nothing to do, the choice still applies for this visit
  }
}

export default function App() {
  // Start from the area chosen on a previous visit, if there is one; otherwise City
  const [initialSavedArea] = useState<string | null>(() => readSavedArea());
  const [selectedAreaName, setSelectedAreaName] = useState<string>(
    initialSavedArea || "City"
  );
  // True while the area shown came from a previous visit rather than a choice made now
  const [isRememberedArea, setIsRememberedArea] = useState<boolean>(
    Boolean(initialSavedArea)
  );
  const selectedAreaRef = useRef<string>(selectedAreaName);
  selectedAreaRef.current = selectedAreaName;
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

      // Keep the area the visitor has selected (or remembered) on every fetch and Retry.
      // Fall back to City, then the first area, only if that area is not in the data.
      const currentArea = selectedAreaRef.current;
      const match = data.areas.find(
        (a) => a.name.toLowerCase() === currentArea.toLowerCase()
      );
      if (match) {
        setSelectedAreaName(match.name);
      } else {
        const city = data.areas.find((a) => a.name.toLowerCase() === "city");
        setSelectedAreaName(city ? city.name : data.areas[0].name);
        setIsRememberedArea(false);
      }
    } catch (_err) {
      // Network failure / client offline / DNS unreachable
      setForecastState("unreachable");
      setStatusSentence("We couldn’t reach the weather service. Please try again shortly.");
    }
  }, []);

  useEffect(() => {
    fetchWeather();
  }, [fetchWeather]);

  // An explicit choice (dropdown, quick switch or All Areas list) is saved for next visit
  const handleSelectArea = (areaName: string) => {
    setSelectedAreaName(areaName);
    setIsRememberedArea(false);
    saveArea(areaName);
  };

  const handleSelectAreaAndOpenToday = (areaName: string) => {
    handleSelectArea(areaName);
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
            isRememberedArea={isRememberedArea}
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
