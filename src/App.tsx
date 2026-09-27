import React, { useState, useEffect } from "react";
import {
  LayoutDashboard,
  Activity,
  Users,
  HeartHandshake,
  MessageSquare,
  DollarSign,
} from "lucide-react";
import { Header } from "./components/Header";
import { CommandCenterTab } from "./components/CommandCenterTab";
import { OperationsTab } from "./components/OperationsTab";
import { StaffingTab } from "./components/StaffingTab";
import { GuestConciergeTab } from "./components/GuestConciergeTab";
import { SentimentTab } from "./components/SentimentTab";
import { RevenueTab } from "./components/RevenueTab";
import { AuditModal } from "./components/AuditModal";
import { QuickActionsSidebar } from "./components/QuickActionsSidebar";
import WeatherTwin from "./components/WeatherTwin";

import {
  initialKPIs,
  initialIoTAssets,
  initialInventory,
  initialStaff,
  initialGuests,
  initialReviews,
  initialPricingOptions,
  initialAlerts,
} from "./data/resortData";
import {
  ResortKPIs,
  IoTEquipment,
  InventoryItem,
  StaffShift,
  GuestProfile,
  GuestReview,
  DynamicPricingOption,
  OperationalAlert,
} from "./types";

// Adding check-in/out tracking to our local KPI state
interface ExtendedKPIs extends ResortKPIs {
  checkInsToday: number;
  checkOutsToday: number;
}

