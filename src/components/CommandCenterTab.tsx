import React, { useState } from "react";
import {
  CheckCircle2,
  Sparkles,
  TrendingUp,
  Activity,
  Users,
  ShieldCheck,
  Zap,
  Clock,
  ArrowRight,
  DollarSign,
  HeartHandshake,
  Bot,
  MessageSquare,
  AlertTriangle,
  Info,
} from "lucide-react";
import { ResortKPIs, OperationalAlert } from "../types";
import { AutonomousOperationsEngine } from "./AutonomousOperationsEngine";

interface CommandCenterTabProps {
  kpis: ResortKPIs;
  alerts: OperationalAlert[];
  onResolveAlert: (alertId: string) => void;
  onNavigateTab: (tabId: string) => void;
  onTriggerAudit: () => void;
}

export const CommandCenterTab: React.FC<CommandCenterTabProps> = ({
  kpis,
  alerts,
  onResolveAlert,
  onNavigateTab,
  onTriggerAudit,
}) => {
  const [executingAlertId, setExecutingAlertId] = useState<string | null>(null);
  const [executionMessage, setExecutionMessage] = useState<string | null>(null);

  const handleExecuteWorkflow = (alert: OperationalAlert) => {
    setExecutingAlertId(alert.id);
    setTimeout(() => {
      onResolveAlert(alert.id);
      setExecutingAlertId(null);
      setExecutionMessage(
        `Action Completed: "${alert.actionTitle}" dispatched via AI automation.`
      );
      setTimeout(() => setExecutionMessage(null), 5000);
    }, 800);
  };

  const activeAlerts = alerts.filter((a) => !a.resolved);
  const resolvedAlerts = alerts.filter((a) => a.resolved);

  return (
    <div className="space-y-6">
      {/* Toast notification for completed actions */}
      {executionMessage && (
        <div className="bg-emerald-50 border border-emerald-300 text-emerald-900 px-4 py-3 rounded-xl flex items-center justify-between shadow-xs animate-in fade-in duration-200">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            <span className="text-sm font-medium">{executionMessage}</span>
          </div>
          <button
            onClick={() => setExecutionMessage(null)}
            className="text-xs font-semibold text-emerald-700 hover:text-emerald-900 cursor-pointer"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Simplified, Welcoming Executive Banner */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-7 shadow-xs relative overflow-hidden">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="flex items-center gap-2 text-xs font-semibold text-teal-800 bg-teal-50 px-3 py-1 rounded-full w-fit border border-teal-200">
              <span className="w-2 h-2 rounded-full bg-teal-500 animate-pulse"></span>
              <span>Resort Status: Healthy & Proactive</span>
            </div>
            <h2 className="text-2xl font-bold font-serif text-slate-900">
              Khamaghani, General Manager
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              Veda Vilas Palace is running at <strong>88% occupancy</strong> with exceptional royal guest satisfaction (<strong>4.82/5.0</strong>).
              Sensors caught 1 minor Kund stepwell pool pump vibration for preventive repair tonight, and weekend palace heritage rates are prepped for extra yield.
            </p>
          </div>

          {/* Quick Direct Actions */}
          <div className="flex flex-wrap sm:flex-nowrap items-center gap-2.5 shrink-0">
            <button
              onClick={() => onNavigateTab("concierge")}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold text-slate-900 bg-teal-50 border border-teal-300 hover:bg-teal-100 transition cursor-pointer shadow-2xs"
            >
              <MessageSquare className="w-4 h-4 text-teal-700" />
              <span>Ask AI: How Things Are Going</span>
            </button>

            <button
              onClick={onTriggerAudit}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 transition cursor-pointer shadow-2xs"
            >
              <Sparkles className="w-4 h-4 text-amber-300" />
              <span>360 AI Deep Audit</span>
            </button>
          </div>
        </div>
      </div>

      {/* 4 Clean, Readable Health Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Equipment Health */}
        <div
          onClick={() => onNavigateTab("operations")}
          className="bg-white p-5 rounded-2xl border border-slate-200 hover:border-teal-400 hover:shadow-xs transition cursor-pointer group"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Equipment Health
            </span>
            <div className="w-8 h-8 rounded-lg bg-teal-50 text-teal-700 flex items-center justify-center">
              <Activity className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-slate-900 mb-1">
            {kpis.equipmentHealthScore}%
          </div>
          <p className="text-xs text-amber-700 font-medium mb-3 flex items-center gap-1">
            <AlertTriangle className="w-3.5 h-3.5" />
            <span>Kund Pool Pump #2 flagged (silent repair)</span>
          </p>
          <div className="flex items-center text-xs font-semibold text-teal-700 group-hover:translate-x-0.5 transition">
            <span>View Sensor Telemetry</span>
            <ArrowRight className="w-3.5 h-3.5 ml-1" />
          </div>
        </div>

        {/* Card 2: Staff Coverage */}
        <div
          onClick={() => onNavigateTab("staffing")}
          className="bg-white p-5 rounded-2xl border border-slate-200 hover:border-indigo-400 hover:shadow-xs transition cursor-pointer group"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Staff & Shifts
            </span>
            <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-700 flex items-center justify-center">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-slate-900 mb-1">
            {kpis.staffCoverageRatio}%
          </div>
          <p className="text-xs text-indigo-700 font-medium mb-3">
            Singhania wedding turnover (11:30) load balanced
          </p>
          <div className="flex items-center text-xs font-semibold text-indigo-700 group-hover:translate-x-0.5 transition">
            <span>View Shift Schedules</span>
            <ArrowRight className="w-3.5 h-3.5 ml-1" />
          </div>
        </div>

        {/* Card 3: Guest Satisfaction */}
        <div
          onClick={() => onNavigateTab("concierge")}
          className="bg-white p-5 rounded-2xl border border-slate-200 hover:border-amber-400 hover:shadow-xs transition cursor-pointer group"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Guest Experience
            </span>
            <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-700 flex items-center justify-center">
              <HeartHandshake className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-slate-900 mb-1">
            {kpis.guestSatisfactionScore} <span className="text-sm font-normal text-slate-400">/ 5.0</span>
          </div>
          <p className="text-xs text-emerald-700 font-medium mb-3">
            94% Positive Sentiment across havelis & suites
          </p>
          <div className="flex items-center text-xs font-semibold text-amber-700 group-hover:translate-x-0.5 transition">
            <span>Open AI Concierge Chat</span>
            <ArrowRight className="w-3.5 h-3.5 ml-1" />
          </div>
        </div>

        {/* Card 4: Daily Revenue */}
        <div
          onClick={() => onNavigateTab("revenue")}
          className="bg-white p-5 rounded-2xl border border-slate-200 hover:border-emerald-400 hover:shadow-xs transition cursor-pointer group"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
              RevPAR & Revenue
            </span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-slate-900 mb-1">
            ₹{kpis.revPAR.toLocaleString("en-IN")}
          </div>
          <p className="text-xs text-emerald-700 font-medium mb-3">
            +₹24,50,000 weekend upside identified
          </p>
          <div className="flex items-center text-xs font-semibold text-emerald-700 group-hover:translate-x-0.5 transition">
            <span>Review Dynamic Pricing</span>
            <ArrowRight className="w-3.5 h-3.5 ml-1" />
          </div>
        </div>
      </div>

      {/* Autonomous Operational Manager: Quick Action Bar & Live Resolution Engine */}
      <AutonomousOperationsEngine onNavigateTab={onNavigateTab} />

      {/* Simplified, Clear Actionable Tasks */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Zap className="w-4 h-4 text-amber-500 fill-amber-400" />
              <span>Recommended Operational Actions</span>
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Click once to approve AI mitigations across departments without manual paperwork.
            </p>
          </div>

          {activeAlerts.length > 0 && (
            <span className="px-2.5 py-1 text-xs font-bold bg-amber-100 text-amber-800 rounded-full border border-amber-200">
              {activeAlerts.length} Action Ready
            </span>
          )}
        </div>

        {activeAlerts.length === 0 ? (
          <div className="text-center py-8 bg-slate-50 rounded-xl border border-dashed border-slate-200">
            <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto mb-1.5" />
            <p className="text-xs font-bold text-slate-800">All departments are operating smoothly</p>
            <p className="text-xs text-slate-500">No urgent manual approvals needed right now.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {activeAlerts.map((alert) => {
              const isExecuting = executingAlertId === alert.id;

              return (
                <div
                  key={alert.id}
                  className="p-4 rounded-xl border border-slate-200 bg-slate-50/70 hover:bg-slate-50 transition flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-white border border-slate-200 text-slate-700">
                        {alert.department}
                      </span>
                      <strong className="text-xs sm:text-sm font-bold text-slate-900">
                        {alert.title}
                      </strong>
                    </div>
                    <p className="text-xs text-slate-600">
                      {alert.description}
                    </p>
                  </div>

                  <button
                    id={`execute-workflow-${alert.id}`}
                    onClick={() => handleExecuteWorkflow(alert)}
                    disabled={isExecuting}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 active:scale-98 transition shrink-0 cursor-pointer shadow-2xs"
                  >
                    {isExecuting ? (
                      <>
                        <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        <span>Approving...</span>
                      </>
                    ) : (
                      <>
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                        <span>Approve Action</span>
                      </>
                    )}
                  </button>
                </div>
              );
            })}
          </div>
        )}

        {resolvedAlerts.length > 0 && (
          <div className="pt-2">
            <span className="text-xs text-slate-500 font-medium">
              Completed today: {resolvedAlerts.map((r) => r.title).join(", ")}
            </span>
          </div>
        )}
      </div>

      {/* "How This Works in 3 Simple Steps" Clean Visual Explainer */}
      <div className="bg-slate-50 rounded-2xl border border-slate-200 p-6 space-y-4">
        <div className="flex items-center gap-2">
          <Info className="w-4 h-4 text-teal-600" />
          <h3 className="text-sm font-bold text-slate-900">
            How Rosalind Works (At a Glance)
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
          <div className="bg-white p-4 rounded-xl border border-slate-200 space-y-1.5 shadow-2xs">
            <span className="w-6 h-6 rounded-full bg-teal-100 text-teal-800 font-bold flex items-center justify-center text-xs">
              1
            </span>
            <strong className="text-slate-900 block text-xs">
              Early Sensor Alerts
            </strong>
            <p className="text-slate-600 leading-relaxed text-[11px]">
              Micro-sensors detect minor vibrations and heat in pumps, chillers, and elevators days before failure, so repairs happen silently at night.
            </p>
          </div>

          <div className="bg-white p-4 rounded-xl border border-slate-200 space-y-1.5 shadow-2xs">
            <span className="w-6 h-6 rounded-full bg-indigo-100 text-indigo-800 font-bold flex items-center justify-center text-xs">
              2
            </span>
            <strong className="text-slate-900 block text-xs">
              Smart Shift & Guest Matching
            </strong>
            <p className="text-slate-600 leading-relaxed text-[11px]">
              Staff schedules automatically adapt to check-in waves. The AI concierge satisfies VIP requests and sends tasks directly to butler phones.
            </p>
          </div>

          <div className="bg-white p-4 rounded-xl border border-slate-200 space-y-1.5 shadow-2xs">
            <span className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-800 font-bold flex items-center justify-center text-xs">
              3
            </span>
            <strong className="text-slate-900 block text-xs">
              Dynamic Yield & 1-Click Control
            </strong>
            <p className="text-slate-600 leading-relaxed text-[11px]">
              Room rates update dynamically according to local events and weather. You manage the entire resort with 1-click approvals, zero stress.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
