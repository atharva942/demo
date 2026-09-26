import React, { useState } from "react";
import {
  DollarSign,
  TrendingUp,
  Sparkles,
  ArrowUpRight,
  CheckCircle2,
  Calendar,
  Layers,
  Percent,
  Sliders,
  Sun,
  Flag,
  RotateCcw,
} from "lucide-react";
import { DynamicPricingOption } from "../types";

interface RevenueTabProps {
  pricingOptions: DynamicPricingOption[];
  onApplyPricing: (updated: DynamicPricingOption[]) => void;
}

export const RevenueTab: React.FC<RevenueTabProps> = ({
  pricingOptions,
  onApplyPricing,
}) => {
  const [options, setOptions] = useState<DynamicPricingOption[]>(pricingOptions);
  const [isSimulating, setIsSimulating] = useState(false);
  const [aiPricingResult, setAiPricingResult] = useState<any | null>(null);
  const [successToast, setSuccessToast] = useState<string | null>(null);

  const handleSimulatePricing = async () => {
    setIsSimulating(true);
    setAiPricingResult(null);

    try {
      const response = await fetch("/api/ai/pricing", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          currentRevPAR: 33880,
          occupancy: 88,
          competitorAverage: 36500,
          dates: "Upcoming Weekend Peak",
          localEvents: "Udaipur Royal Polo Cup & Lake Pichola Vintage Boat Regatta",
        }),
      });
      const data = await response.json();
      setAiPricingResult(data);
    } catch (err) {
      setAiPricingResult({
        recommendedRateMultiplier: 1.12,
        suggestedAverageDailyRate: 43500,
        currentAverageDailyRate: 38500,
        estimatedRevenueLift: "+₹24,50,000 over weekend",
        rationale: "Surrounding 5-star Udaipur palace comp-set is 94% committed. High-net-worth polo attendees and wedding party arrivals create inelastic demand for heritage lake suites.",
        segmentActions: [
          { segment: "Direct Website Bookings", recommendation: "Bundle complimentary sunset Shikara cruise & private Sitar recital to preserve direct ADR without discounting." },
          { segment: "OTA Channels", recommendation: "Apply 2-night minimum length of stay (MLOS) restriction on Maharaja Heritage Suites." },
          { segment: "Loyalty Members", recommendation: "Targeted push for royal courtyard upgrades at a 15% preferred member rate." },
        ],
      });
    } finally {
      setIsSimulating(false);
    }
  };

  const handleApplyRates = () => {
    // Apply recommended rates to current rates
    const updated = options.map((opt) => ({
      ...opt,
      currentRate: opt.recommendedRate,
      changePct: 0,
    }));
    setOptions(updated);
    onApplyPricing(updated);
    setSuccessToast("Dynamic rates synced with Opera PMS, Sabre GDS, and direct booking engine in INR (₹).");
    setTimeout(() => setSuccessToast(null), 5000);
  };

  const totalProjectedLift = options.reduce((sum, item) => sum + item.projectedRevDelta, 0);

  return (
    <div className="space-y-6">
      {successToast && (
        <div className="bg-emerald-50 border border-emerald-300 text-emerald-900 px-4 py-3 rounded-xl flex items-center justify-between shadow-xs">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            <span className="text-sm font-medium">{successToast}</span>
          </div>
          <button onClick={() => setSuccessToast(null)} className="text-xs font-bold text-emerald-700">
            Dismiss
          </button>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <DollarSign className="w-5 h-5 text-emerald-600" />
            <h2 className="text-xl font-bold text-slate-900 font-serif">
              Dynamic Revenue Optimization & Demand Intelligence (₹ INR)
            </h2>
          </div>
          <p className="text-xs text-slate-500">
            Real-time algorithmic rate adjustments correlated with Rajasthan palace comp-sets, flight manifest demand, and Royal Polo season.
          </p>
        </div>

        <button
          id="simulate-pricing-btn"
          onClick={handleSimulatePricing}
          disabled={isSimulating}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold text-white bg-emerald-700 hover:bg-emerald-800 active:scale-98 transition shadow-xs cursor-pointer shrink-0"
        >
          {isSimulating ? (
            <>
              <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              <span>Analyzing Market Yield...</span>
            </>
          ) : (
            <>
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              <span>Simulate Dynamic Yield</span>
            </>
          )}
        </button>
      </div>

      {/* Macro Indicators & Market Comp-Set Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
        <div className="bg-white p-4 rounded-xl border border-slate-200">
          <span className="text-slate-500 block text-[11px]">Current RevPAR</span>
          <strong className="text-2xl font-bold text-slate-900">₹33,880</strong>
          <span className="text-emerald-600 font-semibold block text-[10px] mt-1">+14.2% vs. budgeted</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200">
          <span className="text-slate-500 block text-[11px]">Average Daily Rate (ADR)</span>
          <strong className="text-2xl font-bold text-slate-900">₹38,500</strong>
          <span className="text-slate-500 text-[10px] block mt-1">Comp set avg: ₹36,500</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200">
          <span className="text-slate-500 block text-[11px]">Demand Velocity Index</span>
          <strong className="text-2xl font-bold text-indigo-600">148 / 100</strong>
          <span className="text-indigo-600 text-[10px] block mt-1">Surge conditions detected</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200">
          <span className="text-slate-500 block text-[11px]">Projected Weekend Yield Gain</span>
          <strong className="text-2xl font-bold text-emerald-600">
            +₹{totalProjectedLift.toLocaleString("en-IN")}
          </strong>
          <span className="text-emerald-700 text-[10px] block mt-1">Via AI rate adjustment</span>
        </div>
      </div>

      {/* External Driver Indicators */}
      <div className="bg-slate-50 border border-slate-200 p-3.5 rounded-xl flex flex-wrap items-center gap-4 text-xs text-slate-600">
        <span className="font-bold text-slate-800 flex items-center gap-1">
          <Flag className="w-3.5 h-3.5 text-indigo-600" />
          Active External Drivers:
        </span>
        <span className="bg-white px-2.5 py-1 rounded-md border border-slate-200 font-medium">
          🏇 Udaipur Royal Polo Season & Pichola Regatta
        </span>
        <span className="bg-white px-2.5 py-1 rounded-md border border-slate-200 font-medium flex items-center gap-1">
          <Sun className="w-3.5 h-3.5 text-amber-500" />
          28°C Pleasant Autumn Forecast
        </span>
        <span className="bg-white px-2.5 py-1 rounded-md border border-slate-200 font-medium text-emerald-700">
          🏨 Udaipur Luxury Comp Set 94% Booked
        </span>
      </div>

      {/* Dynamic Pricing Rate Recommendation Matrix */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h3 className="text-base font-bold text-slate-900">
              Room Category Dynamic Rate Recommendations
            </h3>
            <p className="text-xs text-slate-500">
              Rates optimized for unconstrained luxury demand without triggering guest resistance.
            </p>
          </div>

          <button
            id="apply-dynamic-rates-btn"
            onClick={handleApplyRates}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 active:scale-98 transition shadow-xs cursor-pointer"
          >
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
            <span>Apply Dynamic Rates to PMS</span>
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {options.map((opt, idx) => (
            <div
              key={idx}
              className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-white hover:border-emerald-300 hover:shadow-xs transition space-y-3"
            >
              <div className="flex items-start justify-between">
                <div>
                  <h4 className="text-sm font-bold text-slate-900">
                    {opt.roomType}
                  </h4>
                  <span className="text-[11px] text-slate-500">
                    Occupancy Forecast: <strong>{opt.occupancyForecast}%</strong> · Comp Rate: ₹{opt.competitorCompRate.toLocaleString("en-IN")}
                  </span>
                </div>

                {opt.changePct > 0 ? (
                  <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800">
                    +{opt.changePct}% Recommended
                  </span>
                ) : (
                  <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-600">
                    Rate Maintained
                  </span>
                )}
              </div>

              {/* Price Comparison */}
              <div className="flex items-baseline gap-3">
                <div>
                  <span className="text-[10px] text-slate-400 block uppercase font-medium">Current</span>
                  <span className="text-lg font-semibold text-slate-500 line-through">
                    ₹{opt.currentRate.toLocaleString("en-IN")}
                  </span>
                </div>
                <span className="text-slate-300 text-lg">→</span>
                <div>
                  <span className="text-[10px] text-emerald-700 block uppercase font-bold">Dynamic Rate</span>
                  <span className="text-2xl font-black text-slate-900">
                    ₹{opt.recommendedRate.toLocaleString("en-IN")}
                    <span className="text-xs font-normal text-slate-400">/night</span>
                  </span>
                </div>

                <div className="ml-auto text-right">
                  <span className="text-[10px] text-slate-400 block uppercase">Projected Lift</span>
                  <strong className="text-sm font-bold text-emerald-600">
                    +₹{opt.projectedRevDelta.toLocaleString("en-IN")}
                  </strong>
                </div>
              </div>

              <p className="text-xs text-slate-600 italic bg-white p-2 rounded-lg border border-slate-200/80">
                "{opt.rationale}"
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Guest Segmentation & Targeted Packages */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-4">
        <div>
          <h3 className="text-base font-bold text-slate-900">
            Targeted Guest Segmentation & Value-Add Packages
          </h3>
          <p className="text-xs text-slate-500">
            Deploy personalized package bundles tailored to each demographic to maximize non-room revenue (Royal Khansama dining, Spa, Heritage Excursions).
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
          <div className="p-4 rounded-xl border border-slate-200 space-y-2 bg-gradient-to-b from-amber-50/50 to-white">
            <div className="flex items-center justify-between">
              <span className="font-bold text-slate-900">Ultra-Luxury Couples & Anniversaries (46%)</span>
              <span className="px-2 py-0.5 bg-amber-100 text-amber-900 rounded-full font-semibold text-[10px]">
                High Margin
              </span>
            </div>
            <p className="text-slate-600">
              Prefers secluded romance, Lake Pichola private Shikara charters, Mewari Khansama multi-course thali.
            </p>
            <div className="pt-2 border-t border-slate-100">
              <strong className="text-slate-800 block text-[11px]">Recommended Offer:</strong>
              <span className="text-amber-900 font-medium">
                "Starlight Lake Terrace Dining & Royal Sitar Evening" at ₹38,000/couple
              </span>
            </div>
          </div>

          <div className="p-4 rounded-xl border border-slate-200 space-y-2 bg-gradient-to-b from-teal-50/50 to-white">
            <div className="flex items-center justify-between">
              <span className="font-bold text-slate-900">Ayurveda & Wellness Seekers (24%)</span>
              <span className="px-2 py-0.5 bg-teal-100 text-teal-900 rounded-full font-semibold text-[10px]">
                High Retention
              </span>
            </div>
            <p className="text-slate-600">
              Prioritizes daily sunrise Yoga, Ayurvedic pulse diagnosis, Shirodhara therapy, and organic sattvic cuisine.
            </p>
            <div className="pt-2 border-t border-slate-100">
              <strong className="text-slate-800 block text-[11px]">Recommended Offer:</strong>
              <span className="text-teal-900 font-medium">
                "Ayurvedic Rejuvenation: 3-Day Panchakarma & Shirodhara" at ₹32,000/guest
              </span>
            </div>
          </div>

          <div className="p-4 rounded-xl border border-slate-200 space-y-2 bg-gradient-to-b from-indigo-50/50 to-white">
            <div className="flex items-center justify-between">
              <span className="font-bold text-slate-900">Heritage Families & Weddings (20%)</span>
              <span className="px-2 py-0.5 bg-indigo-100 text-indigo-900 rounded-full font-semibold text-[10px]">
                High Volume
              </span>
            </div>
            <p className="text-slate-600">
              Values royal puppet theater, palace architecture walks, interconnected haveli suites, and family celebrations.
            </p>
            <div className="pt-2 border-t border-slate-100">
              <strong className="text-slate-800 block text-[11px]">Recommended Offer:</strong>
              <span className="text-indigo-900 font-medium">
                "Royal Rajasthani Heritage Craft, Falconry & Puppet Evening" at ₹18,500/family
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
