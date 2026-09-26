import React, { useState, useEffect } from "react";
import {
  Zap,
  Bot,
  ShieldCheck,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Users,
  Send,
  Radio,
  Sparkles,
  RefreshCw,
  Phone,
  ArrowRight,
  Wrench,
  Utensils,
  Home,
  MessageSquare,
  Check,
  AlertCircle,
  Activity,
  Layers,
  Flame,
} from "lucide-react";
import { LiveComplaint, StaffMember, ScheduledOperation } from "../types";

const initialScheduledOperations: ScheduledOperation[] = [
  {
    id: "sch-1",
    title: "Kund Pool Chemical & Silt Balancing",
    category: "Engineering",
    assignedTo: "Rajesh Mhatre",
    scheduledTime: "14:30 – 15:30",
    status: "In-Progress",
    description: "Automated pH calibration and silt evacuation cycle on Lake Pichola promenade loop.",
  },
  {
    id: "sch-2",
    title: "Kitchen HACCP Temperature & Walk-in Chiller Log",
    category: "F&B",
    assignedTo: "Chef Sanjeev Sen",
    scheduledTime: "11:00 – 12:00",
    status: "Done",
    description: "Deep freezer (-18°C) and royal marinades verified compliant with food safety protocols.",
  },
  {
    id: "sch-3",
    title: "Royal Villa Evening Turndown & Rose Petal Urns",
    category: "Housekeeping",
    assignedTo: "Sunita Nair",
    scheduledTime: "17:00 – 19:30",
    status: "In-Progress",
    description: "Pre-setting 42 haveli suites for Singhania wedding VIP arrivals with jasmine essence.",
  },
  {
    id: "sch-4",
    title: "1500 kVA DG Generator Mains Sync & Fuel Check",
    category: "Engineering",
    assignedTo: "Aarav Mehta",
    scheduledTime: "08:00 – 09:00",
    status: "Done",
    description: "Automatic Mains Failure (AMF) relay testing for uninterrupted palace backup.",
  },
  {
    id: "sch-5",
    title: "Reverse Osmosis (RO) Membrane TDS Quality Audit",
    category: "Safety",
    assignedTo: "Engineering Crew",
    scheduledTime: "16:00 – 17:00",
    status: "Pending",
    description: "TDS pass-through verification ensuring drinking water <= 85 ppm across all suites.",
  },
];

interface AutonomousOperationsEngineProps {
  onNavigateTab?: (tab: string) => void;
}

