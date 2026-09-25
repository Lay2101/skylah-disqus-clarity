import React from "react";
import {
  Sun,
  CloudSun,
  Cloud,
  CloudDrizzle,
  CloudLightning,
  CloudRain,
  CloudFog,
} from "lucide-react";

interface WeatherIconProps {
  condition?: string | null;
  className?: string;
  size?: number;
}

export const WeatherIcon: React.FC<WeatherIconProps> = ({
  condition = "",
  className = "w-6 h-6",
  size,
}) => {
  const cond = (condition || "").toLowerCase().trim();

  if (cond.includes("thunder") || cond.includes("lightning")) {
    return <CloudLightning className={`text-indigo-600 ${className}`} size={size} aria-hidden="true" />;
  }

  if (cond.includes("heavy rain") || cond.includes("heavy showers") || cond.includes("moderate rain")) {
    return <CloudRain className={`text-blue-700 ${className}`} size={size} aria-hidden="true" />;
  }

  if (cond.includes("shower") || cond.includes("rain") || cond.includes("drizzle")) {
    return <CloudDrizzle className={`text-blue-500 ${className}`} size={size} aria-hidden="true" />;
  }

  if (cond.includes("partly cloudy")) {
    return <CloudSun className={`text-amber-600 ${className}`} size={size} aria-hidden="true" />;
  }

  if (cond.includes("cloudy")) {
    return <Cloud className={`text-slate-500 ${className}`} size={size} aria-hidden="true" />;
  }

  if (cond.includes("hazy") || cond.includes("fog") || cond.includes("mist")) {
    return <CloudFog className={`text-amber-700 ${className}`} size={size} aria-hidden="true" />;
  }

  if (cond.includes("fair") || cond.includes("sunny") || cond.includes("clear")) {
    return <Sun className={`text-amber-500 ${className}`} size={size} aria-hidden="true" />;
  }

  return <CloudSun className={`text-slate-500 ${className}`} size={size} aria-hidden="true" />;
};
