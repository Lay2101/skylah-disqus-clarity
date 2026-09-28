import React, { useState, useEffect, useCallback, useRef } from "react";
import { AppHeader } from "./components/AppHeader";
import { SourceAttributionBanner } from "./components/SourceAttributionBanner";
import { Navigation, ScreenId } from "./components/Navigation";
import { TodayScreen, ForecastState } from "./components/TodayScreen";
import { LocationsScreen } from "./components/LocationsScreen";
import { DisqusComments } from "./components/DisqusComments";
import { FooterAttribution } from "./components/FooterAttribution";
import { isForecastExpired } from "./data/weatherData";

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

  // Quiet refresh state: the old forecast stays readable while a newer one is fetched
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [refreshNote, setRefreshNote] = useState<string | null>(null);
  const hasForecastRef = useRef<boolean>(false);
  hasForecastRef.current = forecastState === "success" && areas.length > 0;
  const validEndRef = useRef<string | null>(null);
  validEndRef.current = validPeriod?.end || sourceTimestamps?.updateTimestamp || null;
  const refreshingRef = useRef<boolean>(false);

  // Fetch all areas from our serverless function (/api/weather).
  // quiet = true keeps the current forecast on screen instead of showing the loading state.
  const loadForecast = useCallback(async (quiet: boolean) => {
    const keepOnScreen = quiet && hasForecastRef.current;

    // A failure during a quiet refresh keeps the current forecast and explains what happened
    const fail = (state: ForecastState, message: string) => {
      if (keepOnScreen) {
        setRefreshNote(`Couldn’t get a newer forecast: ${message}`);
      } else {
        setForecastState(state);
        setStatusSentence(message);
      }
    };

    if (keepOnScreen) {
      refreshingRef.current = true;
      setIsRefreshing(true);
      setRefreshNote(null);
    } else {
      setForecastState("loading");
      setStatusSentence("Getting the latest two-hour forecast…");
    }

    try {
      const response = await fetch("/api/weather", {
        headers: { Accept: "application/json" },
        cache: "no-store",
      });

      const contentType = response.headers.get("content-type") || "";

      // Check for non-JSON responses (e.g. server returning HTML 404 or SPA rewrite)
      if (!contentType.includes("application/json")) {
        if (response.status === 404) {
          fail("not_found", "The weather service endpoint was not found (404).");
        } else {
          fail("invalid_response", "The weather service returned an unexpected response format. Please try again shortly.");
        }
        return;
      }

      const data: WeatherDataResponse = await response.json();

      // Handle serverless function or upstream error responses
      if (!response.ok || data.error) {
        if (response.status === 404 || data.errorType === "not_found") {
          fail("not_found", data.message || "The weather service endpoint was not found (404).");
        } else if (response.status === 504 || data.errorType === "timeout") {
          fail("timeout", data.message || "The weather service request timed out. Please try again shortly.");
        } else if (response.status === 503 || data.errorType === "unreachable") {
          fail("unreachable", data.message || "We couldn’t reach the weather service. Please try again shortly.");
        } else if (response.status === 502 || data.errorType === "invalid_response") {
          fail("invalid_response", data.message || "The weather service returned an unreadable response. Please try again shortly.");
        } else {
          // 401, 403, 429 or other upstream refusal
          fail("refused", data.message || "The weather service declined this request. Please try again later.");
        }
        return;
      }

      // Handle empty forecast data
      if (data.empty || !Array.isArray(data.areas) || data.areas.length === 0) {
        if (keepOnScreen) {
          setRefreshNote("data.gov.sg has no newer forecast right now. Please try again in a few minutes.");
        } else {
          setForecastState("empty");
          setStatusSentence(data.message || "No forecast is available for this area right now.");
          setAreas([]);
        }
        return;
      }

      // Success with live real forecast data
      setForecastState("success");
      setStatusSentence("");
      setAreas(data.areas);
      setSourceTimestamps(data.sourceTimestamps || null);
      setValidPeriod(data.validPeriod || null);
      setRetrievedAt(data.retrievedAt || new Date().toISOString());

      // If the newest forecast published is still past its valid time, say so plainly
      const newEnd = data.validPeriod?.end || data.sourceTimestamps?.updateTimestamp || null;
      if (isForecastExpired(newEnd)) {
        const checkedAt = new Date().toLocaleTimeString("en-SG", {
          hour: "numeric",
          minute: "2-digit",
          timeZone: "Asia/Singapore",
        });
        setRefreshNote(`data.gov.sg hasn’t published a newer forecast yet (checked at ${checkedAt} SGT).`);
      } else {
        setRefreshNote(null);
      }

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
      fail("unreachable", "We couldn’t reach the weather service. Please try again shortly.");
    } finally {
      refreshingRef.current = false;
      setIsRefreshing(false);
    }
  }, []);

  // Full load (first visit and Retry after an error)
  const fetchWeather = useCallback(() => {
    loadForecast(false);
  }, [loadForecast]);

  // "Refresh" / "Get latest forecast": fetch again without hiding the current forecast
  const refreshForecast = useCallback(() => {
    if (refreshingRef.current) return;
    loadForecast(true);
  }, [loadForecast]);

  useEffect(() => {
    fetchWeather();
  }, [fetchWeather]);

  // Re-check the clock every 30 seconds so an expired forecast is flagged at once.
  // This only re-renders the screen; it does not fetch anything.
  const [, setClockTick] = useState<number>(0);
  useEffect(() => {
    const id = window.setInterval(() => setClockTick((t) => t + 1), 30000);
    return () => window.clearInterval(id);
  }, []);

  // When the visitor comes back to the tab, fetch once only if the forecast has expired
  useEffect(() => {
    const onVisible = () => {
      if (document.visibilityState !== "visible") return;
      if (!hasForecastRef.current) return;
      if (isForecastExpired(validEndRef.current)) refreshForecast();
    };
    document.addEventListener("visibilitychange", onVisible);
    return () => document.removeEventListener("visibilitychange", onVisible);
  }, [refreshForecast]);

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
            onRefresh={refreshForecast}
            isRefreshing={isRefreshing}
            refreshNote={refreshNote}
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