export const AutonomousOperationsEngine: React.FC<AutonomousOperationsEngineProps> = ({
  onNavigateTab,
}) => {
  const [complaints, setComplaints] = useState<LiveComplaint[]>([]);
  const [scheduledOps, setScheduledOps] = useState<ScheduledOperation[]>(
    initialScheduledOperations
  );
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSimulating, setIsSimulating] = useState<boolean>(false);
  const [lastPolledAt, setLastPolledAt] = useState<Date>(new Date());
  const [selectedFilter, setSelectedFilter] = useState<string>("All");
  const [customMessage, setCustomMessage] = useState<string>("");
  const [customRoom, setCustomRoom] = useState<string>("Room 205");
  const [isTesterOpen, setIsTesterOpen] = useState<boolean>(false);
  const [successToast, setSuccessToast] = useState<string | null>(null);

  // 3-second real-time polling hook
  const fetchComplaints = async () => {
    try {
      const res = await fetch("/api/dashboard/complaints");
      if (res.ok) {
        const data = await res.json();
        setComplaints(data);
        setLastPolledAt(new Date());
      }
    } catch (err) {
      console.warn("Polling error in AutonomousOperationsEngine:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchComplaints();
    const interval = setInterval(fetchComplaints, 3000);
    return () => clearInterval(interval);
  }, []);

  // Quick dispatch simulation
  const handleSimulate = async (messageText: string, roomText: string) => {
    setIsSimulating(true);
    try {
      const res = await fetch("/api/dashboard/complaints/simulate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: messageText, room: roomText }),
      });
      if (res.ok) {
        setSuccessToast(`⚡ Inbound complaint autonomously classified, dispatched, & escalated!`);
        setTimeout(() => setSuccessToast(null), 4500);
        await fetchComplaints();
      }
    } catch (err) {
      console.error("Simulation error:", err);
    } finally {
      setIsSimulating(false);
    }
  };

  // Resolve complaint action
  const handleResolve = async (id: string) => {
    try {
      const res = await fetch(`/api/dashboard/complaints/${id}/resolve`, {
        method: "PATCH",
      });
      if (res.ok) {
        setComplaints((prev) =>
          prev.map((c) => (c.id === id ? { ...c, status: "Resolved" } : c))
        );
        setSuccessToast(`Task marked resolved. Assigned staff freed back to Available.`);
        setTimeout(() => setSuccessToast(null), 3500);
      }
    } catch (err) {
      console.error("Resolve error:", err);
    }
  };

  // Toggle scheduled operation status
  const handleToggleScheduledStatus = (id: string) => {
    setScheduledOps((prev) =>
      prev.map((op) => {
        if (op.id !== id) return op;
        const nextStatus: "Done" | "In-Progress" | "Pending" =
          op.status === "Pending"
            ? "In-Progress"
            : op.status === "In-Progress"
            ? "Done"
            : "Pending";
        return { ...op, status: nextStatus };
      })
    );
  };

  // Filter urgent / immediate items
  const immediateUrgentTickets = complaints.filter(
    (c) => c.isTodayUrgent && c.status !== "Resolved"
  );

  const filteredComplaints = complaints.filter((c) => {
    if (selectedFilter === "All") return true;
    if (selectedFilter === "Urgent") return c.isTodayUrgent;
    if (selectedFilter === "Active") return c.status !== "Resolved";
    if (selectedFilter === "Resolved") return c.status === "Resolved";
    return c.category === selectedFilter;
  });

  // Severity color badge helper
  const renderSeverityBadge = (severity: number) => {
    if (severity >= 8) {
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-rose-950/80 text-rose-300 border border-rose-500/50 shadow-xs shadow-rose-950/50">
          <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping"></span>
          <span>{severity}/10 · Critical</span>
        </span>
      );
    }
    if (severity >= 5) {
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-950/70 text-amber-300 border border-amber-500/40">
          <span className="w-1.5 h-1.5 rounded-full bg-amber-400"></span>
          <span>{severity}/10 · Moderate</span>
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-950/70 text-emerald-300 border border-emerald-500/30">
        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
        <span>{severity}/10 · Routine</span>
      </span>
    );
  };

  return (
    <div className="space-y-6">
      {/* Toast Alert */}
      {successToast && (
        <div className="bg-slate-900 border border-emerald-500/50 text-emerald-300 px-4 py-3 rounded-xl flex items-center justify-between shadow-lg animate-in fade-in duration-200">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
            <span className="text-xs sm:text-sm font-semibold">{successToast}</span>
          </div>
          <button
            onClick={() => setSuccessToast(null)}
            className="text-xs font-bold text-slate-400 hover:text-white"
          >
            ✕
          </button>
        </div>
      )}

      {/* Autonomous Operational Manager Header Bar */}
      <div className="bg-slate-900 text-white rounded-2xl border border-slate-800 p-5 sm:p-6 shadow-xl relative overflow-hidden">
        {/* Subtle decorative glow */}
        <div className="absolute -top-12 -right-12 w-64 h-64 bg-teal-500/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute -bottom-12 -left-12 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl pointer-events-none"></div>

        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 relative z-10">
          <div className="space-y-1.5">
            <div className="flex flex-wrap items-center gap-2.5">
              {/* Active Badge required */}
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold bg-emerald-950/90 text-emerald-300 border border-emerald-500/50 shadow-sm">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></span>
                <span>AI Auto-Pilot: Active (Autonomous Dispatch Enabled)</span>
              </div>

              <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium bg-slate-800 text-slate-300 border border-slate-700">
                <RefreshCw className="w-3 h-3 text-teal-400 animate-spin" style={{ animationDuration: "3s" }} />
                <span>Polling live every 3s</span>
              </div>
            </div>

            <h2 className="text-xl sm:text-2xl font-bold font-serif text-white tracking-tight flex items-center gap-2 mt-2">
              <Bot className="w-6 h-6 text-amber-400" />
              <span>Autonomous Operational Manager</span>
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 max-w-2xl leading-relaxed">
              Real-time guest complaints from WhatsApp are classified by Gemini Flash, autonomously assigned to on-duty staff without GM delay, and escalated via Gmail when critical.
            </p>
          </div>

          {/* Quick Simulation Triggers */}
          <div className="flex flex-wrap items-center gap-2 shrink-0">
            <button
              onClick={() => setIsTesterOpen(!isTesterOpen)}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold text-amber-200 bg-amber-950/60 border border-amber-500/40 hover:bg-amber-900/60 transition cursor-pointer shadow-xs"
            >
              <Zap className="w-3.5 h-3.5 text-amber-400" />
              <span>Simulate WhatsApp Inbound</span>
            </button>
            <button
              onClick={() => handleSimulate("Emergency: Main bathroom pipe leak bursting in Room 205!", "Room 205")}
              disabled={isSimulating}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold text-white bg-rose-600 hover:bg-rose-500 active:scale-95 transition cursor-pointer shadow-xs"
            >
              <Flame className="w-3.5 h-3.5 text-rose-200" />
              <span>Trigger Severity 9 Leak</span>
            </button>
          </div>
        </div>

        {/* Inbound Simulator Drawer */}
        {isTesterOpen && (
          <div className="mt-5 pt-4 border-t border-slate-800 space-y-3">
            <div className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center justify-between">
              <span>Test Autonomous AI Dispatch Pipeline</span>
              <span className="text-[11px] text-teal-400 lowercase">Twilio webhook simulator</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-2">
              <input
                type="text"
                placeholder="Room e.g. Villa 114"
                value={customRoom}
                onChange={(e) => setCustomRoom(e.target.value)}
                className="bg-slate-800 text-white border border-slate-700 px-3 py-2 rounded-xl text-xs focus:outline-none focus:border-teal-500"
              />
              <input
                type="text"
                placeholder="e.g. Master AC unit broken, blowing warm air"
                value={customMessage}
                onChange={(e) => setCustomMessage(e.target.value)}
                className="sm:col-span-2 bg-slate-800 text-white border border-slate-700 px-3 py-2 rounded-xl text-xs focus:outline-none focus:border-teal-500"
              />
              <button
                onClick={() => {
                  handleSimulate(customMessage || "AC cooling failed, room temperature at 28°C", customRoom || "Villa 114");
                  setCustomMessage("");
                }}
                disabled={isSimulating}
                className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-teal-600 hover:bg-teal-500 transition cursor-pointer flex items-center justify-center gap-1.5"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Simulate Inbound</span>
              </button>
            </div>
            <div className="flex flex-wrap items-center gap-1.5 text-[11px] text-slate-400">
              <span className="font-semibold text-slate-300">Quick Templates:</span>
              <button
                onClick={() => handleSimulate("Severe water leak under washbasin in Room 205!", "Room 205")}
                className="underline hover:text-white"
              >
                Pipe Leak (Eng)
              </button>
              <span>·</span>
              <button
                onClick={() => handleSimulate("AC unit broken in Villa 114, need cooling repaired", "Villa 114")}
                className="underline hover:text-white"
              >
                HVAC Down (Eng)
              </button>
              <span>·</span>
              <button
                onClick={() => handleSimulate("Broken glass tumbler in Haveli 408 courtyard", "Haveli 408")}
                className="underline hover:text-white"
              >
                Broken Glass (Hskp)
              </button>
              <span>·</span>
              <button
                onClick={() => handleSimulate("Can we order 2 warm Mewari Thalis to Suite 302?", "Suite 302")}
                className="underline hover:text-white"
              >
                Late Thali (F&B)
              </button>
            </div>
          </div>
        )}
      </div>

      {/* TOP QUICK ACTION BAR (Two Distinct Panels) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Panel 1: Immediate Today's Actions (Urgent / AI Auto-Dispatched) */}
        <div className="bg-slate-900 text-white rounded-2xl border border-slate-800 p-5 shadow-lg flex flex-col justify-between">
          <div className="space-y-3">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-rose-500/20 text-rose-400 flex items-center justify-center">
                  <Flame className="w-4 h-4 text-rose-400" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">Immediate Today's Actions</h3>
                  <p className="text-[11px] text-slate-400">Urgent & AI Auto-Dispatched (No GM approval required)</p>
                </div>
              </div>
              <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-rose-500/20 text-rose-300 border border-rose-500/30">
                {immediateUrgentTickets.length} Priority Active
              </span>
            </div>

            {immediateUrgentTickets.length === 0 ? (
              <div className="py-6 text-center text-slate-400 space-y-1">
                <CheckCircle2 className="w-7 h-7 text-emerald-400 mx-auto mb-1" />
                <p className="text-xs font-bold text-slate-200">No Critical Emergencies Active</p>
                <p className="text-[11px] text-slate-400">All high-severity incidents have been stabilized.</p>
              </div>
            ) : (
              <div className="space-y-2.5 max-h-[260px] overflow-y-auto pr-1">
                {immediateUrgentTickets.map((ticket) => (
                  <div
                    key={ticket.id}
                    className="p-3 rounded-xl bg-slate-800/80 border border-rose-500/40 hover:border-rose-500 transition space-y-2"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-2">
                          <span className="px-2 py-0.5 rounded-md text-[11px] font-bold bg-rose-950 text-rose-200 border border-rose-800">
                            {ticket.room}
                          </span>
                          <span className="text-xs font-semibold text-slate-200">
                            {ticket.category}
                          </span>
                        </div>
                        <p className="text-xs text-rose-100/90 font-medium line-clamp-1">
                          "{ticket.complaint}"
                        </p>
                      </div>
                      {renderSeverityBadge(ticket.severity)}
                    </div>

                    <div className="flex flex-wrap items-center justify-between gap-2 pt-1 border-t border-slate-700/60 text-[11px]">
                      <div className="flex items-center gap-1.5 text-teal-300 font-medium">
                        <Users className="w-3.5 h-3.5 text-teal-400 shrink-0" />
                        <span>Personnel: {ticket.assignedStaff}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-slate-400">{ticket.timestamp}</span>
                        <button
                          onClick={() => handleResolve(ticket.id)}
                          className="px-2.5 py-1 rounded-lg text-[10px] font-bold text-slate-900 bg-emerald-400 hover:bg-emerald-300 transition cursor-pointer"
                        >
                          Mark Resolved
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="pt-3 mt-3 border-t border-slate-800 flex items-center justify-between text-[11px] text-slate-400">
            <span>Escalation channel: Gmail / SMS automated</span>
            <span className="text-teal-400 font-medium">Auto-dispatch: Active</span>
          </div>
        </div>

        {/* Panel 2: Scheduled Daily Operations */}
        <div className="bg-slate-900 text-white rounded-2xl border border-slate-800 p-5 shadow-lg flex flex-col justify-between">
          <div className="space-y-3">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-teal-500/20 text-teal-400 flex items-center justify-center">
                  <Clock className="w-4 h-4 text-teal-400" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">Scheduled Daily Operations</h3>
                  <p className="text-[11px] text-slate-400">Ongoing recurring property maintenance & quality checks</p>
                </div>
              </div>
              <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-teal-500/20 text-teal-300 border border-teal-500/30">
                {scheduledOps.length} Routine Runs
              </span>
            </div>

            <div className="space-y-2 max-h-[260px] overflow-y-auto pr-1">
              {scheduledOps.map((op) => {
                const isDone = op.status === "Done";
                const isInProg = op.status === "In-Progress";

                return (
                  <div
                    key={op.id}
                    className="p-3 rounded-xl bg-slate-800/80 border border-slate-700/80 hover:border-slate-600 transition flex items-center justify-between gap-3"
                  >
                    <div className="space-y-0.5 min-w-0">
                      <div className="flex items-center gap-2">
                        <strong className="text-xs text-white truncate block">
                          {op.title}
                        </strong>
                        <span className="text-[10px] text-slate-400">
                          {op.scheduledTime}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-300 truncate">
                        Assigned: <strong className="text-slate-200">{op.assignedTo}</strong> · {op.description}
                      </p>
                    </div>

                    <button
                      onClick={() => handleToggleScheduledStatus(op.id)}
                      className={`px-2.5 py-1 rounded-lg text-[10px] font-bold shrink-0 transition cursor-pointer border ${
                        isDone
                          ? "bg-emerald-950 text-emerald-300 border-emerald-500/40"
                          : isInProg
                          ? "bg-amber-950 text-amber-300 border-amber-500/40"
                          : "bg-slate-700 text-slate-300 border-slate-600"
                      }`}
                      title="Click to cycle status: Pending -> In-Progress -> Done"
                    >
                      {op.status}
                    </button>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="pt-3 mt-3 border-t border-slate-800 flex items-center justify-between text-[11px] text-slate-400">
            <span>Click any status tag to update run</span>
            <span className="text-amber-400 font-medium">Compliance: 100% on schedule</span>
          </div>
        </div>
      </div>

      {/* AUTONOMOUS COMPLAINT RESOLUTION ENGINE TABLE */}
      <div className="bg-slate-900 text-white rounded-2xl border border-slate-800 p-5 sm:p-6 shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
          <div>
            <div className="flex items-center gap-2">
              <Zap className="w-5 h-5 text-amber-400 fill-amber-400" />
              <h3 className="text-base sm:text-lg font-bold font-serif text-white">
                Autonomous Complaint Resolution Engine
              </h3>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Live inbound tickets from Twilio WhatsApp, classified by Gemini Flash and auto-dispatched to idle staff.
            </p>
          </div>

          {/* Table Filters */}
          <div className="flex flex-wrap items-center gap-1.5">
            {["All", "Urgent", "Engineering", "Housekeeping", "F&B", "Resolved"].map((f) => (
              <button
                key={f}
                onClick={() => setSelectedFilter(f)}
                className={`px-3 py-1 rounded-lg text-xs font-semibold transition cursor-pointer ${
                  selectedFilter === f
                    ? "bg-teal-500 text-slate-950 shadow-xs"
                    : "bg-slate-800 text-slate-300 hover:bg-slate-700"
                }`}
              >
                {f}
              </button>
            ))}
          </div>
        </div>

        {/* Table Content */}
        {filteredComplaints.length === 0 ? (
          <div className="py-12 text-center text-slate-400">
            <CheckCircle2 className="w-10 h-10 text-emerald-400 mx-auto mb-2" />
            <p className="text-sm font-bold text-white">No complaints match this filter</p>
            <p className="text-xs text-slate-400 mt-1">Autonomous dispatch queue is clear.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-800 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                  <th className="py-3 px-3">Room</th>
                  <th className="py-3 px-3">Guest Complaint</th>
                  <th className="py-3 px-3">Severity (1-10)</th>
                  <th className="py-3 px-3">AI Auto-Assigned Staff</th>
                  <th className="py-3 px-3">Direct Action Executed</th>
                  <th className="py-3 px-3 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/80">
                {filteredComplaints.map((item) => {
                  const isResolved = item.status === "Resolved";
                  const isUrgent = item.isTodayUrgent;

                  return (
                    <tr
                      key={item.id}
                      className={`hover:bg-slate-800/50 transition ${
                        isUrgent && !isResolved ? "bg-rose-950/20" : ""
                      }`}
                    >
                      {/* 1. Room */}
                      <td className="py-3.5 px-3 font-bold text-white whitespace-nowrap">
                        <div className="flex items-center gap-1.5">
                          <span className="w-2 h-2 rounded-full bg-teal-400"></span>
                          <span className="px-2 py-0.5 rounded-md bg-slate-800 border border-slate-700 font-mono text-xs">
                            {item.room}
                          </span>
                        </div>
                      </td>

                      {/* 2. Guest Complaint */}
                      <td className="py-3.5 px-3 max-w-xs sm:max-w-sm">
                        <p className="text-slate-100 font-medium line-clamp-2">
                          "{item.complaint}"
                        </p>
                        <div className="flex items-center gap-2 mt-1 text-[10px] text-slate-400">
                          <span className="px-1.5 py-0.5 rounded bg-slate-800 text-slate-300">
                            {item.category}
                          </span>
                          <span>{item.timestamp}</span>
                          <span className="text-slate-500 font-mono">
                            {item.sender.replace("whatsapp:", "")}
                          </span>
                        </div>
                      </td>

                      {/* 3. Severity */}
                      <td className="py-3.5 px-3 whitespace-nowrap">
                        {renderSeverityBadge(item.severity)}
                      </td>

                      {/* 4. AI Auto-Assigned Staff */}
                      <td className="py-3.5 px-3 whitespace-nowrap">
                        <div className="flex items-center gap-1.5">
                          <Users className="w-3.5 h-3.5 text-teal-400 shrink-0" />
                          <span className="font-semibold text-teal-200">
                            {item.assignedStaff}
                          </span>
                        </div>
                        <span className="text-[10px] text-slate-400 block mt-0.5">
                          Autonomous match (idle)
                        </span>
                      </td>

                      {/* 5. Direct Action Executed */}
                      <td className="py-3.5 px-3 max-w-xs text-slate-200">
                        <div className="flex items-start gap-1.5">
                          <Zap className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
                          <span className="text-xs font-medium leading-relaxed">
                            {item.actionTaken}
                          </span>
                        </div>
                        {item.aiReply && (
                          <p className="text-[10px] text-slate-400 italic mt-1 line-clamp-1">
                            Reply: "{item.aiReply}"
                          </p>
                        )}
                      </td>

                      {/* 6. Status */}
                      <td className="py-3.5 px-3 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-2">
                          <span
                            className={`px-2.5 py-1 rounded-full text-[11px] font-bold border ${
                              isResolved
                                ? "bg-emerald-950/80 text-emerald-300 border-emerald-500/40"
                                : isUrgent
                                ? "bg-rose-950/80 text-rose-300 border-rose-500/50 animate-pulse"
                                : "bg-amber-950/80 text-amber-300 border-amber-500/40"
                            }`}
                          >
                            {item.status}
                          </span>

                          {!isResolved && (
                            <button
                              onClick={() => handleResolve(item.id)}
                              className="px-2 py-1 rounded-lg text-[10px] font-bold text-white bg-slate-800 hover:bg-emerald-600 transition cursor-pointer border border-slate-700 hover:border-emerald-500"
                              title="Resolve and release staff"
                            >
                              Resolve
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        <div className="pt-3 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-400 gap-2">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-teal-400" />
            <span>Zero-touch frontline dispatch running 24/7 across Veda Vilas Palace</span>
          </div>
          <div className="text-[11px] text-slate-500 font-mono">
            Last sync: {lastPolledAt.toLocaleTimeString()}
          </div>
        </div>
      </div>
    </div>
  );
};
