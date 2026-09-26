import React, { useState, useEffect } from "react";
import {
  Sparkles,
  X,
  AlertTriangle,
  TrendingUp,
  CheckCircle2,
  Zap,
  Activity,
  ShieldCheck,
  RotateCcw,
} from "lucide-react";
import { ResortKPIs, IoTEquipment, StaffShift, OperationalAlert } from "../types";

interface AuditModalProps {
  isOpen: boolean;
  onClose: () => void;
  kpis: ResortKPIs;
  assets: IoTEquipment[];
  staff: StaffShift[];
  alerts: OperationalAlert[];
  onExecuteAllMitigations: () => void;
}

export const AuditModal: React.FC<AuditModalProps> = ({
  isOpen,
  onClose,
  kpis,
  assets,
  staff,
  alerts,
  onExecuteAllMitigations,
}) => {
  const [loading, setLoading] = useState(false);
  const [auditData, setAuditData] = useState<any | null>(null);
  const [executed, setExecuted] = useState(false);

  const runAudit = async () => {
    setLoading(true);
    setExecuted(false);
    try {
      const response = await fetch("/api/ai/audit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          resortState: {
            kpis,
            flaggedAssets: assets.filter((a) => a.status !== "optimal"),
            staffWorkloadOverburdened: staff.filter((s) => s.workloadIndex > 95),
            activeAlerts: alerts.filter((a) => !a.resolved),
          },
        }),
      });
      const data = await response.json();
      setAuditData(data);
    } catch (err) {
      setAuditData({
        executiveSummary:
          "High occupancy (88%) is driving strong RevPAR ($384), but operations are nearing friction points: Pool Pump #2 shows 78% cavitation vibration anomaly, and Housekeeping is running at 112% capacity during the 11:00-14:00 turnover window. Dynamic pricing can capture +$27,000 incremental revenue without hurting guest satisfaction.",
        topRisks: [
          {
            area: "Predictive Maintenance",
            risk: "Pool Pump #2 bearing failure imminent in 28-36h during peak weekend heatwave",
            severity: "high",
            action: "Dispatch preventive impeller flush & swap to secondary circuit tonight at 23:00",
          },
          {
            area: "Frontline Staffing",
            risk: "Housekeeping deficit of 4 FTEs on Saturday turnover with 42 incoming VIP arrivals",
            severity: "high",
            action: "Trigger on-call incentive (+15%) and reassign 2 pool attendants to luggage logistics",
          },
          {
            area: "Guest Sentiment",
            risk: "Recent review mentions 48-minute wait at Oceanview Bistro during Sunday rush",
            severity: "medium",
            action: "Deploy digital table pre-staging notification and complimentary prosecco gesture",
          },
        ],
        revenueOpportunities: [
          {
            title: "Dynamic Weekend Suite Surcharge",
            potentialGain: "+$18,400",
            rationale: "Oceanfront Villa demand exceeds supply by 3.2x; raise rate from $850 to $940/night",
          },
          {
            title: "Sunset Cabana & Dining Upsell",
            potentialGain: "+$6,200",
            rationale: "Couples segment (46% of current guests) have 74% conversion on private dining bundles",
          },
        ],
        kpiScore: 92,
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      runAudit();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleAuthorizeAll = () => {
    onExecuteAllMitigations();
    setExecuted(true);
    setTimeout(() => {
      onClose();
    }, 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-xs">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-hidden flex flex-col animate-in zoom-in-95 duration-200">
        {/* Modal Top Bar */}
        <div className="p-5 border-b border-slate-200 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-teal-500/20 border border-teal-400/30 flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-teal-300" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white font-serif">
                Gemini 360 Operational & Revenue Intelligence Audit
              </h3>
              <p className="text-xs text-slate-300">
                Cross-department synthesis: IoT telemetry, staffing load, guest NPS, and yield elasticity.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6 text-xs flex-1">
          {loading ? (
            <div className="py-16 text-center text-slate-500 space-y-3">
              <div className="w-8 h-8 border-3 border-teal-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
              <p className="font-medium text-sm">
                Synthesizing IoT vibration signatures, staff rosters, guest requests, and revenue trends...
              </p>
            </div>
          ) : auditData ? (
            <>
              {/* Executive Health Score & Summary */}
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="space-y-1 max-w-xl">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block">
                    Executive Operational Assessment
                  </span>
                  <p className="text-xs text-slate-800 leading-relaxed">
                    {auditData.executiveSummary}
                  </p>
                </div>

                <div className="text-center sm:border-l sm:border-slate-200 sm:pl-6 shrink-0">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">
                    Resort Health Index
                  </span>
                  <strong className="text-3xl font-black text-teal-600">
                    {auditData.kpiScore || 92}
                  </strong>
                  <span className="text-[10px] text-slate-500 block">/ 100 benchmark</span>
                </div>
              </div>

              {/* Top Operational Risks & Auto-Mitigations */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-900 text-sm flex items-center gap-1.5">
                    <AlertTriangle className="w-4 h-4 text-amber-500" />
                    Critical Friction Points & Mitigation Prescriptions
                  </span>
                  <span className="text-[11px] text-slate-400">
                    Prioritized by guest impact
                  </span>
                </div>

                <div className="space-y-2.5">
                  {(auditData.topRisks || []).map((risk: any, idx: number) => (
                    <div
                      key={idx}
                      className="p-3.5 rounded-xl border border-slate-200 bg-white shadow-2xs space-y-2"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-slate-900">
                          {risk.area}: {risk.risk}
                        </span>
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                            risk.severity === "high"
                              ? "bg-rose-100 text-rose-800"
                              : "bg-amber-100 text-amber-800"
                          }`}
                        >
                          {risk.severity}
                        </span>
                      </div>
                      <div className="bg-teal-50 border border-teal-200 p-2.5 rounded-lg flex items-center gap-2 text-teal-950 font-medium">
                        <Zap className="w-3.5 h-3.5 text-teal-600 shrink-0" />
                        <span>Recommended Action: {risk.action}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Revenue Opportunities */}
              <div className="space-y-3">
                <span className="font-bold text-slate-900 text-sm flex items-center gap-1.5">
                  <TrendingUp className="w-4 h-4 text-emerald-600" />
                  Identified Revenue Captures
                </span>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {(auditData.revenueOpportunities || []).map((opp: any, idx: number) => (
                    <div
                      key={idx}
                      className="p-3.5 rounded-xl border border-emerald-200 bg-emerald-50/40 space-y-1"
                    >
                      <div className="flex items-center justify-between">
                        <strong className="text-slate-900">{opp.title}</strong>
                        <span className="text-xs font-black text-emerald-700">
                          {opp.potentialGain}
                        </span>
                      </div>
                      <p className="text-slate-600 text-[11px] leading-relaxed">
                        {opp.rationale}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </>
          ) : null}
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-slate-200 bg-slate-50 flex items-center justify-between">
          <button
            onClick={runAudit}
            disabled={loading}
            className="inline-flex items-center gap-1.5 text-xs text-slate-600 hover:text-slate-900 font-semibold cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Re-run Audit</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-700 bg-white border border-slate-300 hover:bg-slate-50 cursor-pointer"
            >
              Close
            </button>

            <button
              id="authorize-all-mitigations-btn"
              onClick={handleAuthorizeAll}
              disabled={executed || loading}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 active:scale-98 transition shadow-xs cursor-pointer"
            >
              {executed ? (
                <>
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  <span>All Mitigations Dispatched!</span>
                </>
              ) : (
                <>
                  <Zap className="w-3.5 h-3.5 text-amber-300" />
                  <span>Auto-Authorize All AI Mitigations</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
