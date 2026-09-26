import React from "react";
import {
  Sparkles,
  Waves,
  TrendingUp,
  Activity,
  Users,
  Star,
  RefreshCw,
  Zap,
} from "lucide-react";
import { ResortKPIs } from "../types";

interface HeaderProps {
  kpis: ResortKPIs;
  onOpenAudit: () => void;
  onSimulateEvent: () => void;
  isSimulating: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  kpis,
  onOpenAudit,
  onSimulateEvent,
  isSimulating,
}) => {
  return (
    <header className="border-b border-amber-200/80 bg-[#fefdfa]/95 backdrop-blur-md sticky top-0 z-30 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between py-3.5 gap-4">
          {/* Logo and Resort Title */}
          <div className="flex items-center space-x-3.5">
            <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-amber-600 via-orange-600 to-amber-800 flex items-center justify-center text-white shadow-sm ring-2 ring-amber-300">
              <Waves className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h1 className="text-xl font-bold tracking-tight text-amber-950 font-serif">
                  Rosalind
                </h1>
              </div>
              <p className="text-xs text-amber-900/80 font-medium flex items-center gap-1.5 mt-0.5">
                <strong className="text-amber-950">Veda Vilas Palace & Ayurvedic Sanctuary</strong>
                <span className="text-amber-400">·</span>
                <span className="text-amber-800/70">Lake Pichola, Udaipur, Rajasthan</span>
              </p>
            </div>
          </div>

          {/* Quick Real-Time Metrics & Global Actions */}
          <div className="flex flex-wrap items-center gap-2 sm:gap-3">
            {/* Real-time KPI Pills */}
            <div className="hidden lg:flex items-center bg-amber-50/70 rounded-lg p-1 text-xs border border-amber-200/80 text-stone-700">
              <div className="px-2.5 py-1 border-r border-amber-200/80 flex items-center gap-1.5">
                <Users className="w-3.5 h-3.5 text-indigo-600" />
                <span>Occ: <strong className="text-stone-900">{kpis.occupancyRate}%</strong></span>
              </div>
              <div className="px-2.5 py-1 border-r border-amber-200/80 flex items-center gap-1.5">
                <TrendingUp className="w-3.5 h-3.5 text-emerald-600" />
                <span>RevPAR: <strong className="text-stone-900">₹{kpis.revPAR.toLocaleString("en-IN")}</strong></span>
              </div>
              <div className="px-2.5 py-1 border-r border-amber-200/80 flex items-center gap-1.5">
                <Activity className="w-3.5 h-3.5 text-amber-700" />
                <span>IoT Health: <strong className="text-stone-900">{kpis.equipmentHealthScore}%</strong></span>
              </div>
              <div className="px-2.5 py-1 flex items-center gap-1.5">
                <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-400" />
                <span>Guest NPS: <strong className="text-stone-900">{kpis.guestSatisfactionScore}</strong></span>
              </div>
            </div>

            {/* Simulate Peak Event Button */}
            <button
              id="simulate-peak-rush-btn"
              onClick={onSimulateEvent}
              disabled={isSimulating}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium text-stone-700 bg-white border border-amber-300/80 hover:bg-amber-50/60 hover:text-stone-900 active:scale-98 transition shadow-xs cursor-pointer"
              title="Simulate weekend surge with sudden IoT alert & dining peak"
            >
              <RefreshCw className={`w-3.5 h-3.5 text-amber-700 ${isSimulating ? "animate-spin" : ""}`} />
              <span className="hidden sm:inline">Simulate</span> Weekend Surge
            </button>

            {/* Run 360 AI Audit Button */}
            <button
              id="run-ai-audit-btn"
              onClick={onOpenAudit}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-semibold text-amber-50 bg-amber-950 hover:bg-amber-900 active:scale-98 transition shadow-sm cursor-pointer ring-1 ring-amber-800"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              <span>Run AI 360 Audit</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