export default function App() {
  const [activeTab, setActiveTab] = useState<string>("command");
  
  // Initialize with new check-in/out metrics
  const [kpis, setKpis] = useState<ExtendedKPIs>({
    ...initialKPIs,
    checkInsToday: 42,
    checkOutsToday: 38
  });
  
  const [assets, setAssets] = useState<IoTEquipment[]>(initialIoTAssets);
  const [inventory, setInventory] = useState<InventoryItem[]>(initialInventory);
  const [staff, setStaff] = useState<StaffShift[]>(initialStaff);
  const [guests, setGuests] = useState<GuestProfile[]>(initialGuests);
  const [reviews, setReviews] = useState<GuestReview[]>(initialReviews);
  const [pricingOptions, setPricingOptions] = useState<DynamicPricingOption[]>(initialPricingOptions);
  const [alerts, setAlerts] = useState<OperationalAlert[]>(initialAlerts);

  const [isAuditModalOpen, setIsAuditModalOpen] = useState(false);
  const [isSimulating, setIsSimulating] = useState(false);
  const [globalBanner, setGlobalBanner] = useState<string | null>(null);

  // --- NEW AI FEATURE: AUTOMATIC INVENTORY ORDERING ---
  // The AI watches inventory and auto-orders if things get critically low
  useEffect(() => {
    const lowStockItems = inventory.filter(item => item.status === "critical_low" || item.currentStock < 10);
    
    if (lowStockItems.length > 0) {
      lowStockItems.forEach(item => {
        // Automatically reorder behind the scenes
        handleReorderInventory(item.id);
        
        // Notify the manager that AI handled it
        setGlobalBanner(`🤖 AI Auto-Procurement triggered: Supplies for ${item.name} were low. Automated vendor order placed.`);
        
        // Auto-resolve any alerts related to this inventory
        setAlerts(prev => prev.map(a => 
          a.title.toLowerCase().includes(item.name.toLowerCase()) ? { ...a, resolved: true } : a
        ));
      });
      
      setTimeout(() => setGlobalBanner(null), 6000);
    }
  }, [inventory]);

  const handleResolveAlert = (alertId: string) => {
    setAlerts((prev) =>
      prev.map((a) => (a.id === alertId ? { ...a, resolved: true } : a))
    );
    setKpis((prev) => ({
      ...prev,
      activeAlertsCount: Math.max(0, prev.activeAlertsCount - 1),
      equipmentHealthScore: Math.min(99, prev.equipmentHealthScore + 1.2),
    }));
  };

  const handleDispatchWorkOrder = (assetId: string) => {
    setAssets((prev) =>
      prev.map((a) =>
        a.id === assetId
          ? { ...a, status: "optimal", healthScore: 94, failureRiskPct: 12, vibrationMmS: 2.0, flaggedIssue: undefined }
          : a
      )
    );
  };

  // Upgraded Reorder Logic
  const handleReorderInventory = (itemId: string) => {
    setInventory((prev) =>
      prev.map((item) =>
        item.id === itemId
          ? { ...item, currentStock: item.currentStock + 50, status: "adequate", daysRemaining: 15 }
          : item
      )
    );
  };

  const handleApplyStaffOptimization = (updatedStaff: StaffShift[]) => {
    setStaff(updatedStaff);
    setAlerts((prev) => prev.map((a) => a.department === "Staffing" ? { ...a, resolved: true } : a));
    setKpis((prev) => ({ ...prev, staffCoverageRatio: 98 }));
  };

  const handleApplyPricing = (updatedPricing: DynamicPricingOption[]) => {
    setPricingOptions(updatedPricing);
    setAlerts((prev) => prev.map((a) => a.department === "Revenue" ? { ...a, resolved: true } : a));
    setKpis((prev) => ({ ...prev, averageDailyRate: 462, revPAR: 418 }));
  };

  const handleResolveReview = (reviewId: string, responseText: string) => {
    setReviews((prev) => prev.map((r) => r.id === reviewId ? { ...r, triageStatus: "resolved", aiSuggestedResponse: responseText } : r));
    setKpis((prev) => ({ ...prev, guestSatisfactionScore: 4.88 }));
  };

  const handleAddReview = (newReview: GuestReview) => {
    setReviews((prev) => [newReview, ...prev]);
  };

  const handleExecuteAllMitigations = () => {
    setAlerts((prev) => prev.map((a) => ({ ...a, resolved: true })));
    setAssets((prev) => prev.map((a) => ({ ...a, status: "optimal", healthScore: 98, failureRiskPct: 8, vibrationMmS: 1.6 })));
    setStaff((prev) => prev.map((s) => ({ ...s, workloadIndex: Math.min(s.workloadIndex, 85) })));
    setKpis((prev) => ({ ...prev, equipmentHealthScore: 98.6, staffCoverageRatio: 97, activeAlertsCount: 0, revPAR: 422 }));
    setGlobalBanner("360 Cross-Department AI Mitigations successfully deployed across all resort systems.");
    setTimeout(() => setGlobalBanner(null), 6000);
  };

  // Upgraded Sim: Also drops inventory to trigger AI Auto-order
  const handleSimulatePeakRush = () => {
    setIsSimulating(true);
    setGlobalBanner("Simulating Weekend Surge: Occupancy at 94%, Towel & Food supplies dropping rapidly...");

    setTimeout(() => {
      setKpis((prev) => ({ ...prev, occupancyRate: 94, revPAR: 412 }));
      // Dropping stock to 5 to instantly trigger the AI auto-order useEffect above!
      setInventory((prev) =>
        prev.map((item) =>
          item.name.includes("Towels") || item.name.includes("Wagyu")
            ? { ...item, currentStock: 5, daysRemaining: 0.5, status: "critical_low" }
            : item
        )
      );
      setIsSimulating(false);
    }, 1500);
  };

  // Upgraded Check-in: Updates our new metrics
  const handleCheckInGuest = (newGuest: GuestProfile) => {
    setGuests((prev) => [newGuest, ...prev]);
    setKpis((prev) => ({
      ...prev,
      occupancyRate: Math.min(100, prev.occupancyRate + 1),
      checkInsToday: prev.checkInsToday + 1
    }));
    setGlobalBanner(`Royal Welcome: ${newGuest.name} checked into ${newGuest.room}. Smart AC & Lighting activated.`);
    setTimeout(() => setGlobalBanner(null), 6000);
  };

  // --- NEW AI FEATURE: SMART STAFF ALLOCATION ---
  // Replaced arbitrary "Criticality" with AI intent routing
  const handleQuickWorkOrder = (wo: { assetName: string; issue: string; priority: string; assignee: string; maintenanceWindow: string; }) => {
    
    // AI determines the right department based on the issue words
    let smartAssignee = wo.assignee;
    const issueText = wo.issue.toLowerCase();
    if (issueText.includes("leak") || issueText.includes("pipe") || issueText.includes("water")) smartAssignee = "Lead Plumber";
    else if (issueText.includes("ac") || issueText.includes("temp") || issueText.includes("hvac")) smartAssignee = "HVAC Technician";
    else if (issueText.includes("food") || issueText.includes("spill")) smartAssignee = "F&B Response Team";
    else if (issueText.includes("wifi") || issueText.includes("internet")) smartAssignee = "IT Specialist";

    const targetAsset = assets.find((a) => a.name.toLowerCase().includes("pump") || wo.assetName.includes(a.name));
    if (targetAsset) handleDispatchWorkOrder(targetAsset.id);

    const newAlert: OperationalAlert = {
      id: `alert-${Date.now()}`,
      department: "Smart Routing",
      title: `${wo.assetName} - Auto-Assigned by AI`,
      severity: "medium", // Kept in data for UI coloring, but conceptually hidden from manager stress
      description: `Issue: "${wo.issue}". AI has routed this to the ${smartAssignee} based on issue type.`,
      timestamp: "Just now",
      actionTitle: `View Tracking`,
      automatedWorkflowAvailable: true,
      resolved: false,
    };
    
    setAlerts((prev) => [newAlert, ...prev]);
    setGlobalBanner(`AI Smart Routing: '${wo.issue}' instantly assigned to ${smartAssignee}.`);
    setTimeout(() => setGlobalBanner(null), 6000);
  };

  const handleBroadcastStaff = (message: string) => {
    setGlobalBanner(`Palace Staff Broadcast: "${message}" sent to all on-duty radios.`);
    setTimeout(() => setGlobalBanner(null), 6000);
  };

  const handleRunWeatherSimulation = (data: any) => {
    setGlobalBanner(`Digital Twin Synced: Simulated Weather Impacts Triggered. Running AI Audit...`);
    setIsAuditModalOpen(true);
  };

  const activeAlertCount = alerts.filter((a) => !a.resolved).length;
  const warningAssetCount = assets.filter((a) => a.status !== "optimal").length;

  const tabs = [
    { id: "command", label: "Overview & Status", icon: LayoutDashboard, badge: activeAlertCount > 0 ? `${activeAlertCount} alert` : undefined, badgeColor: "bg-amber-600 text-white" },
    { id: "concierge", label: "AI Assistant & Chat", icon: MessageSquare, badge: "Explainer", badgeColor: "bg-emerald-700 text-white" },
    { id: "operations", label: "Equipment & Ops", icon: Activity, badge: warningAssetCount > 0 ? `${warningAssetCount} warning` : undefined, badgeColor: "bg-orange-600 text-white" },
    { id: "staffing", label: "Staff & Shifts", icon: Users },
    { id: "sentiment", label: "Guest Reviews", icon: HeartHandshake, badge: `${reviews.length}`, badgeColor: "bg-stone-200 text-stone-700" },
    { id: "revenue", label: "Dynamic Pricing", icon: DollarSign, badge: "+10.6%", badgeColor: "bg-amber-100 text-amber-900 border border-amber-300" },
  ];

  return (
    <div className="min-h-screen bg-[#f7f3eb]/95 text-stone-900 flex flex-col font-sans palace-motif-pattern">
      <Header
        kpis={kpis}
        onOpenAudit={() => setIsAuditModalOpen(true)}
        onSimulateEvent={handleSimulatePeakRush}
        isSimulating={isSimulating}
      />

      {/* NEW: Live Check-in/Check-out AI Tracker Bar */}
      <div className="bg-stone-900 text-amber-400 px-4 py-2 text-sm flex justify-center gap-8 border-b border-amber-500/30 font-medium">
        <span>🛎️ Today's Check-ins: <strong className="text-white">{kpis.checkInsToday}</strong> pending</span>
        <span>👋 Today's Check-outs: <strong className="text-white">{kpis.checkOutsToday}</strong> completed</span>
        <span className="text-emerald-400">🤖 AI Inventory Monitor: Active</span>
      </div>

      {globalBanner && (
        <div className="bg-amber-950 text-amber-100 px-4 py-3 text-sm text-center font-bold shadow-xs border-b border-amber-800 animate-in slide-in-from-top duration-200">
          ✨ {globalBanner}
        </div>
      )}

      <div className="bg-[#fefdfa]/95 border-b border-amber-200/80 sticky top-[73px] z-20 shadow-xs backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex space-x-1 sm:space-x-2 overflow-x-auto py-2.5 no-scrollbar" aria-label="Tabs">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  id={`tab-btn-${tab.id}`}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition cursor-pointer select-none ${
                    isActive
                      ? "bg-amber-950 text-amber-50 shadow-xs ring-1 ring-amber-800/80"
                      : "text-stone-600 hover:text-amber-950 hover:bg-amber-100/60"
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? "text-amber-300" : "text-stone-400"}`} />
                  <span>{tab.label}</span>
                  {tab.badge && (
                    <span
                      className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                        isActive ? "bg-amber-900/90 text-amber-100" : tab.badgeColor
                      }`}
                    >
                      {tab.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>
      </div>

      <QuickActionsSidebar
        kpis={kpis}
        assets={assets}
        staff={staff}
        onCheckInGuest={handleCheckInGuest}
        onOpenWorkOrder={handleQuickWorkOrder}
        onBroadcastStaff={handleBroadcastStaff}
      />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {activeTab === "command" && (
          <div className="flex flex-col gap-6">
            <WeatherTwin onRunSimulation={handleRunWeatherSimulation} />
            <CommandCenterTab
              kpis={kpis}
              alerts={alerts}
              onResolveAlert={handleResolveAlert}
              onNavigateTab={(tab) => setActiveTab(tab)}
              onTriggerAudit={() => setIsAuditModalOpen(true)}
            />
          </div>
        )}
        {activeTab === "operations" && (
          <OperationsTab
            assets={assets}
            inventory={inventory}
            onDispatchWorkOrder={handleDispatchWorkOrder}
            onReorderInventory={handleReorderInventory}
          />
        )}
        {activeTab === "staffing" && (
          <StaffingTab
            staff={staff}
            occupancyRate={kpis.occupancyRate}
            onApplyOptimization={handleApplyStaffOptimization}
          />
        )}
        {activeTab === "concierge" && <GuestConciergeTab guests={guests} />}
        {activeTab === "sentiment" && (
          <SentimentTab
            reviews={reviews}
            onResolveReview={handleResolveReview}
            onAddReview={handleAddReview}
          />
        )}
        {activeTab === "revenue" && (
          <RevenueTab
            pricingOptions={pricingOptions}
            onApplyPricing={handleApplyPricing}
          />
        )}
      </main>

      {activeTab !== "concierge" && (
        <button
          onClick={() => {
            setActiveTab("concierge");
            window.scrollTo({ top: 0, behavior: "smooth" });
          }}
          className="fixed bottom-6 left-6 z-40 flex items-center gap-2.5 px-4 py-3 bg-stone-900 hover:bg-stone-800 text-amber-50 rounded-full shadow-lg hover:shadow-xl transition-all duration-200 cursor-pointer group border border-amber-600/40"
        >
          <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping"></div>
          <MessageSquare className="w-4 h-4 text-amber-300" />
          <span className="text-xs font-bold tracking-tight">Chat: How are things going?</span>
        </button>
      )}
    </div>
  );
}