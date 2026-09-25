import React from "react";
import { SunMedium, Clock, MapPinned } from "lucide-react";

export type ScreenId = "today" | "locations";

interface NavigationProps {
  activeScreen: ScreenId;
  onNavigate: (screen: ScreenId) => void;
}

export const Navigation: React.FC<NavigationProps> = ({
  activeScreen,
  onNavigate,
}) => {
  const tabs = [
    {
      id: "today" as ScreenId,
      label: "Forecast",
      subtext: "2-Hour Weather",
      icon: SunMedium,
    },
    {
      id: "locations" as ScreenId,
      label: "All Areas",
      subtext: "Compare Areas",
      icon: MapPinned,
    },
  ];

  return (
    <nav
      id="bottom-app-navigation"
      aria-label="Main Navigation"
      className="fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-slate-200 shadow-lg pb-safe"
    >
      <div className="max-w-md mx-auto px-2 py-1.5 flex items-center justify-around">
        {tabs.map((tab) => {
          const isActive = activeScreen === tab.id;
          const IconComponent = tab.icon;

          return (
            <button
              key={tab.id}
              id={`nav-tab-${tab.id}`}
              type="button"
              onClick={() => onNavigate(tab.id)}
              className={`flex-1 min-h-[56px] py-1.5 px-2 flex flex-col items-center justify-center rounded-xl transition-colors cursor-pointer ${
                isActive
                  ? "bg-sky-50 text-sky-900 font-bold"
                  : "text-slate-600 hover:text-slate-900 hover:bg-slate-50 font-medium"
              }`}
            >
              <div
                className={`p-1 rounded-lg transition-transform ${
                  isActive ? "scale-110 text-sky-800" : "text-slate-500"
                }`}
              >
                <IconComponent className="w-6 h-6" aria-hidden="true" />
              </div>
              <span className="text-xs sm:text-sm tracking-tight leading-tight mt-0.5">
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
