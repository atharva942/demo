import React, { useState } from "react";
import {
  Sparkles,
  Send,
  CheckCircle2,
  Crown,
  Bot,
  MessageSquare,
  HelpCircle,
  Activity,
  Users,
  DollarSign,
  Layers,
  Wrench,
  ThumbsUp,
  ArrowRight,
  ShieldCheck,
  Zap,
} from "lucide-react";
import { GuestProfile } from "../types";

interface GuestConciergeTabProps {
  guests: GuestProfile[];
  initialMode?: "copilot" | "guest";
}

export const GuestConciergeTab: React.FC<GuestConciergeTabProps> = ({
  guests,
  initialMode = "copilot",
}) => {
  const [chatMode, setChatMode] = useState<"copilot" | "guest">(initialMode);
  const [selectedGuest, setSelectedGuest] = useState<GuestProfile>(guests[0]);
  const [userPrompt, setUserPrompt] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [dispatchedToast, setDispatchedToast] = useState<string | null>(null);

  // Copilot conversation state (explaining how things are going and working)
  const [copilotMessages, setCopilotMessages] = useState<
    Array<{
      sender: "ai" | "user";
      text: string;
      quickActions?: string[];
      highlightBadge?: string;
    }>
  >([
    {
      sender: "ai",
      highlightBadge: "Live Resort Intelligence",
      text: `Khamaghani and Namaste! Here is a simple, clear explanation of **how things are going right now** at Veda Vilas Palace & Ayurvedic Sanctuary and **how the system works**:

---

### 1. 🌟 How Things Are Going Right Now
* **Palace Occupancy is High & Healthy (88%)**: 124 of our 140 luxury suites & havelis are occupied today, generating an impressive **₹33,880 RevPAR** with high guest satisfaction (**4.82 / 5.0**).
* **Equipment Watch (Kund Stepwell Pool Pump #2)**: Smart vibration sensors caught an early bearing vibration anomaly (4.8 mm/s due to monsoon silt & cavitation). The Kund pool is running normally, but the pump would fail in ~28 hours if ignored. We have automatically scheduled silent preventive maintenance tonight at 23:00 so guests won't experience any pool downtime.
* **Staffing & Shifts**: Tomorrow has a high-volume wedding turnover window between 11:30 and 14:00 (Singhania wedding VIP arrivals). The system has automatically shifted 3 staff hours forward so front desk, royal butlers, and housekeeping won't experience delays.
* **Revenue Upside**: Thanks to the Udaipur Royal Polo Cup and clear skies, surrounding luxury palace comp-sets are 94% booked. We can safely increase weekend rates by 12% to capture **+₹24,50,000** in extra revenue.

---

### 2. ⚙️ How This Entire System Works
1. **IoT Sensors Catch Problems Early**: Continuous micro-sensors listen to vibrations, temperatures, and water pressure on pumps, chillers, and DG generators. When something starts wearing down, you get alerted days in advance rather than dealing with an emergency breakdown.
2. **Predictive Staff Scheduling**: Instead of guessing how many cleaners or servers you need, the AI looks at check-in times and dining bookings to dynamically rebalance shifts and prevent burnout.
3. **Automated Guest Concierge**: Guests can text or speak with the AI Concierge for recommendations, private dining, or dietary needs (such as strict Satvik Jain or Ayurvedic diet plans). The system turns their desires into instant task tickets for butlers and chefs.
4. **Dynamic Revenue Optimization**: The pricing engine monitors local events (like the Polo season and Pichola regatta), competitor rates, and weather forecasts to recommend the most profitable room rates in real time.
5. **1-Click Approvals**: When a problem is detected, the system gives you a single button to dispatch the fix, rebalance the roster, or update prices instantly.`,
      quickActions: [
        "Review & dispatch Kund Pool Pump #2 maintenance",
        "Confirm Housekeeping shift rebalancing",
        "Apply dynamic weekend palace pricing (+12%)",
      ],
    },
  ]);

  // Guest simulator conversation state
  const [guestMessages, setGuestMessages] = useState<
    Array<{ sender: "guest" | "aura"; text: string; actions?: string[]; upsell?: any }>
  >([
    {
      sender: "aura",
      text: `Khamaghani and warm welcome, Shri Raghav & Smt. Sunita Singhania. It is an honor to host your 25th Silver Jubilee anniversary at Veda Vilas Palace. Your Maharaja Heritage Lake Suite 302 is prepared with fresh Mewar rose petals and pure brass water urns. Head Butler Vikramaditya Rathore and Chef Sanjeev Sen have confirmed your strict Satvik Jain dietary preferences. How may I orchestrate your royal experience today?`,
      actions: ["In-suite Silver Jubilee saffron milk & flower welcome arranged for 18:00"],
      upsell: {
        title: "Private Sunset Shikara Lake Cruise with Classical Sitar & Khansama Feast",
        price: "₹38,000",
        relevance: "Matches your preference for secluded anniversary heritage dining",
      },
    },
  ]);

  // Send message
  const handleSendMessage = async (customText?: string) => {
    const textToSend = customText || userPrompt;
    if (!textToSend.trim() || isSending) return;

    if (chatMode === "copilot") {
      setCopilotMessages((prev) => [...prev, { sender: "user", text: textToSend }]);
      setUserPrompt("");
      setIsSending(true);

      try {
        const response = await fetch("/api/ai/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            mode: "manager",
            userMessage: textToSend,
            resortState: { occupancy: 88, health: 92 },
          }),
        });
        const data = await response.json();
        setCopilotMessages((prev) => [
          ...prev,
          {
            sender: "ai",
            text: data.reply,
            quickActions: data.suggestedActions,
          },
        ]);
      } catch (err) {
        setCopilotMessages((prev) => [
          ...prev,
          {
            sender: "ai",
            text: `Here is a summary: Operations are at 88% occupancy and 92/100 health index. The only immediate attention item is Pool Pump #2 (preventive repair scheduled tonight at 23:00), and housekeeping shift rebalancing is in place for tomorrow's 11:30 check-out window.`,
            quickActions: ["Auto-authorize Pool Pump #2 maintenance"],
          },
        ]);
      } finally {
        setIsSending(false);
      }
    } else {
      // Guest mode
      setGuestMessages((prev) => [...prev, { sender: "guest", text: textToSend }]);
      setUserPrompt("");
      setIsSending(true);

      try {
        const response = await fetch("/api/ai/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            mode: "guest",
            guest: selectedGuest,
            userMessage: textToSend,
          }),
        });
        const data = await response.json();
        setGuestMessages((prev) => [
          ...prev,
          {
            sender: "aura",
            text: data.reply,
            actions: data.suggestedActions,
            upsell: data.upsellOffer,
          },
        ]);
      } catch (err) {
        setGuestMessages((prev) => [
          ...prev,
          {
            sender: "aura",
            text: `Certainly, ${selectedGuest.name}. I have logged your request with our guest relations team and Butler Elena Rostova. Your comfort is fully assured.`,
          },
        ]);
      } finally {
        setIsSending(false);
      }
    }
  };

  const handleDispatchAction = (actionText: string) => {
    setDispatchedToast(`Dispatched to staff: "${actionText}"`);
    setTimeout(() => setDispatchedToast(null), 4000);
  };

  return (
    <div className="space-y-6">
      {/* Toast */}
      {dispatchedToast && (
        <div className="bg-emerald-50 border border-emerald-300 text-emerald-900 px-4 py-3 rounded-xl flex items-center justify-between shadow-xs animate-in fade-in duration-200">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            <span className="text-sm font-medium">{dispatchedToast}</span>
          </div>
          <button
            onClick={() => setDispatchedToast(null)}
            className="text-xs font-bold text-emerald-700 hover:text-emerald-900 cursor-pointer"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Header & Mode Switcher */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Bot className="w-6 h-6 text-teal-600" />
            <h2 className="text-lg sm:text-xl font-bold text-slate-900 font-serif">
              AI Resort Assistant & Concierge Chat
            </h2>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Ask anything about how the resort is running, or switch to test the guest concierge experience.
          </p>
        </div>

        {/* Mode Selector Toggle */}
        <div className="bg-slate-100 p-1 rounded-xl flex items-center gap-1 self-start sm:self-center border border-slate-200">
          <button
            onClick={() => setChatMode("copilot")}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
              chatMode === "copilot"
                ? "bg-white text-slate-900 shadow-xs"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-teal-600" />
            <span>How Things Are Going & Working</span>
          </button>

          <button
            onClick={() => setChatMode("guest")}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
              chatMode === "guest"
                ? "bg-white text-slate-900 shadow-xs"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <Crown className="w-3.5 h-3.5 text-amber-500" />
            <span>VIP Guest Concierge Simulator</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Context Card or Guest Selector */}
        <div className="lg:col-span-4 space-y-4">
          {chatMode === "copilot" ? (
            <div className="space-y-4">
              {/* Simplified At-A-Glance Status */}
              <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-4">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block">
                  Resort Snapshot Today
                </span>

                <div className="space-y-3">
                  <div className="flex items-center justify-between pb-2.5 border-b border-slate-100">
                    <div className="flex items-center gap-2">
                      <div className="w-2.5 h-2.5 rounded-full bg-emerald-500"></div>
                      <span className="text-xs font-medium text-slate-700">Occupancy</span>
                    </div>
                    <strong className="text-xs font-bold text-slate-900">88% (124 / 140)</strong>
                  </div>

                  <div className="flex items-center justify-between pb-2.5 border-b border-slate-100">
                    <div className="flex items-center gap-2">
                      <div className="w-2.5 h-2.5 rounded-full bg-emerald-500"></div>
                      <span className="text-xs font-medium text-slate-700">Guest Rating</span>
                    </div>
                    <strong className="text-xs font-bold text-slate-900">4.82 / 5.0</strong>
                  </div>

                  <div className="flex items-center justify-between pb-2.5 border-b border-slate-100">
                    <div className="flex items-center gap-2">
                      <div className="w-2.5 h-2.5 rounded-full bg-amber-500"></div>
                      <span className="text-xs font-medium text-slate-700">Equipment Flag</span>
                    </div>
                    <strong className="text-xs font-bold text-amber-700">Kund Pool Pump #2</strong>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-2.5 h-2.5 rounded-full bg-teal-500"></div>
                      <span className="text-xs font-medium text-slate-700">Weekend Uplift</span>
                    </div>
                    <strong className="text-xs font-bold text-teal-700">+₹24,50,000 potential</strong>
                  </div>
                </div>

                <div className="pt-2">
                  <div className="bg-teal-50 border border-teal-200 rounded-xl p-3 text-xs text-teal-950 space-y-1">
                    <span className="font-bold flex items-center gap-1.5 text-teal-800">
                      <Zap className="w-3.5 h-3.5" />
                      Automatic Protection
                    </span>
                    <p className="text-[11px] text-teal-800/90 leading-relaxed">
                      All systems are actively linked. When equipment or staff need adjustments, the AI prepares the fix for 1-click approval.
                    </p>
                  </div>
                </div>
              </div>

              {/* Quick Explanatory Prompts */}
              <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-3">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block">
                  Quick Questions to Ask
                </span>

                <div className="space-y-2">
                  {[
                    "How are things going right now at Veda Vilas Palace?",
                    "Explain how this resort AI system works in simple terms",
                    "What is happening with the Kund stepwell pool pump?",
                    "How does intelligent shift scheduling help our staff?",
                    "How can we maximize revenue for the Udaipur Polo weekend?",
                  ].map((prompt, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleSendMessage(prompt)}
                      disabled={isSending}
                      className="w-full text-left p-2.5 rounded-xl border border-slate-200 bg-slate-50/70 hover:bg-teal-50 hover:border-teal-300 hover:text-teal-900 transition text-xs font-medium text-slate-700 flex items-center justify-between cursor-pointer"
                    >
                      <span>💬 {prompt}</span>
                      <ArrowRight className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    </button>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            /* Guest Mode: Guest Selector */
            <div className="space-y-4">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500 block">
                Select Luxury Guest to Simulate
              </span>

              <div className="space-y-2.5">
                {guests.map((g) => {
                  const isSelected = selectedGuest.id === g.id;

                  return (
                    <div
                      key={g.id}
                      onClick={() => {
                        setSelectedGuest(g);
                        setGuestMessages([
                          {
                            sender: "aura",
                            text: `Hello ${g.name}. How may I assist you with your stay in ${g.room}? I have all your preferences prepared.`,
                          },
                        ]);
                      }}
                      className={`p-3.5 rounded-xl border transition cursor-pointer text-xs space-y-1.5 ${
                        isSelected
                          ? "border-amber-400 bg-amber-50/40 shadow-xs ring-1 ring-amber-300"
                          : "border-slate-200 bg-white hover:border-slate-300"
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div>
                          <div className="flex items-center gap-1.5">
                            <Crown className="w-3.5 h-3.5 text-amber-500 fill-amber-400" />
                            <strong className="text-sm font-bold text-slate-900">
                              {g.name}
                            </strong>
                          </div>
                          <span className="text-slate-500 text-[11px]">
                            {g.room} · {g.segment}
                          </span>
                        </div>
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-700">
                          {g.vipTier}
                        </span>
                      </div>

                      <p className="text-[11px] text-slate-600 italic truncate">
                        "{g.notes}"
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Right Column: The Chat Box (8 cols) */}
        <div className="lg:col-span-8 bg-white rounded-2xl border border-slate-200 shadow-xs flex flex-col h-[640px] overflow-hidden">
          {/* Chat Top Banner */}
          <div className="p-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div
                className={`w-9 h-9 rounded-xl flex items-center justify-center text-white shadow-2xs ${
                  chatMode === "copilot"
                    ? "bg-teal-600"
                    : "bg-gradient-to-tr from-amber-500 to-orange-500"
                }`}
              >
                {chatMode === "copilot" ? (
                  <Sparkles className="w-5 h-5" />
                ) : (
                  <Bot className="w-5 h-5" />
                )}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-bold text-slate-900">
                    {chatMode === "copilot"
                      ? "Resort AI Operations Co-Pilot"
                      : "Aura — VIP Guest Concierge"}
                  </h3>
                  <span className="inline-flex items-center gap-1 px-2 py-0.2 rounded-full text-[10px] font-semibold bg-emerald-100 text-emerald-800">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse"></span>
                    Online
                  </span>
                </div>
                <p className="text-[11px] text-slate-500">
                  {chatMode === "copilot"
                    ? "Explaining real-time resort status, IoT equipment health, staffing, and system logic"
                    : `Simulating interaction for ${selectedGuest.name} (${selectedGuest.room})`}
                </p>
              </div>
            </div>

            {chatMode === "copilot" && (
              <span className="hidden sm:inline-block text-[11px] font-bold text-teal-800 bg-teal-50 px-2.5 py-1 rounded-lg border border-teal-200">
                Resort Health 92/100
              </span>
            )}
          </div>

          {/* Quick Prompts Bar */}
          <div className="px-4 py-2.5 bg-slate-100/70 border-b border-slate-200 flex items-center gap-1.5 overflow-x-auto text-xs no-scrollbar">
            <span className="text-[11px] font-semibold text-slate-500 shrink-0 mr-1">
              Suggestions:
            </span>
            {chatMode === "copilot" ? (
              <>
                <button
                  onClick={() =>
                    handleSendMessage("Explain to me how things are going and working")
                  }
                  className="bg-white hover:bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-1 text-[11px] text-slate-700 font-medium shrink-0 cursor-pointer shadow-2xs"
                >
                  ✨ Explain how things are going & working
                </button>
                <button
                  onClick={() =>
                    handleSendMessage("What is the situation with the pool pump?")
                  }
                  className="bg-white hover:bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-1 text-[11px] text-slate-700 font-medium shrink-0 cursor-pointer shadow-2xs"
                >
                  🔧 Pool Pump #2 Details
                </button>
                <button
                  onClick={() =>
                    handleSendMessage("How is our staff workload today?")
                  }
                  className="bg-white hover:bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-1 text-[11px] text-slate-700 font-medium shrink-0 cursor-pointer shadow-2xs"
                >
                  👥 Staffing Status
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={() =>
                    handleSendMessage("Can we book a private sunset catamaran for tomorrow?")
                  }
                  className="bg-white hover:bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-1 text-[11px] text-slate-700 font-medium shrink-0 cursor-pointer shadow-2xs"
                >
                  ⛵ Sunset Catamaran Booking
                </button>
                <button
                  onClick={() =>
                    handleSendMessage("Please make sure all dinner dishes tonight are strictly gluten-free.")
                  }
                  className="bg-white hover:bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-1 text-[11px] text-slate-700 font-medium shrink-0 cursor-pointer shadow-2xs"
                >
                  🥗 Dietary Request
                </button>
              </>
            )}
          </div>

          {/* Messages Scroll Area */}
          <div className="flex-1 p-4 sm:p-5 overflow-y-auto space-y-4 text-xs">
            {chatMode === "copilot"
              ? copilotMessages.map((msg, idx) => {
                  const isAi = msg.sender === "ai";
                  return (
                    <div
                      key={idx}
                      className={`flex flex-col ${isAi ? "items-start" : "items-end"}`}
                    >
                      <div
                        className={`max-w-[92%] sm:max-w-[85%] rounded-2xl p-4 space-y-3 shadow-2xs ${
                          isAi
                            ? "bg-slate-50 border border-slate-200 text-slate-900"
                            : "bg-slate-900 text-white"
                        }`}
                      >
                        {isAi && msg.highlightBadge && (
                          <span className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-teal-100 text-teal-800 uppercase tracking-wider">
                            {msg.highlightBadge}
                          </span>
                        )}

                        <div className="prose-xs space-y-2 leading-relaxed text-[13px] whitespace-pre-line text-slate-800">
                          {msg.text}
                        </div>

                        {/* Quick Dispatched Actions */}
                        {isAi && msg.quickActions && msg.quickActions.length > 0 && (
                          <div className="pt-3 border-t border-slate-200 space-y-2">
                            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block">
                              Suggested 1-Click Operational Dispatches:
                            </span>
                            <div className="space-y-1.5">
                              {msg.quickActions.map((action, i) => (
                                <div
                                  key={i}
                                  className="bg-white border border-teal-200 rounded-xl p-2.5 flex items-center justify-between gap-3 text-slate-800"
                                >
                                  <span className="text-[11px] font-medium flex items-center gap-1.5">
                                    <Zap className="w-3.5 h-3.5 text-teal-600 shrink-0" />
                                    {action}
                                  </span>
                                  <button
                                    onClick={() => handleDispatchAction(action)}
                                    className="px-3 py-1 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-[10px] font-bold cursor-pointer transition shrink-0"
                                  >
                                    Dispatch
                                  </button>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                      <span className="text-[10px] text-slate-400 mt-1 px-1">
                        {isAi ? "Resort Operations AI" : "You (Resort Director)"}
                      </span>
                    </div>
                  );
                })
              : guestMessages.map((msg, idx) => {
                  const isAura = msg.sender === "aura";
                  return (
                    <div
                      key={idx}
                      className={`flex flex-col ${isAura ? "items-start" : "items-end"}`}
                    >
                      <div
                        className={`max-w-[85%] rounded-2xl p-4 space-y-3 shadow-2xs ${
                          isAura
                            ? "bg-slate-50 border border-slate-200 text-slate-900"
                            : "bg-slate-900 text-white"
                        }`}
                      >
                        <p className="leading-relaxed whitespace-pre-line text-[13px]">
                          {msg.text}
                        </p>

                        {isAura && msg.actions && msg.actions.length > 0 && (
                          <div className="pt-2 border-t border-slate-200 space-y-1.5">
                            <span className="text-[10px] font-bold uppercase tracking-wider text-teal-800 block">
                              Automated Staff Dispatches:
                            </span>
                            {msg.actions.map((act, i) => (
                              <div
                                key={i}
                                className="bg-white border border-teal-200 rounded-lg p-2 flex items-center justify-between gap-2 text-teal-900"
                              >
                                <span className="text-[11px] font-medium">⚡ {act}</span>
                                <button
                                  onClick={() => handleDispatchAction(act)}
                                  className="px-2 py-0.5 bg-teal-600 hover:bg-teal-700 text-white rounded text-[10px] font-bold cursor-pointer shrink-0 transition"
                                >
                                  Dispatch
                                </button>
                              </div>
                            ))}
                          </div>
                        )}

                        {isAura && msg.upsell && (
                          <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 text-amber-950 space-y-1">
                            <div className="flex items-center justify-between">
                              <span className="font-bold text-[11px] flex items-center gap-1">
                                <Sparkles className="w-3 h-3 text-amber-600" />
                                Recommended Experience
                              </span>
                              <strong className="text-xs font-bold text-amber-900">
                                {msg.upsell.price}
                              </strong>
                            </div>
                            <p className="text-[11px] font-semibold text-slate-800">
                              {msg.upsell.title}
                            </p>
                            <span className="text-[10px] text-amber-800/80 block">
                              {msg.upsell.relevance}
                            </span>
                          </div>
                        )}
                      </div>
                      <span className="text-[10px] text-slate-400 mt-1 px-1">
                        {isAura ? "Aura AI Concierge" : selectedGuest.name}
                      </span>
                    </div>
                  );
                })}

            {isSending && (
              <div className="flex items-center gap-2 text-slate-400 text-xs pl-2">
                <div className="w-2 h-2 rounded-full bg-teal-500 animate-bounce"></div>
                <div className="w-2 h-2 rounded-full bg-teal-500 animate-bounce delay-100"></div>
                <div className="w-2 h-2 rounded-full bg-teal-500 animate-bounce delay-200"></div>
                <span>Analyzing resort telemetry and synthesizing response...</span>
              </div>
            )}
          </div>

          {/* Chat Input Bar */}
          <div className="p-3 border-t border-slate-200 bg-white">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSendMessage();
              }}
              className="flex items-center gap-2"
            >
              <input
                id="concierge-user-input"
                type="text"
                value={userPrompt}
                onChange={(e) => setUserPrompt(e.target.value)}
                placeholder={
                  chatMode === "copilot"
                    ? "Ask how things are going, how the system works, or about any department..."
                    : `Type a request for ${selectedGuest.name}...`
                }
                className="flex-1 bg-slate-50 border border-slate-300 rounded-xl px-4 py-2.5 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:bg-white transition"
              />
              <button
                type="submit"
                disabled={isSending || !userPrompt.trim()}
                className="inline-flex items-center justify-center p-2.5 rounded-xl bg-slate-900 text-white hover:bg-slate-800 disabled:opacity-50 transition cursor-pointer"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};
