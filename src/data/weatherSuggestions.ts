/**
 * Weather Suggestions Module
 *
 * Authored friendly recommendations based strictly on real 2-hour forecast descriptions.
 * - Categorises official NEA/data.gov.sg forecast strings into distinct condition groups.
 * - Enforces thunderstorm priority over general rain rules.
 * - Never claims absolute safety ("You will stay dry", "It is safe outside", "The perfect time").
 * - Does not invent UV index, temperature, or heat warnings.
 * - Uses neutral fallback for unrecognised weather descriptions.
 */

export type AudienceType = "just_me" | "child" | "beloved_ones";

export interface AudienceOption {
  id: AudienceType;
  label: string;
}

export const AUDIENCE_OPTIONS: AudienceOption[] = [
  { id: "just_me", label: "Just me" },
  { id: "child", label: "For my child" },
  { id: "beloved_ones", label: "For my beloved ones" },
];

export interface WeatherSuggestionResult {
  category: "thunderstorm" | "rain" | "sunny" | "cloudy" | "hazy" | "neutral";
  emoji: string;
  badge: string;
  theme: {
    container: string;
    badgeBg: string;
    iconBg: string;
  };
  text: string;
}

/**
 * Maps condition text and audience to authored friendly suggestions.
 * Priority:
 * 1. Thunderstorms / Thundery Showers (takes precedence over general rain)
 * 2. Rain / Showers / Drizzle
 * 3. Sunny / Fair / Clear
 * 4. Cloudy / Partly Cloudy / Overcast
 * 5. Hazy / Mist / Fog
 * 6. Neutral fallback
 */
export function getWeatherSuggestion(
  rawCondition: string | null | undefined,
  audience: AudienceType = "just_me"
): WeatherSuggestionResult {
  const cond = (rawCondition || "").toLowerCase().trim();

  // 1. Thunderstorm rules (MUST take priority over general rain)
  if (
    cond.includes("thunder") ||
    cond.includes("thundery") ||
    cond.includes("lightning")
  ) {
    let text = "Thunderstorms are forecast ⛈️ Consider postponing outdoor plans.";
    if (audience === "child") {
      text = "An indoor adventure could be a better plan today 🧸";
    } else if (audience === "beloved_ones") {
      text = "How about an indoor movie date while the storm passes? 🎬💕";
    }

    return {
      category: "thunderstorm",
      emoji: "⛈️",
      badge: "Thunderstorm Precaution",
      theme: {
        container: "bg-indigo-50/80 border-indigo-200 text-indigo-950",
        badgeBg: "bg-indigo-100 text-indigo-800 border-indigo-200",
        iconBg: "bg-indigo-100/90 text-indigo-700",
      },
      text,
    };
  }

  // 2. General Rain / Showers / Drizzle rules
  if (
    cond.includes("rain") ||
    cond.includes("shower") ||
    cond.includes("drizzle")
  ) {
    let text = "An umbrella might come in handy ☔ Showers are forecast.";
    if (audience === "child") {
      text = "Pack a little raincoat and an umbrella for your outing 🌧️";
    } else if (audience === "beloved_ones") {
      text = "A cosy café date could suit this forecast ☕💕 Bring umbrellas for the journey.";
    }

    return {
      category: "rain",
      emoji: "🌧️",
      badge: "Showers Expected",
      theme: {
        container: "bg-sky-50/80 border-sky-200 text-sky-950",
        badgeBg: "bg-sky-100 text-sky-800 border-sky-200",
        iconBg: "bg-sky-100/90 text-sky-700",
      },
      text,
    };
  }

  // 3. Sunny / Fair / Clear rules
  // (Treat sun protection as a general reminder, not a claim about UV levels; no temperature/heat index claims)
  if (
    cond.includes("sunny") ||
    cond.includes("fair") ||
    cond.includes("clear")
  ) {
    let text = "Heading outside? Remember your sun protection and water ☀️";
    if (audience === "child") {
      text = "Pack hats and water for your little explorer 🧢";
    } else if (audience === "beloved_ones") {
      text = "Fancy a short stroll together? Bring water and check the forecast before leaving 💛";
    }

    return {
      category: "sunny",
      emoji: "☀️",
      badge: "Fair Weather",
      theme: {
        container: "bg-amber-50/80 border-amber-200 text-amber-950",
        badgeBg: "bg-amber-100 text-amber-800 border-amber-200",
        iconBg: "bg-amber-100/90 text-amber-700",
      },
      text,
    };
  }

  // 4. Cloudy / Partly Cloudy / Overcast rules
  // (Do not claim cloudy weather means no rain, low UV, or cool temperatures)
  if (
    cond.includes("cloud") ||
    cond.includes("overcast")
  ) {
    let text = "Cloudy skies ahead ☁️ Check again before heading out.";
    if (audience === "child") {
      text = "Planning a little outing? Check the forecast again before leaving 🎒";
    } else if (audience === "beloved_ones") {
      text = "A little walk and a café stop could be a sweet plan ☕";
    }

    return {
      category: "cloudy",
      emoji: "☁️",
      badge: "Cloudy Skies",
      theme: {
        container: "bg-slate-50 border-slate-200 text-slate-900",
        badgeBg: "bg-slate-200/80 text-slate-700 border-slate-300",
        iconBg: "bg-white text-slate-600 border border-slate-200",
      },
      text,
    };
  }

  // 5. Hazy / Fog / Mist rules
  if (
    cond.includes("hazy") ||
    cond.includes("haze") ||
    cond.includes("mist") ||
    cond.includes("fog")
  ) {
    let text = "Hazy conditions reported 🌫️ Consider quieter indoor activities.";
    if (audience === "child") {
      text = "Hazy skies outside 🌫️ Indoor activities may feel more comfortable today.";
    } else if (audience === "beloved_ones") {
      text = "How about relaxing together indoors today? 🍵 Stay hydrated and comfortable.";
    }

    return {
      category: "hazy",
      emoji: "🌫️",
      badge: "Hazy Conditions",
      theme: {
        container: "bg-stone-50 border-stone-200 text-stone-900",
        badgeBg: "bg-stone-200 text-stone-700 border-stone-300",
        iconBg: "bg-stone-100 text-stone-700",
      },
      text,
    };
  }

  // 6. Neutral fallback for unrecognised weather descriptions
  let neutralText = "Have a gentle day ahead 🌿 Feel free to check the forecast again before leaving.";
  if (audience === "child") {
    textWithAudience(audience);
  }

  function textWithAudience(aud: AudienceType): string {
    if (aud === "child") {
      return "Getting ready to step out? A quick check on the forecast helps plan the trip 🎒";
    }
    if (aud === "beloved_ones") {
      return "Making plans together? Have a peek at the forecast before heading out 💫";
    }
    return neutralText;
  }

  return {
    category: "neutral",
    emoji: "🌱",
    badge: "Daily Thought",
    theme: {
      container: "bg-teal-50/70 border-teal-200 text-teal-950",
      badgeBg: "bg-teal-100 text-teal-800 border-teal-200",
      iconBg: "bg-teal-100 text-teal-700",
    },
    text: textWithAudience(audience),
  };
}
