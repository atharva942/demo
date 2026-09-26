import React, { useState } from "react";
import {
  UserCheck,
  Wrench,
  FileText,
  Radio,
  Sailboat,
  Sparkles,
  ChevronRight,
  ChevronLeft,
  X,
  CheckCircle2,
  Clock,
  Printer,
  Copy,
  AlertTriangle,
  User,
  ShieldCheck,
  Building,
  Send,
  Calendar,
} from "lucide-react";
import { GuestProfile, IoTEquipment, ResortKPIs, StaffShift } from "../types";

interface QuickActionsSidebarProps {
  kpis: ResortKPIs;
  assets: IoTEquipment[];
  staff: StaffShift[];
  onCheckInGuest: (guest: GuestProfile) => void;
  onOpenWorkOrder: (workOrder: {
    assetName: string;
    issue: string;
    priority: "urgent" | "high" | "routine";
    assignee: string;
    maintenanceWindow: string;
    estimatedCostINR: number;
  }) => void;
  onBroadcastStaff: (message: string) => void;
}

export const QuickActionsSidebar: React.FC<QuickActionsSidebarProps> = ({
  kpis,
  assets,
  staff,
  onCheckInGuest,
  onOpenWorkOrder,
  onBroadcastStaff,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [activeModal, setActiveModal] = useState<
    "checkin" | "workorder" | "dailyreport" | "broadcast" | "shikara" | null
  >(null);

  // 1. Check-in Form State
  const [guestName, setGuestName] = useState("Maharaj Kumar Raghavendra & Family");
  const [selectedSuite, setSelectedSuite] = useState("Maharaja Heritage Lake Suite 302");
  const [guestCount, setGuestCount] = useState(4);
  const [nights, setNights] = useState(3);
  const [vipTier, setVipTier] = useState<GuestProfile["vipTier"]>("Platinum Royal");
  const [dietTags, setDietTags] = useState<string[]>([
    "Strict Satvik Jain preparation",
    "Royal Aarti & Saffron Garland at Toran Pol",
  ]);
  const [assignedButler, setAssignedButler] = useState("Vikramaditya Rathore (Head Butler)");
  const [checkInSuccess, setCheckInSuccess] = useState<string | null>(null);

  // 2. Work Order Form State
  const [selectedAsset, setSelectedAsset] = useState("Kund Stepwell Pool Pump #2");
  const [workOrderIssue, setWorkOrderIssue] = useState(
    "Bearing vibration threshold reached (4.8 mm/s) - cavitation & monsoon silt flushing required"
  );
  const [woPriority, setWoPriority] = useState<"urgent" | "high" | "routine">("urgent");
  const [woAssignee, setWoAssignee] = useState("Rajesh Mhatre (Chief Electro-Mechanical)");
  const [woWindow, setWoWindow] = useState("Silent Night Window (23:00 – 04:00)");
  const [woCost, setWoCost] = useState(18500);
  const [woSuccess, setWoSuccess] = useState<string | null>(null);

  // 3. Broadcast State
  const [broadcastMsg, setBroadcastMsg] = useState(
    "VIP Singhania party arriving at Lake Jetty in 15 mins. Head Butler and Electric Buggy #2 please stage at Toran Pol."
  );
  const [broadcastSuccess, setBroadcastSuccess] = useState<string | null>(null);

  // 4. Report Copied State
  const [copiedReport, setCopiedReport] = useState(false);

  const toggleDietTag = (tag: string) => {
    setDietTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  const handleCheckInSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newGuest: GuestProfile = {
      id: `gst-${Date.now()}`,
      name: guestName,
      room: selectedSuite,
      vipTier,
      checkIn: "2026-09-09",
      checkOut: "2026-09-12",
      loyaltyNPS: 10,
      preferences: [
        "Lake Pichola view",
        "Royal welcome aarti",
        "Ayurvedic bedtime herbal infusion",
      ],
      dietaryRestrictions: dietTags,
      segment: "Ultra-Luxury Couples",
      lifetimeSpend: 1550000,
      activeRequests: [
        `Assigned to ${assignedButler}`,
        ...dietTags.map((d) => `Dietary note: ${d}`),
      ],
      notes: "Checked in via GM Quick Actions sidebar.",
    };

    onCheckInGuest(newGuest);
    setCheckInSuccess(
      `✓ Successfully checked in ${guestName} into ${selectedSuite}. ${assignedButler} has been dispatched with ceremonial welcoming aarti!`
    );
    setTimeout(() => {
      setCheckInSuccess(null);
      setActiveModal(null);
    }, 3500);
  };

  const handleWorkOrderSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onOpenWorkOrder({
      assetName: selectedAsset,
      issue: workOrderIssue,
      priority: woPriority,
      assignee: woAssignee,
      maintenanceWindow: woWindow,
      estimatedCostINR: woCost,
    });
    setWoSuccess(
      `✓ Work Order WO-${Math.floor(1000 + Math.random() * 9000)} dispatched to ${woAssignee} for ${selectedAsset}. Priority: ${woPriority.toUpperCase()}.`
    );
    setTimeout(() => {
      setWoSuccess(null);
      setActiveModal(null);
    }, 3500);
  };

  const handleBroadcastSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onBroadcastStaff(broadcastMsg);
    setBroadcastSuccess("✓ Message broadcasted to all 6 on-duty staff pagers and radios!");
    setTimeout(() => {
      setBroadcastSuccess(null);
      setActiveModal(null);
    }, 3000);
  };

  const handleCopyReport = () => {
    const reportText = `VEDA VILAS PALACE & AYURVEDIC SANCTUARY
Lake Pichola, Udaipur, Rajasthan
DAILY GENERAL MANAGER OPERATIONS & REVENUE REPORT
Date: Wednesday, September 9, 2026 | Morning Briefing

1. EXECUTIVE KEY PERFORMANCE METRICS:
- Occupancy Rate: ${kpis.occupancyRate}% (124 / 140 Heritage Suites Occupied)
- Average Daily Rate (ADR): ₹${kpis.averageDailyRate.toLocaleString("en-IN")}
- RevPAR: ₹${kpis.revPAR.toLocaleString("en-IN")}
- Today's Estimated Yield: ₹47,74,000 INR
- Guest Satisfaction (NPS): ${kpis.guestSatisfactionScore} / 5.0 (94% Positive)

2. CRITICAL ENGINEERING & IOT TELEMETRY:
- Overall Plant Health: ${kpis.equipmentHealthScore}%
- Kund Stepwell Pool Pump #2: Bearing vibration (4.8 mm/s) scheduled for silent maintenance at 23:00 (Zero guest disruption)
- Cummins 750 kVA Silent DG Generator: 100% synchronized, fuel reserves at 94%
- Heritage Chiller HVAC: Operating at optimal 23.5°C across all havelis

3. STAFFING & LOGISTICS:
- Staff Coverage: ${kpis.staffCoverageRatio}%
- High-Volume Wedding Turnover: Singhania Silver Jubilee wedding arrivals coordinated with flex housekeeping overtime (+15%)
- Lead Butler: Vikramaditya Rathore on duty; Satvik Jain meal protocols verified with Chef Sanjeev Sen

4. COMMERCIAL & REVENUE OPPORTUNITY:
- Udaipur Royal Polo Season & Pichola Regatta comp-set occupancy at 94%
- Weekend dynamic rate lift (+12%) active (+₹24,50,000 projected upside)

Property Status: OPERATIONAL EXCELLENCE & PROACTIVE CARE`;

    navigator.clipboard.writeText(reportText);
    setCopiedReport(true);
    setTimeout(() => setCopiedReport(false), 3000);
  };

  return (
    <>
      {/* PERSISTENT FLOATING QUICK ACTIONS DOCK / SIDEBAR */}
      <aside
        aria-label="Manager Quick Actions"
        className="fixed right-3 sm:right-5 top-28 z-40 flex flex-col items-end"
      >
        {/* Toggle / Trigger Button with Rajasthan Palace Styling */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          id="quick-actions-toggle-btn"
          className="flex items-center gap-2 px-3.5 py-2.5 bg-gradient-to-r from-amber-700 via-amber-800 to-stone-900 text-amber-50 rounded-full shadow-lg hover:shadow-xl hover:from-amber-600 hover:to-stone-800 transition-all cursor-pointer border border-amber-500/40 group"
          title="Quick Actions Sidebar - Manager Shortcuts across all views"
        >
          <div className="w-2 h-2 rounded-full bg-amber-400 animate-pulse"></div>
          <Sparkles className="w-4 h-4 text-amber-300 group-hover:rotate-12 transition-transform" />
          <span className="text-xs font-bold tracking-tight uppercase font-serif">
            Quick Actions
          </span>
          {isOpen ? (
            <ChevronRight className="w-4 h-4 text-amber-300" />
          ) : (
            <ChevronLeft className="w-4 h-4 text-amber-300" />
          )}
        </button>

        {/* Expanded Floating Quick Panel */}
        {isOpen && (
          <div className="mt-2.5 w-76 sm:w-84 bg-[#fdfbf7] border border-amber-300/80 rounded-2xl shadow-2xl p-4 text-stone-900 animate-in fade-in slide-in-from-right-3 duration-200 backdrop-blur-md">
            {/* Header */}
            <div className="flex items-center justify-between pb-3 border-b border-amber-200/80 mb-3">
              <div>
                <span className="text-[10px] font-bold tracking-wider text-amber-800 uppercase block font-serif">
                  Palace Operations Hub
                </span>
                <h3 className="text-sm font-bold text-stone-900 flex items-center gap-1.5">
                  <span>Manager Fast Actions</span>
                </h3>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="text-stone-400 hover:text-stone-700 p-1 rounded-lg hover:bg-amber-100/50 transition cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Quick Live Snapshot Bar */}
            <div className="grid grid-cols-3 gap-1.5 bg-amber-50/70 p-2 rounded-xl border border-amber-200/60 mb-3 text-center text-xs">
              <div>
                <span className="text-[10px] text-amber-800/80 block">Palace Occ</span>
                <strong className="text-stone-900 font-bold">{kpis.occupancyRate}%</strong>
              </div>
              <div className="border-x border-amber-200/60">
                <span className="text-[10px] text-amber-800/80 block">On Duty</span>
                <strong className="text-stone-900 font-bold">{staff.length} Staff</strong>
              </div>
              <div>
                <span className="text-[10px] text-amber-800/80 block">Urgent WO</span>
                <strong className="text-amber-800 font-bold">1 Pump</strong>
              </div>
            </div>

            {/* Action Buttons List */}
            <div className="space-y-2">
              {/* 1. Check-in Guest */}
              <button
                id="qa-checkin-guest-btn"
                onClick={() => setActiveModal("checkin")}
                className="w-full flex items-center justify-between p-2.5 rounded-xl bg-white hover:bg-amber-50/80 border border-stone-200 hover:border-amber-300 transition-all text-left group shadow-xs cursor-pointer"
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-amber-100 flex items-center justify-center text-amber-800 group-hover:bg-amber-600 group-hover:text-white transition-colors">
                    <UserCheck className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-stone-900 group-hover:text-amber-900">
                      Check-in Guest
                    </h4>
                    <p className="text-[11px] text-stone-500">
                      Assign suite, diet & royal butler
                    </p>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-stone-300 group-hover:text-amber-700 group-hover:translate-x-0.5 transition-all" />
              </button>

              {/* 2. Open Work Order */}
              <button
                id="qa-open-workorder-btn"
                onClick={() => setActiveModal("workorder")}
                className="w-full flex items-center justify-between p-2.5 rounded-xl bg-white hover:bg-amber-50/80 border border-stone-200 hover:border-amber-300 transition-all text-left group shadow-xs cursor-pointer"
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-orange-100 flex items-center justify-center text-orange-800 group-hover:bg-orange-600 group-hover:text-white transition-colors">
                    <Wrench className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-stone-900 group-hover:text-orange-900">
                      Open Work Order
                    </h4>
                    <p className="text-[11px] text-stone-500">
                      IoT pump, chiller, DG or haveli ticket
                    </p>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-stone-300 group-hover:text-orange-700 group-hover:translate-x-0.5 transition-all" />
              </button>

              {/* 3. Generate Daily Report */}
              <button
                id="qa-generate-dailyreport-btn"
                onClick={() => setActiveModal("dailyreport")}
                className="w-full flex items-center justify-between p-2.5 rounded-xl bg-white hover:bg-emerald-50/80 border border-stone-200 hover:border-emerald-300 transition-all text-left group shadow-xs cursor-pointer"
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-emerald-100 flex items-center justify-center text-emerald-800 group-hover:bg-emerald-600 group-hover:text-white transition-colors">
                    <FileText className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-stone-900 group-hover:text-emerald-900">
                      Generate Daily Report
                    </h4>
                    <p className="text-[11px] text-stone-500">
                      Palace GM operations & revenue summary
                    </p>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-stone-300 group-hover:text-emerald-700 group-hover:translate-x-0.5 transition-all" />
              </button>

              {/* 4. Staff Broadcast */}
              <button
                id="qa-broadcast-staff-btn"
                onClick={() => setActiveModal("broadcast")}
                className="w-full flex items-center justify-between p-2.5 rounded-xl bg-white hover:bg-amber-50/80 border border-stone-200 hover:border-amber-300 transition-all text-left group shadow-xs cursor-pointer"
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-indigo-100 flex items-center justify-center text-indigo-800 group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                    <Radio className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-stone-900 group-hover:text-indigo-900">
                      Staff Alert Broadcast
                    </h4>
                    <p className="text-[11px] text-stone-500">
                      Instant message to all on-duty radios
                    </p>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-stone-300 group-hover:text-indigo-700 group-hover:translate-x-0.5 transition-all" />
              </button>

              {/* 5. Lake Pichola Shikara Escort */}
              <button
                id="qa-shikara-escort-btn"
                onClick={() => setActiveModal("shikara")}
                className="w-full flex items-center justify-between p-2.5 rounded-xl bg-white hover:bg-amber-50/80 border border-stone-200 hover:border-amber-300 transition-all text-left group shadow-xs cursor-pointer"
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-cyan-100 flex items-center justify-center text-cyan-800 group-hover:bg-cyan-600 group-hover:text-white transition-colors">
                    <Sailboat className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-stone-900 group-hover:text-cyan-900">
                      Lake Pichola Shikara Dispatch
                    </h4>
                    <p className="text-[11px] text-stone-500">
                      Jetty arrival boat & sunset cruise
                    </p>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-stone-300 group-hover:text-cyan-700 group-hover:translate-x-0.5 transition-all" />
              </button>
            </div>

            <div className="mt-3 pt-2.5 border-t border-amber-200/60 text-center">
              <span className="text-[10px] text-amber-900/70 font-medium">
                Active across all tabs & views
              </span>
            </div>
          </div>
        )}
      </aside>

      {/* 1. CHECK-IN GUEST MODAL */}
      {activeModal === "checkin" && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-stone-950/60 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="bg-[#fdfbf7] border border-amber-300/80 rounded-2xl max-w-xl w-full p-6 shadow-2xl animate-in zoom-in-95 duration-150 my-8">
            <div className="flex items-center justify-between pb-3 border-b border-amber-200">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-amber-100 flex items-center justify-center text-amber-800">
                  <UserCheck className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-bold font-serif text-stone-900">
                    Royal Guest Check-In & Suite Assignment
                  </h3>
                  <p className="text-xs text-stone-500">
                    Register VIP arrivals, capture dietary rituals, and dispatch butler service.
                  </p>
                </div>
              </div>
              <button
                onClick={() => setActiveModal(null)}
                className="text-stone-400 hover:text-stone-600 p-1.5 rounded-lg hover:bg-amber-100/40 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {checkInSuccess ? (
              <div className="py-8 text-center space-y-3">
                <CheckCircle2 className="w-12 h-12 text-emerald-600 mx-auto animate-bounce" />
                <h4 className="text-base font-bold text-stone-900">
                  Palace Check-In Confirmed!
                </h4>
                <p className="text-xs text-stone-600 max-w-md mx-auto">
                  {checkInSuccess}
                </p>
              </div>
            ) : (
              <form onSubmit={handleCheckInSubmit} className="mt-4 space-y-4 text-xs">
                {/* Guest Name & Presets */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="font-bold text-stone-700">
                      Guest / Royal Party Name
                    </label>
                    <div className="flex gap-1.5 text-[10px]">
                      <button
                        type="button"
                        onClick={() => setGuestName("Maharaj Kumar Raghavendra & Family")}
                        className="text-amber-800 underline hover:text-amber-950 cursor-pointer"
                      >
                        Sample VIP 1
                      </button>
                      <span>·</span>
                      <button
                        type="button"
                        onClick={() => setGuestName("Shri Vikram & Radhika Mittal")}
                        className="text-amber-800 underline hover:text-amber-950 cursor-pointer"
                      >
                        Sample VIP 2
                      </button>
                    </div>
                  </div>
                  <input
                    type="text"
                    required
                    value={guestName}
                    onChange={(e) => setGuestName(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-stone-300 bg-white text-stone-900 font-medium focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-hidden"
                  />
                </div>

                {/* Suite & VIP Tier */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="font-bold text-stone-700 block mb-1">
                      Assigned Suite / Haveli
                    </label>
                    <select
                      value={selectedSuite}
                      onChange={(e) => setSelectedSuite(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-stone-300 bg-white text-stone-900 font-medium focus:ring-2 focus:ring-amber-500 outline-hidden"
                    >
                      <option value="Maharaja Heritage Lake Suite 302">
                        Suite 302 · Maharaja Heritage Lake Suite
                      </option>
                      <option value="Lakeview Haveli 104">
                        Haveli 104 · Lakeview Private Plunge Pool
                      </option>
                      <option value="Royal Courtyard Pavilion 208">
                        Pavilion 208 · Royal Courtyard Peacock Garden
                      </option>
                      <option value="Pichola Sunrise Villa 112">
                        Villa 112 · Pichola Sunrise Balcony
                      </option>
                      <option value="Jag Mandir Vista Suite 401">
                        Suite 401 · Jag Mandir Panoramic Vista
                      </option>
                    </select>
                  </div>

                  <div>
                    <label className="font-bold text-stone-700 block mb-1">
                      VIP Status Tier
                    </label>
                    <select
                      value={vipTier}
                      onChange={(e) => setVipTier(e.target.value as any)}
                      className="w-full px-3 py-2 rounded-xl border border-stone-300 bg-white text-stone-900 font-medium focus:ring-2 focus:ring-amber-500 outline-hidden"
                    >
                      <option value="Platinum Royal">👑 Platinum Royal (Full Palace Privileges)</option>
                      <option value="Diamond VIP">💎 Diamond VIP (Butler & Shikara Included)</option>
                      <option value="Gold Club">⭐ Gold Club (Priority Spa & Dining)</option>
                      <option value="Standard">Standard Guest</option>
                    </select>
                  </div>
                </div>

                {/* Guest Count & Nights */}
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="font-bold text-stone-700 block mb-1">
                      Number of Guests
                    </label>
                    <input
                      type="number"
                      min={1}
                      max={12}
                      value={guestCount}
                      onChange={(e) => setGuestCount(Number(e.target.value))}
                      className="w-full px-3 py-2 rounded-xl border border-stone-300 bg-white font-medium"
                    />
                  </div>
                  <div>
                    <label className="font-bold text-stone-700 block mb-1">
                      Nights of Stay
                    </label>
                    <input
                      type="number"
                      min={1}
                      max={30}
                      value={nights}
                      onChange={(e) => setNights(Number(e.target.value))}
                      className="w-full px-3 py-2 rounded-xl border border-stone-300 bg-white font-medium"
                    />
                  </div>
                  <div className="col-span-2 sm:col-span-1">
                    <label className="font-bold text-stone-700 block mb-1">
                      Assigned Head Butler
                    </label>
                    <select
                      value={assignedButler}
                      onChange={(e) => setAssignedButler(e.target.value)}
                      className="w-full px-2.5 py-2 rounded-xl border border-stone-300 bg-white font-medium text-[11px]"
                    >
                      <option value="Vikramaditya Rathore (Head Butler)">Vikramaditya Rathore</option>
                      <option value="Sunita Nair (Haveli Ops)">Sunita Nair</option>
                      <option value="Aarav Mehta (Duty Mgr)">Aarav Mehta</option>
                    </select>
                  </div>
                </div>

                {/* Cultural & Dietary Tags */}
                <div>
                  <label className="font-bold text-stone-700 block mb-1.5">
                    Dietary Rituals & Special Welcoming Protocols
                  </label>
                  <div className="flex flex-wrap gap-1.5">
                    {[
                      "Strict Satvik Jain preparation",
                      "Traditional Mewari Thali",
                      "Ayurvedic Sattvic Rejuvenation",
                      "Gluten-Free / Nut Allergy",
                      "Royal Aarti & Saffron Garland at Toran Pol",
                      "Private Lake Sunset Shikara",
                      "Silver Jubilee Anniversary",
                    ].map((tag) => {
                      const isSelected = dietTags.includes(tag);
                      return (
                        <button
                          key={tag}
                          type="button"
                          onClick={() => toggleDietTag(tag)}
                          className={`px-2.5 py-1 rounded-full text-[11px] font-medium transition cursor-pointer ${
                            isSelected
                              ? "bg-amber-800 text-white font-semibold"
                              : "bg-stone-100 text-stone-700 hover:bg-stone-200"
                          }`}
                        >
                          {isSelected ? "✓ " : "+ "}
                          {tag}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-amber-200">
                  <button
                    type="button"
                    onClick={() => setActiveModal(null)}
                    className="px-4 py-2 rounded-xl text-xs font-semibold text-stone-600 hover:bg-stone-200/60 cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 rounded-xl text-xs font-bold text-white bg-amber-800 hover:bg-amber-900 active:scale-98 transition shadow-sm cursor-pointer flex items-center gap-1.5"
                  >
                    <UserCheck className="w-4 h-4 text-amber-300" />
                    <span>Confirm Royal Check-In</span>
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* 2. OPEN WORK ORDER MODAL */}
      {activeModal === "workorder" && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-stone-950/60 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="bg-[#fdfbf7] border border-amber-300/80 rounded-2xl max-w-xl w-full p-6 shadow-2xl animate-in zoom-in-95 duration-150 my-8">
            <div className="flex items-center justify-between pb-3 border-b border-amber-200">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-orange-100 flex items-center justify-center text-orange-800">
                  <Wrench className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-bold font-serif text-stone-900">
                    Dispatch Preventive / Urgent Work Order
                  </h3>
                  <p className="text-xs text-stone-500">
                    Create maintenance ticket with zero-downtime silent scheduling.
                  </p>
                </div>
              </div>
              <button
                onClick={() => setActiveModal(null)}
                className="text-stone-400 hover:text-stone-600 p-1.5 rounded-lg hover:bg-amber-100/40 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {woSuccess ? (
              <div className="py-8 text-center space-y-3">
                <CheckCircle2 className="w-12 h-12 text-emerald-600 mx-auto animate-bounce" />
                <h4 className="text-base font-bold text-stone-900">
                  Work Order Dispatched!
                </h4>
                <p className="text-xs text-stone-600 max-w-md mx-auto">
                  {woSuccess}
                </p>
              </div>
            ) : (
              <form onSubmit={handleWorkOrderSubmit} className="mt-4 space-y-4 text-xs">
                {/* Equipment Selection */}
                <div>
                  <label className="font-bold text-stone-700 block mb-1">
                    Equipment / Facility Location
                  </label>
                  <select
                    value={selectedAsset}
                    onChange={(e) => {
                      setSelectedAsset(e.target.value);
                      if (e.target.value.includes("Pool Pump")) {
                        setWorkOrderIssue(
                          "Bearing vibration threshold reached (4.8 mm/s) - cavitation & monsoon silt flushing required"
                        );
                        setWoPriority("urgent");
                        setWoCost(18500);
                      } else if (e.target.value.includes("Chiller")) {
                        setWorkOrderIssue(
                          "Central HVAC compressor thermal cycle recalibration and Freon pressure check"
                        );
                        setWoPriority("high");
                        setWoCost(24000);
                      } else if (e.target.value.includes("DG")) {
                        setWorkOrderIssue(
                          "750 kVA Cummins silent diesel generator fuel sediment filter swap & auto-mains sync test"
                        );
                        setWoPriority("routine");
                        setWoCost(14500);
                      } else {
                        setWorkOrderIssue("Routine inspection and preventative overhaul");
                        setWoPriority("routine");
                        setWoCost(8000);
                      }
                    }}
                    className="w-full px-3 py-2 rounded-xl border border-stone-300 bg-white text-stone-900 font-medium focus:ring-2 focus:ring-orange-500 outline-hidden"
                  >
                    <option value="Kund Stepwell Pool Pump #2">
                      🏊 Kund Stepwell Pool Pump #2 (Flagged Vibration: 4.8 mm/s)
                    </option>
                    <option value="Centralized Haveli HVAC Chiller #1">
                      ❄️ Centralized Haveli HVAC Chiller #1 (Chilled Water Loop)
                    </option>
                    <option value="750 kVA Cummins Silent DG Backup Generator">
                      ⚡ 750 kVA Cummins Silent DG Backup Generator (Monsoon Grid Backup)
                    </option>
                    <option value="Lake Terrace Kitchen Walk-In Cold Room">
                      🥩 Lake Terrace Kitchen Walk-In Cold Room (-18°C)
                    </option>
                    <option value="Lake Pichola Electric Golf Buggy #3">
                      🛺 Lake Pichola Electric Golf Buggy #3 (Lithium Pack Check)
                    </option>
                    <option value="Spa Shirodhara Oil Flow Controller">
                      🌿 Spa Shirodhara Oil Flow Controller & Heating Matrix
                    </option>
                  </select>
                </div>

                {/* Issue Description */}
                <div>
                  <label className="font-bold text-stone-700 block mb-1">
                    Telemetry / Issue Diagnostics
                  </label>
                  <textarea
                    rows={2}
                    required
                    value={workOrderIssue}
                    onChange={(e) => setWorkOrderIssue(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-stone-300 bg-white font-medium focus:ring-2 focus:ring-orange-500 outline-hidden"
                  />
                </div>

                {/* Priority, Assignee & Maintenance Window */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="font-bold text-stone-700 block mb-1">
                      Priority Level
                    </label>
                    <select
                      value={woPriority}
                      onChange={(e) => setWoPriority(e.target.value as any)}
                      className="w-full px-3 py-2 rounded-xl border border-stone-300 bg-white font-medium"
                    >
                      <option value="urgent">🔴 Urgent (Zero Downtime)</option>
                      <option value="high">🟠 High (Next 12 Hours)</option>
                      <option value="routine">🟢 Routine Preventive</option>
                    </select>
                  </div>

                  <div>
                    <label className="font-bold text-stone-700 block mb-1">
                      Assigned Lead Tech
                    </label>
                    <select
                      value={woAssignee}
                      onChange={(e) => setWoAssignee(e.target.value)}
                      className="w-full px-2.5 py-2 rounded-xl border border-stone-300 bg-white font-medium text-[11px]"
                    >
                      <option value="Rajesh Mhatre (Chief Electro-Mechanical)">
                        Rajesh Mhatre (Chief Mechatronics)
                      </option>
                      <option value="Devendra Saini (Electrical & Solar)">
                        Devendra Saini (Power Systems)
                      </option>
                      <option value="Sunita Nair (Haveli Facilities)">
                        Sunita Nair (Housekeeping Ops)
                      </option>
                    </select>
                  </div>

                  <div>
                    <label className="font-bold text-stone-700 block mb-1">
                      Maintenance Window
                    </label>
                    <select
                      value={woWindow}
                      onChange={(e) => setWoWindow(e.target.value)}
                      className="w-full px-2.5 py-2 rounded-xl border border-stone-300 bg-white font-medium text-[11px]"
                    >
                      <option value="Silent Night Window (23:00 – 04:00)">
                        🌙 Silent Night (23:00–04:00)
                      </option>
                      <option value="Immediate Service (Isolated Circuit)">
                        ⚡ Immediate (Isolated Circuit)
                      </option>
                      <option value="Afternoon Turnover (14:00 – 16:00)">
                        ☀️ Afternoon Turnover (14:00)
                      </option>
                    </select>
                  </div>
                </div>

                {/* Estimated Cost INR */}
                <div className="bg-amber-50/70 p-3 rounded-xl border border-amber-200 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-emerald-700" />
                    <div>
                      <span className="font-bold text-stone-800 block text-[11px]">
                        Zero Guest Impact Protocol
                      </span>
                      <span className="text-[10px] text-stone-500">
                        Automatic telemetry tracking enabled post-repair.
                      </span>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] text-stone-500 block uppercase">
                      Budgeted Parts & Labor
                    </span>
                    <strong className="text-stone-900 font-bold text-sm">
                      ₹{woCost.toLocaleString("en-IN")}
                    </strong>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-amber-200">
                  <button
                    type="button"
                    onClick={() => setActiveModal(null)}
                    className="px-4 py-2 rounded-xl text-xs font-semibold text-stone-600 hover:bg-stone-200/60 cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 rounded-xl text-xs font-bold text-white bg-orange-700 hover:bg-orange-800 active:scale-98 transition shadow-sm cursor-pointer flex items-center gap-1.5"
                  >
                    <Wrench className="w-4 h-4 text-orange-200" />
                    <span>Dispatch Preventive Ticket</span>
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* 3. GENERATE DAILY REPORT MODAL */}
      {activeModal === "dailyreport" && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-stone-950/60 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="bg-[#fdfbf7] border border-amber-300/80 rounded-2xl max-w-2xl w-full p-6 sm:p-7 shadow-2xl animate-in zoom-in-95 duration-150 my-8">
            <div className="flex items-center justify-between pb-3 border-b border-amber-200">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-emerald-100 flex items-center justify-center text-emerald-800">
                  <FileText className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-bold font-serif text-stone-900">
                    Daily General Manager Executive Report
                  </h3>
                  <p className="text-xs text-stone-500">
                    Consolidated 360 intelligence across Operations, Revenue, Staffing, and Guest NPS.
                  </p>
                </div>
              </div>
              <button
                onClick={() => setActiveModal(null)}
                className="text-stone-400 hover:text-stone-600 p-1.5 rounded-lg hover:bg-amber-100/40 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Printable Report Document Body */}
            <div className="mt-4 p-5 rounded-xl border border-stone-200 bg-white space-y-4 text-xs text-stone-800 max-h-[60vh] overflow-y-auto">
              {/* Document Header */}
              <div className="text-center border-b border-stone-200 pb-3">
                <span className="text-[10px] tracking-widest uppercase font-bold text-amber-800 font-serif">
                  Veda Vilas Palace & Ayurvedic Sanctuary
                </span>
                <h2 className="text-base font-bold font-serif text-stone-900">
                  Daily GM Operations & Revenue Briefing
                </h2>
                <span className="text-[11px] text-stone-500">
                  Lake Pichola, Udaipur, Rajasthan · Wednesday, September 9, 2026
                </span>
              </div>

              {/* KPI Strip */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center bg-amber-50/50 p-2.5 rounded-xl border border-amber-200/70">
                <div>
                  <span className="text-[10px] text-stone-500 uppercase font-semibold">Occupancy</span>
                  <strong className="block text-base font-bold text-stone-900">{kpis.occupancyRate}%</strong>
                  <span className="text-[10px] text-emerald-700 font-medium">124 / 140 Suites</span>
                </div>
                <div>
                  <span className="text-[10px] text-stone-500 uppercase font-semibold">RevPAR</span>
                  <strong className="block text-base font-bold text-stone-900">₹{kpis.revPAR.toLocaleString("en-IN")}</strong>
                  <span className="text-[10px] text-emerald-700 font-medium">+14.2% vs Budget</span>
                </div>
                <div>
                  <span className="text-[10px] text-stone-500 uppercase font-semibold">ADR (INR)</span>
                  <strong className="block text-base font-bold text-stone-900">₹{kpis.averageDailyRate.toLocaleString("en-IN")}</strong>
                  <span className="text-[10px] text-stone-500 font-medium">Comp Avg: ₹36,500</span>
                </div>
                <div>
                  <span className="text-[10px] text-stone-500 uppercase font-semibold">Guest NPS</span>
                  <strong className="block text-base font-bold text-amber-700">{kpis.guestSatisfactionScore} / 5.0</strong>
                  <span className="text-[10px] text-emerald-700 font-medium">94% Positive</span>
                </div>
              </div>

              {/* 1. Engineering Telemetry */}
              <div className="space-y-1.5">
                <h4 className="font-bold text-stone-900 flex items-center gap-1.5 border-b border-stone-100 pb-1">
                  <span className="w-2 h-2 rounded-full bg-emerald-600"></span>
                  1. IoT Preventive Engineering Telemetry
                </h4>
                <p className="text-stone-600 leading-relaxed text-[11px]">
                  <strong>Plant Health: {kpis.equipmentHealthScore}%</strong>. Micro-sensors detected early bearing vibration (4.8 mm/s) on <strong>Kund Stepwell Pool Pump #2</strong>. Silent preventive maintenance is scheduled tonight at 23:00 with Chief Engineer Rajesh Mhatre (Zero guest downtime). 750 kVA Cummins silent DG backup generator tested at 100% load with 94% fuel capacity.
                </p>
              </div>

              {/* 2. Staffing & High-Volume Turnover */}
              <div className="space-y-1.5">
                <h4 className="font-bold text-stone-900 flex items-center gap-1.5 border-b border-stone-100 pb-1">
                  <span className="w-2 h-2 rounded-full bg-indigo-600"></span>
                  2. Staffing & Singhania Wedding Logistics
                </h4>
                <p className="text-stone-600 leading-relaxed text-[11px]">
                  <strong>Staff Coverage: {kpis.staffCoverageRatio}%</strong>. Tomorrow&apos;s checkout rush (42 suite turnover) successfully load-balanced with +15% overtime flex for Sunita Nair and reserve haveli attendants. Head Butler Vikramaditya Rathore is actively managing the Singhania Silver Jubilee anniversary protocols, including strict Satvik Jain kitchen orders with Executive Chef Sanjeev Sen.
                </p>
              </div>

              {/* 3. Revenue & Commercial Opportunities */}
              <div className="space-y-1.5">
                <h4 className="font-bold text-stone-900 flex items-center gap-1.5 border-b border-stone-100 pb-1">
                  <span className="w-2 h-2 rounded-full bg-amber-600"></span>
                  3. Dynamic Yield & Event Correlation
                </h4>
                <p className="text-stone-600 leading-relaxed text-[11px]">
                  Udaipur Royal Polo Season and Lake Pichola Regatta have elevated city-wide 5-star comp-set bookings to 94%. Algorithmic rate increase (+12%) deployed, capturing an estimated <strong>+₹24,50,000</strong> in high-yield weekend revenue. Lake terrace private dining bundles are 88% reserved.
                </p>
              </div>

              {/* 4. Weather & Lake Conditions */}
              <div className="space-y-1.5">
                <h4 className="font-bold text-stone-900 flex items-center gap-1.5 border-b border-stone-100 pb-1">
                  <span className="w-2 h-2 rounded-full bg-cyan-600"></span>
                  4. Lake Pichola Environmental Conditions
                </h4>
                <p className="text-stone-600 leading-relaxed text-[11px]">
                  Current weather: 28°C with gentle northwest breeze (6 knots). Lake Pichola water level and clarity optimal. Sunset scheduled for 18:34; all 4 private electric Shikara boats cleared for evening cruises.
                </p>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap items-center justify-between gap-2 pt-4 border-t border-amber-200 mt-4 text-xs">
              <span className="text-[11px] text-stone-500">
                Generated automatically by Gemini 3.8 Intelligence Engine
              </span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleCopyReport}
                  className="px-3.5 py-2 rounded-xl font-semibold text-stone-700 bg-stone-100 hover:bg-stone-200 transition cursor-pointer flex items-center gap-1.5"
                >
                  <Copy className="w-3.5 h-3.5 text-stone-600" />
                  <span>{copiedReport ? "✓ Copied to Clipboard!" : "Copy Report Text"}</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    window.print();
                  }}
                  className="px-4 py-2 rounded-xl font-bold text-white bg-emerald-700 hover:bg-emerald-800 transition cursor-pointer flex items-center gap-1.5 shadow-sm"
                >
                  <Printer className="w-3.5 h-3.5 text-emerald-200" />
                  <span>Download / Print PDF</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 4. STAFF ALERT BROADCAST MODAL */}
      {activeModal === "broadcast" && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-stone-950/60 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="bg-[#fdfbf7] border border-amber-300/80 rounded-2xl max-w-md w-full p-6 shadow-2xl animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-amber-200">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-indigo-100 flex items-center justify-center text-indigo-800">
                  <Radio className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold font-serif text-stone-900">
                    Broadcast Pager Alert to On-Duty Staff
                  </h3>
                  <p className="text-xs text-stone-500">
                    Sends instant notification across all 6 active department pagers.
                  </p>
                </div>
              </div>
              <button
                onClick={() => setActiveModal(null)}
                className="text-stone-400 hover:text-stone-600 p-1.5 rounded-lg hover:bg-amber-100/40 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {broadcastSuccess ? (
              <div className="py-6 text-center space-y-2">
                <CheckCircle2 className="w-10 h-10 text-emerald-600 mx-auto animate-bounce" />
                <h4 className="text-sm font-bold text-stone-900">{broadcastSuccess}</h4>
              </div>
            ) : (
              <form onSubmit={handleBroadcastSubmit} className="mt-4 space-y-3 text-xs">
                <div>
                  <label className="font-bold text-stone-700 block mb-1">
                    Radio Alert Message
                  </label>
                  <textarea
                    rows={3}
                    required
                    value={broadcastMsg}
                    onChange={(e) => setBroadcastMsg(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-stone-300 bg-white font-medium focus:ring-2 focus:ring-indigo-500 outline-hidden"
                  />
                </div>

                <div className="flex items-center justify-end gap-2 pt-2 border-t border-amber-200">
                  <button
                    type="button"
                    onClick={() => setActiveModal(null)}
                    className="px-3 py-1.5 rounded-xl font-semibold text-stone-600 hover:bg-stone-200/60 cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-1.5 rounded-xl font-bold text-white bg-indigo-700 hover:bg-indigo-800 transition cursor-pointer flex items-center gap-1.5"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>Send Radio Broadcast</span>
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* 5. SHIKARA DISPATCH MODAL */}
      {activeModal === "shikara" && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-stone-950/60 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="bg-[#fdfbf7] border border-amber-300/80 rounded-2xl max-w-md w-full p-6 shadow-2xl animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-amber-200">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-cyan-100 flex items-center justify-center text-cyan-800">
                  <Sailboat className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold font-serif text-stone-900">
                    Lake Pichola Shikara Boat Dispatch
                  </h3>
                  <p className="text-xs text-stone-500">
                    Stage electric royal boat at Lake Jetty for guest arrival or sunset cruise.
                  </p>
                </div>
              </div>
              <button
                onClick={() => setActiveModal(null)}
                className="text-stone-400 hover:text-stone-600 p-1.5 rounded-lg hover:bg-amber-100/40 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="mt-4 space-y-3 text-xs">
              <div className="p-3 bg-cyan-50/70 border border-cyan-200 rounded-xl space-y-1">
                <strong className="text-cyan-950 font-bold block">
                  Active Fleet: 4 Royal Electric Shikaras
                </strong>
                <p className="text-cyan-900/80 text-[11px]">
                  Shikara #1 (Mewar Rajhans): Staged at Lake Jetty for Singhania VIPs.
                  <br />
                  Shikara #2 & #3: Available for 17:30 sunset cruises with classical Sitar.
                </p>
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setActiveModal(null)}
                  className="px-3 py-1.5 rounded-xl font-semibold text-stone-600 hover:bg-stone-200/60 cursor-pointer"
                >
                  Close
                </button>
                <button
                  type="button"
                  onClick={() => {
                    onBroadcastStaff("Royal Shikara #2 dispatched to Lake Jetty for VIP arrival escort.");
                    setActiveModal(null);
                  }}
                  className="px-4 py-1.5 rounded-xl font-bold text-white bg-cyan-700 hover:bg-cyan-800 transition cursor-pointer flex items-center gap-1.5"
                >
                  <Sailboat className="w-3.5 h-3.5" />
                  <span>Dispatch Royal Shikara Now</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
