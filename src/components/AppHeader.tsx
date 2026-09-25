import React from "react";
import { CloudSun, MapPin } from "lucide-react";

interface AppHeaderProps {
  selectedAreaName: string;
  onOpenLocations: () => void;
}

export const AppHeader: React.FC<AppHeaderProps> = ({
  selectedAreaName,
  onOpenLocations,
}) => {
  return (
    <header
      id="app-main-header"
      className="bg-sky-900 text-white px-4 py-3.5 shadow-xs sticky top-0 z-30"
    >
      <div className="max-w-md mx-auto flex items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="p-2 bg-sky-800 rounded-xl text-amber-300 border border-sky-700">
            <CloudSun className="w-6 h-6" aria-hidden="true" />
          </div>
          <div>
            <div className="text-xl font-black tracking-tight text-white flex items-center gap-1.5">
              <span>SkyLah</span>
              <span className="text-[10px] font-semibold uppercase tracking-wider bg-sky-700/90 text-sky-100 px-1.5 py-0.5 rounded-sm">
                SG Weather
              </span>
            </div>
            <p className="text-[11px] text-sky-200 leading-tight">
              Commuter & outdoor decision helper
            </p>
          </div>
        </div>

        <button
          id="header-location-badge-button"
          type="button"
          onClick={onOpenLocations}
          className="min-h-[44px] flex items-center gap-1.5 bg-sky-800/90 hover:bg-sky-700 text-white text-xs font-semibold px-3 py-1.5 rounded-xl border border-sky-700/80 transition-colors shadow-xs cursor-pointer"
          title="Switch Singapore area"
        >
          <MapPin className="w-3.5 h-3.5 text-amber-300 shrink-0" aria-hidden="true" />
          <span className="max-w-[120px] truncate">{selectedAreaName}</span>
        </button>
      </div>
    </header>
  );
};
