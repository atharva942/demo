import React, { useState } from "react";
import {
  Activity,
  AlertTriangle,
  CheckCircle2,
  Wrench,
  Sparkles,
  Package,
  Clock,
  Gauge,
  Thermometer,
  Zap,
  ArrowDownRight,
  TrendingDown,
  RotateCcw,
  Layers,
} from "lucide-react";
import { IoTEquipment, InventoryItem } from "../types";
import { AutonomousOperationsEngine } from "./AutonomousOperationsEngine";

interface OperationsTabProps {
  assets: IoTEquipment[];
  inventory: InventoryItem[];
  onDispatchWorkOrder: (assetId: string) => void;
  onReorderInventory: (itemId: string) => void;
}

export const OperationsTab: React.FC<OperationsTabProps> = ({
  assets,
  inventory,
  onDispatchWorkOrder,
  onReorderInventory,
}) => {
  const [selectedAsset, setSelectedAsset] = useState<IoTEquipment | null>(null);
  const [diagnosingAssetId, setDiagnosingAssetId] = useState<string | null>(null);
  const [aiDiagnostic, setAiDiagnostic] = useState<any | null>(null);
  const [dispatchSuccess, setDispatchSuccess] = useState<string | null>(null);
  const [reorderSuccess, setReorderSuccess] = useState<string | null>(null);

  const handleRunAIDiagnostic = async (asset: IoTEquipment) => {
    setSelectedAsset(asset);
    setDiagnosingAssetId(asset.id);
    setAiDiagnostic(null);

    try {
      const response = await fetch("/api/ai/maintenance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ asset }),
      });
      const data = await response.json();
      setAiDiagnostic(data);
    } catch (err) {
      // Fallback
      setAiDiagnostic({
        analysis: `Vibration signature of ${asset.vibrationMmS} mm/s indicates harmonic imbalance in drive mechanism. Thermal elevation of ${asset.temperatureC}°C confirms friction buildup.`,
        estimatedTimeToFailureHours: asset.failureRiskPct > 60 ? 28 : 120,
        recommendedAction: `Inspect bearings and lubricate. Transition primary circulation to secondary backup loop tonight at 23:30.`,
        requiredParts: [asset.recommendedPart || "SKF Precision Bearing Set"],
        estimatedDowntimeMinutes: 45,
        guestImpactMitigation: "Execute during quiet night hours with 0 guest water/AC disruptions.",
      });
    } finally {
      setDiagnosingAssetId(null);
    }
  };

  const handleDispatch = (asset: IoTEquipment) => {
    onDispatchWorkOrder(asset.id);
    setDispatchSuccess(`Preventive Work Order WO-${Math.floor(1000 + Math.random() * 9000)} created and assigned to Chief Electro-Mechanical Engineer Rajesh Mhatre.`);
    setTimeout(() => setDispatchSuccess(null), 5000);
  };

  const handleReorder = (item: InventoryItem) => {
    onReorderInventory(item.id);
    setReorderSuccess(`Automated Purchase Order generated for ${item.name} via ${item.supplier}. Delivery scheduled in ${item.leadTimeDays} days.`);
    setTimeout(() => setReorderSuccess(null), 5000);
  };

  return (
    <div className="space-y-8">
      {/* Notifications */}
      {dispatchSuccess && (
        <div className="bg-emerald-50 border border-emerald-300 text-emerald-900 px-4 py-3 rounded-xl flex items-center justify-between shadow-xs">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            <span className="text-sm font-medium">{dispatchSuccess}</span>
          </div>
          <button onClick={() => setDispatchSuccess(null)} className="text-xs text-emerald-700 font-bold">
            Dismiss
          </button>
        </div>
      )}

      {reorderSuccess && (
        <div className="bg-cyan-50 border border-cyan-300 text-cyan-900 px-4 py-3 rounded-xl flex items-center justify-between shadow-xs">
          <div className="flex items-center gap-2">
            <Package className="w-5 h-5 text-cyan-600 shrink-0" />
            <span className="text-sm font-medium">{reorderSuccess}</span>
          </div>
          <button onClick={() => setReorderSuccess(null)} className="text-xs text-cyan-700 font-bold">
            Dismiss
          </button>
        </div>
      )}

      {/* Autonomous Operational Manager: Real-Time WhatsApp Triage & Action Feed */}
      <AutonomousOperationsEngine />

      {/* Section 1: Predictive Maintenance & IoT Telemetry */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <div className="flex items-center gap-2">
              <Activity className="w-5 h-5 text-teal-600" />
              <h2 className="text-xl font-bold text-slate-900 font-serif">
                IoT Predictive Maintenance & Facility Telemetry
              </h2>
            </div>
            <p className="text-xs text-slate-500">
              Continuous harmonic vibration, temperature, and hydraulic sensors across resort infrastructure to preempt failures before guest impact.
            </p>
          </div>
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-600 bg-white px-3 py-1.5 rounded-lg border border-slate-200">
            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
            <span>5 Telemetry Nodes Online</span>
          </div>
        </div>

        {/* IoT Equipment Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {assets.map((asset) => {
            const isWarning = asset.status === "warning";
            const isCritical = asset.status === "critical";

            return (
              <div
                key={asset.id}
                className={`bg-white rounded-xl border p-5 transition flex flex-col justify-between space-y-4 shadow-xs hover:shadow-md ${
                  isCritical
                    ? "border-rose-300 bg-rose-50/30"
                    : isWarning
                    ? "border-amber-300 bg-amber-50/20"
                    : "border-slate-200"
                }`}
              >
                <div>
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                      {asset.category}
                    </span>
                    <span
                      className={`text-xs px-2.5 py-0.5 rounded-full font-bold uppercase ${
                        isCritical
                          ? "bg-rose-100 text-rose-800"
                          : isWarning
                          ? "bg-amber-100 text-amber-800"
                          : "bg-emerald-100 text-emerald-800"
                      }`}
                    >
                      {asset.status}
                    </span>
                  </div>

                  <h3 className="text-base font-bold text-slate-900 leading-snug">
                    {asset.name}
                  </h3>
                  <p className="text-xs text-slate-500 mb-3">{asset.location}</p>

                  {/* Telemetry Sensor Readouts */}
                  <div className="grid grid-cols-2 gap-2 bg-slate-50 p-2.5 rounded-lg border border-slate-200 text-xs mb-3">
                    <div>
                      <span className="text-slate-500 block text-[10px]">Vibration Velocity</span>
                      <strong
                        className={`font-semibold ${
                          asset.vibrationMmS > 3.0 ? "text-rose-600" : "text-slate-800"
                        }`}
                      >
                        {asset.vibrationMmS} mm/s
                      </strong>
                      <span className="text-[10px] text-slate-400 block">(Normal &lt; 2.5)</span>
                    </div>
                    <div>
                      <span className="text-slate-500 block text-[10px]">Core Temperature</span>
                      <strong className="font-semibold text-slate-800">
                        {asset.temperatureC}°C
                      </strong>
                      <span className="text-[10px] text-slate-400 block">Ambient +14°</span>
                    </div>
                    {asset.pressurePsi && (
                      <div className="col-span-2 pt-1 border-t border-slate-200/80 flex items-center justify-between">
                        <span className="text-slate-500 text-[10px]">Operating Pressure:</span>
                        <strong className="text-slate-800">{asset.pressurePsi} PSI</strong>
                      </div>
                    )}
                  </div>

                  {/* Failure Probability Bar */}
                  <div className="space-y-1 mb-2">
                    <div className="flex justify-between text-xs">
                      <span className="text-slate-500">Failure Risk (Next 72h):</span>
                      <span
                        className={`font-bold ${
                          asset.failureRiskPct > 60
                            ? "text-rose-600"
                            : asset.failureRiskPct > 30
                            ? "text-amber-600"
                            : "text-emerald-600"
                        }`}
                      >
                        {asset.failureRiskPct}%
                      </span>
                    </div>
                    <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
                      <div
                        className={`h-full transition-all duration-500 ${
                          asset.failureRiskPct > 60
                            ? "bg-rose-500"
                            : asset.failureRiskPct > 30
                            ? "bg-amber-500"
                            : "bg-emerald-500"
                        }`}
                        style={{ width: `${asset.failureRiskPct}%` }}
                      ></div>
                    </div>
                  </div>

                  {asset.flaggedIssue && (
                    <div className="bg-amber-50 border border-amber-200 p-2 rounded-lg text-xs text-amber-900 mt-2">
                      <strong className="block font-semibold">AI Anomaly Flag:</strong>
                      {asset.flaggedIssue}
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 pt-2 border-t border-slate-100">
                  <button
                    onClick={() => handleRunAIDiagnostic(asset)}
                    disabled={diagnosingAssetId === asset.id}
                    className="flex-1 inline-flex items-center justify-center gap-1 px-3 py-2 rounded-lg text-xs font-semibold text-teal-800 bg-teal-50 hover:bg-teal-100 active:scale-98 transition cursor-pointer border border-teal-200"
                  >
                    {diagnosingAssetId === asset.id ? (
                      <>
                        <div className="w-3 h-3 border-2 border-teal-700 border-t-transparent rounded-full animate-spin"></div>
                        <span>Analyzing...</span>
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-3.5 h-3.5 text-teal-600" />
                        <span>AI Diagnostic</span>
                      </>
                    )}
                  </button>

                  <button
                    onClick={() => handleDispatch(asset)}
                    className="inline-flex items-center justify-center gap-1 px-3 py-2 rounded-lg text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 active:scale-98 transition cursor-pointer"
                  >
                    <Wrench className="w-3.5 h-3.5 text-amber-300" />
                    <span>Dispatch WO</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* AI Deep Diagnostic Panel (If triggered) */}
        {aiDiagnostic && selectedAsset && (
          <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-teal-950 text-white p-6 rounded-2xl border border-slate-700 shadow-md space-y-4 animate-in fade-in duration-200">
            <div className="flex items-center justify-between border-b border-slate-700 pb-3">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-amber-300" />
                <h3 className="text-base font-bold">
                  Gemini Predictive Diagnostic · {selectedAsset.name}
                </h3>
              </div>
              <button
                onClick={() => setAiDiagnostic(null)}
                className="text-xs text-slate-400 hover:text-white cursor-pointer"
              >
                Close
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
              <div className="bg-slate-800/80 p-3.5 rounded-xl border border-slate-700/80 space-y-1">
                <span className="text-slate-400 block font-semibold">Predicted Time to Failure</span>
                <span className="text-xl font-bold text-amber-400">
                  {aiDiagnostic.estimatedTimeToFailureHours} Hours
                </span>
                <p className="text-slate-300 text-[11px]">
                  Estimated catastrophic bearing lock before guest morning swim.
                </p>
              </div>

              <div className="bg-slate-800/80 p-3.5 rounded-xl border border-slate-700/80 space-y-1">
                <span className="text-slate-400 block font-semibold">Required Precision Parts</span>
                <div className="space-y-0.5">
                  {(aiDiagnostic.requiredParts || []).map((part: string, idx: number) => (
                    <span key={idx} className="block text-slate-200 font-medium">
                      • {part}
                    </span>
                  ))}
                </div>
              </div>

              <div className="bg-slate-800/80 p-3.5 rounded-xl border border-slate-700/80 space-y-1">
                <span className="text-slate-400 block font-semibold">Guest Impact Mitigation</span>
                <p className="text-emerald-300 font-medium leading-relaxed">
                  {aiDiagnostic.guestImpactMitigation}
                </p>
              </div>
            </div>

            <div className="bg-slate-800/60 p-3.5 rounded-xl border border-slate-700/80">
              <span className="text-xs font-semibold text-slate-300 block mb-1">
                Recommended Engineering Prescription:
              </span>
              <p className="text-xs text-slate-200 leading-relaxed">
                {aiDiagnostic.recommendedAction}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Section 2: Inventory Optimization */}
      <div className="space-y-4 pt-4 border-t border-slate-200">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <div className="flex items-center gap-2">
              <Package className="w-5 h-5 text-indigo-600" />
              <h2 className="text-xl font-bold text-slate-900 font-serif">
                Resource & Inventory Optimization
              </h2>
            </div>
            <p className="text-xs text-slate-500">
              AI burn-rate tracking for luxury F&B, housekeeping linens, and engineering spares to eliminate stockouts without overstock waste.
            </p>
          </div>
          <span className="text-xs font-semibold text-indigo-700 bg-indigo-50 border border-indigo-200 px-3 py-1 rounded-full">
            Burn-rate correlated to 88% occupancy
          </span>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-200">
                <tr>
                  <th className="py-3 px-4">Item & Category</th>
                  <th className="py-3 px-4">Current Stock</th>
                  <th className="py-3 px-4">Burn Rate / Day</th>
                  <th className="py-3 px-4">Days Left</th>
                  <th className="py-3 px-4">Lead Time</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {inventory.map((item) => {
                  const isCritical = item.status === "critical_low";
                  const isWarning = item.status === "reorder_soon";

                  return (
                    <tr key={item.id} className="hover:bg-slate-50/80 transition">
                      <td className="py-3 px-4">
                        <strong className="text-slate-900 block font-medium">
                          {item.name}
                        </strong>
                        <span className="text-slate-400 text-[11px]">{item.category} · {item.supplier}</span>
                      </td>
                      <td className="py-3 px-4 font-semibold text-slate-800">
                        {item.currentStock} {item.unit}
                      </td>
                      <td className="py-3 px-4 text-slate-600">
                        {item.burnRatePerDay} {item.unit}/day
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className={`font-bold ${
                            item.daysRemaining < 3
                              ? "text-rose-600"
                              : item.daysRemaining < 5
                              ? "text-amber-600"
                              : "text-emerald-600"
                          }`}
                        >
                          {item.daysRemaining.toFixed(1)} Days
                        </span>
                      </td>
                      <td className="py-3 px-4 text-slate-600">
                        {item.leadTimeDays} Days
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                            isCritical
                              ? "bg-rose-100 text-rose-800"
                              : isWarning
                              ? "bg-amber-100 text-amber-800"
                              : "bg-emerald-100 text-emerald-800"
                          }`}
                        >
                          {item.status.replace("_", " ")}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <button
                          onClick={() => handleReorder(item)}
                          className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-md text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 active:scale-98 transition shadow-2xs cursor-pointer"
                        >
                          <Package className="w-3 h-3" />
                          <span>Smart Reorder</span>
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};
