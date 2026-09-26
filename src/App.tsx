import React, { useState } from "react";
import {
  LayoutDashboard,
  Activity,
  Users,
  HeartHandshake,
  MessageSquare,
  DollarSign,
  Layers,
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

export default function App() {
  const [activeTab, setActiveTab] = useState<string>("command");
  const [kpis, setKpis] = useState<ResortKPIs>(initialKPIs);
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

  // 1. Resolve alert workflow
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

  // 2. Dispatch work order for an IoT asset
  const handleDispatchWorkOrder = (assetId: string) => {
    setAssets((prev) =>
      prev.map((a) =>
        a.id === assetId
          ? {
              ...a,
              status: "optimal",
              healthScore: 94,
              failureRiskPct: 12,
              vibrationMmS: 2.0,
              flaggedIssue: undefined,
            }
          : a
      )
    );
    setAlerts((prev) =>
      prev.map((a) =>
        a.title.toLowerCase().includes("pool pump")
          ? { ...a, resolved: true }
          : a
      )
    );
    setKpis((prev) => ({
      ...prev,
      equipmentHealthScore: 97.4,
    }));
  };

  // 3. Reorder inventory item
  const handleReorderInventory = (itemId: string) => {
    setInventory((prev) =>
      prev.map((item) =>
        item.id === itemId
          ? {
              ...item,
              currentStock: item.currentStock + 35,
              status: "adequate",
              daysRemaining: 12,
            }
          : item
      )
    );
  };

  // 4. Apply staff schedule rebalance
  const handleApplyStaffOptimization = (updatedStaff: StaffShift[]) => {
    setStaff(updatedStaff);
    setAlerts((prev) =>
      prev.map((a) =>
        a.department === "Staffing" ? { ...a, resolved: true } : a
      )
    );
    setKpis((prev) => ({
      ...prev,
      staffCoverageRatio: 98,
    }));
  };

  // 5. Apply dynamic rates
  const handleApplyPricing = (updatedPricing: DynamicPricingOption[]) => {
    setPricingOptions(updatedPricing);
    setAlerts((prev) =>
      prev.map((a) =>
        a.department === "Revenue" ? { ...a, resolved: true } : a
      )
    );
    setKpis((prev) => ({
      ...prev,
      averageDailyRate: 462,
      revPAR: 418,
    }));
  };

  // 6. Review sentiment triage resolve
  const handleResolveReview = (reviewId: string, responseText: string) => {
    setReviews((prev) =>
      prev.map((r) =>
        r.id === reviewId
          ? { ...r, triageStatus: "resolved", aiSuggestedResponse: responseText }
          : r
      )
    );
    setKpis((prev) => ({
      ...prev,
      guestSatisfactionScore: 4.88,
    }));
  };

  const handleAddReview = (newReview: GuestReview) => {
    setReviews((prev) => [newReview, ...prev]);
  };

  // 7. Global Execute All Mitigations (from Audit Modal)
  const handleExecuteAllMitigations = () => {
    setAlerts((prev) => prev.map((a) => ({ ...a, resolved: true })));
    setAssets((prev) =>
      prev.map((a) => ({
        ...a,
        status: "optimal",
        healthScore: 98,
        failureRiskPct: 8,
        vibrationMmS: 1.6,
      }))
    );
    setStaff((prev) =>
      prev.map((s) => ({
        ...s,
        workloadIndex: Math.min(s.workloadIndex, 85),
      }))
    );
    setKpis((prev) => ({
      ...prev,
      equipmentHealthScore: 98.6,
      staffCoverageRatio: 97,
      activeAlertsCount: 0,
      revPAR: 422,
    }));
    setGlobalBanner("360 Cross-Department AI Mitigations successfully deployed across all resort systems.");
    setTimeout(() => setGlobalBanner(null), 6000);
  };

  // 8. Simulate Weekend Surge
  const handleSimulatePeakRush = () => {
    setIsSimulating(true);
    setGlobalBanner("Simulating Weekend Surge: Occupancy jumped to 94%, F&B guest velocity accelerated.");

    setTimeout(() => {
      setKpis((prev) => ({
        ...prev,
        occupancyRate: 94,
        revPAR: 412,
      }));
      setInventory((prev) =>
        prev.map((item) =>
          item.id === "inv-fb-wagyu"
            ? { ...item, currentStock: 8, daysRemaining: 0.9, status: "critical_low" }
            : item
        )
      );
      setIsSimulating(false);
      setTimeout(() => setGlobalBanner(null), 5000);
    }, 1200);
  };

  // 9. Quick Actions: Check-in Guest
  const handleCheckInGuest = (newGuest: GuestProfile) => {
    setGuests((prev) => [newGuest, ...prev]);
    setKpis((prev) => ({
      ...prev,
      occupancyRate: Math.min(100, prev.occupancyRate + 1),
    }));
    setGlobalBanner(`Royal Welcome: ${newGuest.name} checked into ${newGuest.room}. Butler dispatched!`);
    setTimeout(() => setGlobalBanner(null), 6000);
  };

  // 10. Quick Actions: Open Work Order
  const handleQuickWorkOrder = (wo: {
    assetName: string;
    issue: string;
    priority: "urgent" | "high" | "routine";
    assignee: string;
    maintenanceWindow: string;
    estimatedCostINR: number;
  }) => {
    const targetAsset = assets.find(
      (a) => a.name.toLowerCase().includes("pump") || wo.assetName.includes(a.name)
    );
    if (targetAsset) {
      handleDispatchWorkOrder(targetAsset.id);
    }
    const newAlert: OperationalAlert = {
      id: `alert-${Date.now()}`,
      department: "Maintenance",
      title: `${wo.assetName} - Work Order Dispatched`,
      severity: wo.priority === "urgent" ? "high" : "medium",
      description: `${wo.issue} Assigned to ${wo.assignee}. Maintenance window: ${wo.maintenanceWindow}.`,
      timestamp: "Just now",
      actionTitle: `Review WO for ${wo.assetName}`,
      automatedWorkflowAvailable: true,
      resolved: false,
    };
    setAlerts((prev) => [newAlert, ...prev]);
    setGlobalBanner(`Work Order Dispatched: ${wo.assetName} assigned to ${wo.assignee} (${wo.maintenanceWindow}).`);
    setTimeout(() => setGlobalBanner(null), 6000);
  };

  // 11. Quick Actions: Broadcast Staff
  const handleBroadcastStaff = (message: string) => {
    setGlobalBanner(`Palace Staff Broadcast: "${message}" sent to all on-duty radios.`);
    setTimeout(() => setGlobalBanner(null), 6000);
  };

  const activeAlertCount = alerts.filter((a) => !a.resolved).length;
  const warningAssetCount = assets.filter((a) => a.status !== "optimal").length;

  const tabs = [
    {
      id: "command",
      label: "Overview & Status",
      icon: LayoutDashboard,
      badge: activeAlertCount > 0 ? `${activeAlertCount} alert` : undefined,
      badgeColor: "bg-amber-600 text-white",
    },
    {
      id: "concierge",
      label: "AI Assistant & Chat",
      icon: MessageSquare,
      badge: "Explainer",
      badgeColor: "bg-emerald-700 text-white",
    },
    {
      id: "operations",
      label: "Equipment & Ops",
      icon: Activity,
      badge: warningAssetCount > 0 ? `${warningAssetCount} warning` : undefined,
      badgeColor: "bg-orange-600 text-white",
    },
    {
      id: "staffing",
      label: "Staff & Shifts",
      icon: Users,
    },
    {
      id: "sentiment",
      label: "Guest Reviews",
      icon: HeartHandshake,
      badge: `${reviews.length}`,
      badgeColor: "bg-stone-200 text-stone-700",
    },
    {
      id: "revenue",
      label: "Dynamic Pricing",
      icon: DollarSign,
      badge: "+10.6%",
      badgeColor: "bg-amber-100 text-amber-900 border border-amber-300",
    },
  ];

  return (
    <div className="min-h-screen bg-[#f7f3eb]/95 text-stone-900 flex flex-col font-sans palace-motif-pattern">
      {/* Header with quick metrics and actions */}
      <Header
        kpis={kpis}
        onOpenAudit={() => setIsAuditModalOpen(true)}
        onSimulateEvent={handleSimulatePeakRush}
        isSimulating={isSimulating}
      />

      {/* Global Notification Banner */}
      {globalBanner && (
        <div className="bg-amber-950 text-amber-100 px-4 py-2.5 text-xs text-center font-medium shadow-xs border-b border-amber-800 animate-in slide-in-from-top duration-200">
          ✨ {globalBanner}
        </div>
      )}

      {/* Simple, intuitive primary navigation with Rajasthan warm aesthetic */}
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

      {/* Persistent Quick Actions Sidebar (Visible across all tabs) */}
      <QuickActionsSidebar
        kpis={kpis}
        assets={assets}
        staff={staff}
        onCheckInGuest={handleCheckInGuest}
        onOpenWorkOrder={handleQuickWorkOrder}
        onBroadcastStaff={handleBroadcastStaff}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {activeTab === "command" && (
          <CommandCenterTab
            kpis={kpis}
            alerts={alerts}
            onResolveAlert={handleResolveAlert}
            onNavigateTab={(tab) => setActiveTab(tab)}
            onTriggerAudit={() => setIsAuditModalOpen(true)}
          />
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

        {activeTab === "concierge" && (
          <GuestConciergeTab guests={guests} />
        )}

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

      {/* Floating AI Status & Chat Launcher */}
      {activeTab !== "concierge" && (
        <button
          onClick={() => {
            setActiveTab("concierge");
            window.scrollTo({ top: 0, behavior: "smooth" });
          }}
          className="fixed bottom-6 left-6 z-40 flex items-center gap-2.5 px-4 py-3 bg-stone-900 hover:bg-stone-800 text-amber-50 rounded-full shadow-lg hover:shadow-xl transition-all duration-200 cursor-pointer group border border-amber-600/40"
          title="Open AI Chat to see how things are going & working"
        >
          <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping"></div>
          <MessageSquare className="w-4 h-4 text-amber-300" />
          <span className="text-xs font-bold tracking-tight">
            Chat: How are things going?
          </span>
        </button>
      )}

      {/* Footer */}
      <footer className="border-t border-amber-200/80 bg-[#fefdfa] py-4 text-xs text-stone-500 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="font-serif font-bold text-amber-950">Rosalind</span>
            <span className="text-stone-400">·</span>
            <span className="text-stone-600">Veda Vilas Palace & Ayurvedic Sanctuary, Udaipur</span>
          </div>
          <div className="flex items-center gap-3 text-stone-400">
            <span>Sub-second Operations Decision Engine</span>
            <span>·</span>
            <span>Rajasthan Heritage Edition</span>
          </div>
        </div>
      </footer>

      {/* 360 AI Deep Audit Modal */}
      <AuditModal
        isOpen={isAuditModalOpen}
        onClose={() => setIsAuditModalOpen(false)}
        kpis={kpis}
        assets={assets}
        staff={staff}
        alerts={alerts}
        onExecuteAllMitigations={handleExecuteAllMitigations}
      />
    </div>
  );
}
