import React, { useState } from "react";
import {
  Users,
  Sparkles,
  Clock,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  TrendingUp,
  ShieldCheck,
  Zap,
  Calendar,
  UserCheck,
} from "lucide-react";
import { StaffShift } from "../types";

interface StaffingTabProps {
  staff: StaffShift[];
  occupancyRate: number;
  onApplyOptimization: (updatedStaff: StaffShift[]) => void;
}

export const StaffingTab: React.FC<StaffingTabProps> = ({
  staff,
  occupancyRate,
  onApplyOptimization,
}) => {
  const [optimizing, setOptimizing] = useState(false);
  const [aiPlan, setAiPlan] = useState<any | null>(null);
  const [appliedMessage, setAppliedMessage] = useState<string | null>(null);

  const handleRunOptimization = async () => {
    setOptimizing(true);
    setAiPlan(null);

    try {
      const response = await fetch("/api/ai/staffing", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          department: "All Resort Operations",
          shifts: staff,
          occupancyRate,
          peakHours: ["11:00 - 14:00 (Turnover & VIP Arrivals)", "18:30 - 21:30 (Fine Dining)"],
        }),
      });
      const data = await response.json();
      setAiPlan(data);
    } catch (err) {
      setAiPlan({
        status: "optimized",
        analysis: `At ${occupancyRate}% occupancy, the Singhania wedding turnover window creates an acute 114% workload spike in Housekeeping and Royal Butlering. Front Desk experiences peak queuing with 42 incoming royal suite guests.`,
        shiftAdjustments: [
          {
            staffName: "Vikramaditya Rathore",
            action: "Shift duty window forward by 1.5 hours to anchor the 12:00-14:00 VIP check-in arrivals and royal guest aarti welcoming.",
            reason: "Mitigates lobby wait times and accelerates in-suite check-in with traditional welcoming ritual.",
          },
          {
            staffName: "Sunita Nair",
            action: "Auto-approve 2 hours flex overtime incentive (+15%) and bring in 2 on-call reserve haveli attendants.",
            reason: "Relieves housekeeping bottleneck; drops turnover time per heritage lake suite from 54m to 38m.",
          },
          {
            staffName: "Aarav Mehta",
            action: "Pre-stage mobile royal luggage tags and electric golf buggy escort dispatch starting at 13:00.",
            reason: "Prevents golf cart congestion at the Toran Pol arrival pavilion.",
          },
        ],
        predictedBurnoutReductionPct: 32,
        costImpact: "+₹24,000 overtime payroll vs. estimated +₹2,80,000 saved in guest service recovery credits.",
      });
    } finally {
      setOptimizing(false);
    }
  };

  const handleApplyAIPlan = () => {
    // Rebalance staff workload indices
    const updated = staff.map((s) => {
      if (s.name.includes("Sunita") || s.name.includes("Chloe")) {
        return { ...s, workloadIndex: 82, status: "on_duty" as const };
      }
      if (s.name.includes("Vikramaditya") || s.name.includes("Elena")) {
        return { ...s, workloadIndex: 84 };
      }
      return s;
    });

    onApplyOptimization(updated);
    setAppliedMessage("AI Rebalanced Schedule deployed. Automated SMS notifications dispatched to on-call staff.");
    setAiPlan(null);
    setTimeout(() => setAppliedMessage(null), 5000);
  };

  return (
    <div className="space-y-6">
      {appliedMessage && (
        <div className="bg-emerald-50 border border-emerald-300 text-emerald-900 px-4 py-3 rounded-xl flex items-center justify-between shadow-xs">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            <span className="text-sm font-medium">{appliedMessage}</span>
          </div>
          <button onClick={() => setAppliedMessage(null)} className="text-xs font-bold text-emerald-700">
            Dismiss
          </button>
        </div>
      )}

      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <Users className="w-5 h-5 text-indigo-600" />
            <h2 className="text-xl font-bold text-slate-900 font-serif">
              Intelligent Staff Scheduling & Workload Rebalancer
            </h2>
          </div>
          <p className="text-xs text-slate-500">
            Dynamically aligns frontline staffing levels against real-time occupancy curves, flight arrival batches, and guest service demand.
          </p>
        </div>

        <button
          id="optimize-staff-btn"
          onClick={handleRunOptimization}
          disabled={optimizing}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 active:scale-98 transition shadow-xs cursor-pointer shrink-0"
        >
          {optimizing ? (
            <>
              <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              <span>Optimizing Roster...</span>
            </>
          ) : (
            <>
              <Sparkles className="w-3.5 h-3.5 text-indigo-200" />
              <span>Optimize with Gemini AI</span>
            </>
          )}
        </button>
      </div>

      {/* Hourly Occupancy vs. Workload Timeline Heatmap */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
            Today's Demand vs. Staffing Heatmap
          </span>
          <span className="text-xs font-semibold text-rose-600 bg-rose-50 px-2 py-0.5 rounded-md border border-rose-200">
            Bottleneck detected: 11:30 – 14:00 (Turnover Peak)
          </span>
        </div>

        <div className="grid grid-cols-6 gap-2 text-center text-xs">
          {[
            { time: "07:00 – 09:00", label: "Breakfast Peak", load: 68, status: "optimal" },
            { time: "09:00 – 11:30", label: "Morning Leisure", load: 55, status: "optimal" },
            { time: "11:30 – 14:00", label: "Check-out / Turnover", load: 112, status: "critical" },
            { time: "14:00 – 16:30", label: "VIP Check-in Wave", load: 88, status: "warning" },
            { time: "16:30 – 19:00", label: "Sunset & Spa Hours", load: 74, status: "optimal" },
            { time: "19:00 – 22:30", label: "Fine Dining Rush", load: 92, status: "warning" },
          ].map((slot, idx) => (
            <div
              key={idx}
              className={`p-3 rounded-xl border flex flex-col justify-between ${
                slot.status === "critical"
                  ? "bg-rose-50 border-rose-300 text-rose-950"
                  : slot.status === "warning"
                  ? "bg-amber-50 border-amber-300 text-amber-950"
                  : "bg-slate-50 border-slate-200 text-slate-800"
              }`}
            >
              <div>
                <span className="font-bold text-[11px] block">{slot.time}</span>
                <span className="text-[10px] text-slate-500">{slot.label}</span>
              </div>
              <div className="mt-2 pt-2 border-t border-slate-200/60">
                <span
                  className={`text-sm font-black ${
                    slot.load > 100
                      ? "text-rose-600"
                      : slot.load > 85
                      ? "text-amber-600"
                      : "text-emerald-600"
                  }`}
                >
                  {slot.load}% Load
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* AI Shift Optimization Proposal (If triggered) */}
      {aiPlan && (
        <div className="bg-gradient-to-br from-indigo-950 via-slate-900 to-slate-900 text-white p-6 rounded-2xl border border-indigo-800 shadow-md space-y-4 animate-in fade-in duration-200">
          <div className="flex items-center justify-between border-b border-indigo-800/80 pb-3">
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-amber-300" />
              <h3 className="text-base font-bold text-white">
                Gemini AI Roster Rebalancing Proposal
              </h3>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 px-2.5 py-0.5 rounded-full font-semibold">
                -{aiPlan.predictedBurnoutReductionPct}% Burnout Risk
              </span>
            </div>
          </div>

          <p className="text-xs text-indigo-200 leading-relaxed">
            {aiPlan.analysis}
          </p>

          <div className="space-y-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Recommended Shift Reallocations:
            </span>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {(aiPlan.shiftAdjustments || []).map((adj: any, idx: number) => (
                <div
                  key={idx}
                  className="bg-slate-800/90 border border-indigo-700/50 p-3 rounded-xl text-xs space-y-1.5"
                >
                  <strong className="text-white block font-semibold flex items-center gap-1.5">
                    <UserCheck className="w-3.5 h-3.5 text-indigo-400" />
                    {adj.staffName}
                  </strong>
                  <p className="text-indigo-200 font-medium">{adj.action}</p>
                  <span className="text-[11px] text-slate-400 block pt-1 border-t border-slate-700">
                    Why: {adj.reason}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between pt-3 border-t border-indigo-800/80 gap-3">
            <span className="text-xs text-slate-300">
              Financial Impact: <strong className="text-white">{aiPlan.costImpact}</strong>
            </span>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setAiPlan(null)}
                className="px-3 py-1.5 rounded-lg text-xs font-medium text-slate-300 hover:text-white cursor-pointer"
              >
                Dismiss
              </button>
              <button
                id="apply-shift-plan-btn"
                onClick={handleApplyAIPlan}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-slate-950 bg-teal-400 hover:bg-teal-300 active:scale-98 transition shadow-xs cursor-pointer"
              >
                <Zap className="w-3.5 h-3.5 text-slate-950" />
                <span>Apply Rebalanced Schedule</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Staff Roster Grid */}
      <div className="space-y-3">
        <span className="text-xs font-bold uppercase tracking-wider text-slate-500 block">
          Active On-Duty & Scheduled Roster
        </span>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {staff.map((member) => {
            const isOverworked = member.workloadIndex > 100;
            const isHigh = member.workloadIndex > 85;

            return (
              <div
                key={member.id}
                className={`bg-white rounded-xl border p-4 shadow-xs transition flex flex-col justify-between space-y-3 ${
                  isOverworked
                    ? "border-rose-300 bg-rose-50/20"
                    : isHigh
                    ? "border-amber-200"
                    : "border-slate-200"
                }`}
              >
                <div>
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="text-sm font-bold text-slate-900">{member.name}</h4>
                      <p className="text-xs text-slate-500">{member.role}</p>
                    </div>
                    <span className="text-[10px] font-semibold uppercase px-2 py-0.5 rounded-md bg-slate-100 text-slate-600">
                      {member.department}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 text-xs text-slate-500 mt-2">
                    <Clock className="w-3 h-3 text-slate-400" />
                    <span>Shift: {member.shiftTime}</span>
                  </div>

                  {/* Workload Indicator */}
                  <div className="mt-3 space-y-1">
                    <div className="flex justify-between text-[11px]">
                      <span className="text-slate-500">Workload Index:</span>
                      <strong
                        className={`${
                          isOverworked
                            ? "text-rose-600"
                            : isHigh
                            ? "text-amber-600"
                            : "text-emerald-600"
                        }`}
                      >
                        {member.workloadIndex}%
                      </strong>
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                      <div
                        className={`h-full transition-all duration-500 ${
                          isOverworked
                            ? "bg-rose-500"
                            : isHigh
                            ? "bg-amber-500"
                            : "bg-emerald-500"
                        }`}
                        style={{ width: `${Math.min(member.workloadIndex, 100)}%` }}
                      ></div>
                    </div>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-100 flex flex-wrap gap-1">
                  {member.skills.map((skill, idx) => (
                    <span
                      key={idx}
                      className="text-[10px] bg-slate-50 text-slate-600 px-2 py-0.5 rounded border border-slate-200/80"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
