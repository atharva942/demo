import React, { useState } from "react";
import {
  MessageSquare,
  Sparkles,
  Star,
  AlertTriangle,
  CheckCircle2,
  Send,
  CornerDownRight,
  TrendingUp,
  ThumbsDown,
  ThumbsUp,
  RotateCcw,
} from "lucide-react";
import { GuestReview } from "../types";

interface SentimentTabProps {
  reviews: GuestReview[];
  onResolveReview: (reviewId: string, responseText: string) => void;
  onAddReview: (newReview: GuestReview) => void;
}

export const SentimentTab: React.FC<SentimentTabProps> = ({
  reviews,
  onResolveReview,
  onAddReview,
}) => {
  const [selectedReview, setSelectedReview] = useState<GuestReview>(reviews[0]);
  const [isTriaging, setIsTriaging] = useState(false);
  const [triageData, setTriageData] = useState<any | null>(null);
  const [responseDraft, setResponseDraft] = useState("");
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);

  // New review tester state
  const [customAuthor, setCustomAuthor] = useState("");
  const [customRoom, setCustomRoom] = useState("");
  const [customRating, setCustomRating] = useState(3);
  const [customComment, setCustomComment] = useState("");

  const handleRunTriage = async (review: GuestReview) => {
    setSelectedReview(review);
    setIsTriaging(true);
    setTriageData(null);

    try {
      const response = await fetch("/api/ai/sentiment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ review }),
      });
      const data = await response.json();
      setTriageData(data);
      setResponseDraft(data.personalizedResponseDraft || "");
    } catch (err) {
      setTriageData({
        sentiment: review.rating <= 2 ? "Negative / Urgent" : review.rating === 3 ? "Neutral" : "Positive",
        urgencyScore: review.rating <= 2 ? 9 : 3,
        detectedTopics: ["Wait Times", "Service Speed", "F&B Temperature"],
        rootCause: "Kitchen expo queue exceeded capacity during Sunday 13:00 turnaround wave.",
        internalCorrectiveAction: "Pre-assign dedicated expeditor and cap walk-in seating during peak turnaround hours.",
        personalizedResponseDraft: `Khamaghani and Namaste ${review.guestName},\n\nThank you for sharing your gracious feedback. At Veda Vilas Palace & Ayurvedic Sanctuary, our sacred commitment is to embody 'Atithi Devo Bhava'. I am deeply regretful that your experience did not reach the royal pinnacle you expected. I have personally convened with Executive Chef Sanjeev Sen and Head Butler Vikramaditya Rathore to ensure this is rectified immediately. I would be honored to host you for a private royal Khansama dinner on your next visit to Udaipur.\n\nWarm regards,\nGeneral Manager, Veda Vilas Palace & Ayurvedic Sanctuary`,
      });
      setResponseDraft(
        `Khamaghani and Namaste ${review.guestName},\n\nThank you for sharing your gracious feedback. At Veda Vilas Palace & Ayurvedic Sanctuary, our sacred commitment is to embody 'Atithi Devo Bhava'. I am deeply regretful that your experience did not reach the royal pinnacle you expected. I have personally convened with Executive Chef Sanjeev Sen and Head Butler Vikramaditya Rathore to ensure this is rectified immediately. I would be honored to host you for a private royal Khansama dinner on your next visit to Udaipur.\n\nWarm regards,\nGeneral Manager, Veda Vilas Palace & Ayurvedic Sanctuary`
      );
    } finally {
      setIsTriaging(false);
    }
  };

  const handleSendResponse = () => {
    onResolveReview(selectedReview.id, responseDraft);
    setActionSuccess(
      `Official GM Response approved and sent to ${selectedReview.guestName} via ${selectedReview.channel}.`
    );
    setTimeout(() => setActionSuccess(null), 5000);
  };

  const handleCreateCustomReview = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customComment.trim()) return;

    const newRev: GuestReview = {
      id: `rev-${Date.now()}`,
      guestName: customAuthor || "Anonymous Palace Guest",
      roomNumber: customRoom || "Maharaja Suite 204",
      date: "Just now",
      rating: customRating,
      channel: "In-App Tablet",
      comment: customComment,
      sentiment: customRating >= 4 ? "positive" : customRating === 3 ? "neutral" : "negative",
      triageStatus: "pending",
      detectedDepartment: customComment.toLowerCase().includes("pool")
        ? "Facilities"
        : customComment.toLowerCase().includes("food") || customComment.toLowerCase().includes("bistro")
        ? "F&B"
        : "Front Desk",
    };

    onAddReview(newRev);
    setCustomComment("");
    setCustomAuthor("");
    setCustomRoom("");
    handleRunTriage(newRev);
  };

  return (
    <div className="space-y-6">
      {actionSuccess && (
        <div className="bg-emerald-50 border border-emerald-300 text-emerald-900 px-4 py-3 rounded-xl flex items-center justify-between shadow-xs">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            <span className="text-sm font-medium">{actionSuccess}</span>
          </div>
          <button onClick={() => setActionSuccess(null)} className="text-xs font-bold text-emerald-700">
            Dismiss
          </button>
        </div>
      )}

      {/* Header */}
      <div>
        <div className="flex items-center gap-2">
          <MessageSquare className="w-5 h-5 text-purple-600" />
          <h2 className="text-xl font-bold text-slate-900 font-serif">
            Guest Sentiment Analysis & Real-Time Feedback Triage
          </h2>
        </div>
        <p className="text-xs text-slate-500">
          Unifies reviews from In-room tablets, Google Reviews, and TripAdvisor. Gemini AI isolates operational root causes and crafts empathetic recovery letters.
        </p>
      </div>

      {/* Sentiment Overview Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
        <div className="bg-white p-4 rounded-xl border border-slate-200">
          <span className="text-slate-500 block text-[11px]">Net Sentiment Score</span>
          <strong className="text-xl font-bold text-slate-900">94.2% Positive</strong>
          <div className="flex items-center gap-1 text-emerald-600 text-[10px] mt-1">
            <TrendingUp className="w-3 h-3" />
            <span>+1.8% vs. last week</span>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200">
          <span className="text-slate-500 block text-[11px]">Spa & Wellness</span>
          <strong className="text-xl font-bold text-emerald-600">99.1%</strong>
          <span className="text-[10px] text-slate-400 block mt-1">Top performing area</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200">
          <span className="text-slate-500 block text-[11px]">Facilities & Engineering</span>
          <strong className="text-xl font-bold text-amber-600">91.4%</strong>
          <span className="text-[10px] text-amber-700 block mt-1">Elevator stutter noted</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200">
          <span className="text-slate-500 block text-[11px]">Food & Beverage Wait Times</span>
          <strong className="text-xl font-bold text-rose-600">88.2%</strong>
          <span className="text-[10px] text-rose-700 block mt-1">Sunday brunch queue</span>
        </div>
      </div>

      {/* Main 2-column view */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Review Feed (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Live Review Feed ({reviews.length})
            </span>
            <span className="text-[11px] text-slate-400">Click to Triage</span>
          </div>

          <div className="space-y-3">
            {reviews.map((rev) => {
              const isSelected = selectedReview.id === rev.id;
              const isNegative = rev.sentiment === "negative";
              const isNeutral = rev.sentiment === "neutral";

              return (
                <div
                  key={rev.id}
                  onClick={() => handleRunTriage(rev)}
                  className={`p-4 rounded-xl border transition cursor-pointer text-xs space-y-2 ${
                    isSelected
                      ? "border-purple-500 bg-purple-50/40 shadow-xs ring-1 ring-purple-400"
                      : "border-slate-200 bg-white hover:border-slate-300"
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <strong className="text-sm font-bold text-slate-900 block">
                        {rev.guestName}
                      </strong>
                      <span className="text-slate-500 text-[11px]">
                        {rev.roomNumber} · {rev.channel} · {rev.date}
                      </span>
                    </div>

                    <div className="flex items-center gap-1">
                      <div className="flex items-center text-amber-400">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Star
                            key={i}
                            className={`w-3 h-3 ${
                              i < rev.rating ? "fill-amber-400" : "text-slate-200"
                            }`}
                          />
                        ))}
                      </div>
                    </div>
                  </div>

                  <p className="text-slate-700 italic leading-relaxed text-xs line-clamp-3">
                    "{rev.comment}"
                  </p>

                  <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px]">
                    <span
                      className={`px-2 py-0.5 rounded-full font-bold uppercase text-[9px] ${
                        isNegative
                          ? "bg-rose-100 text-rose-800"
                          : isNeutral
                          ? "bg-amber-100 text-amber-800"
                          : "bg-emerald-100 text-emerald-800"
                      }`}
                    >
                      {rev.sentiment}
                    </span>

                    <span className="text-slate-500">Dept: {rev.detectedDepartment}</span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Quick Review Ingestion Simulator */}
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3">
            <span className="text-xs font-bold text-slate-800 block">
              Simulate Incoming Guest Feedback:
            </span>
            <form onSubmit={handleCreateCustomReview} className="space-y-2 text-xs">
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="text"
                  placeholder="Guest Name"
                  value={customAuthor}
                  onChange={(e) => setCustomAuthor(e.target.value)}
                  className="bg-white border border-slate-300 rounded-lg p-2 text-xs"
                />
                <select
                  value={customRating}
                  onChange={(e) => setCustomRating(Number(e.target.value))}
                  className="bg-white border border-slate-300 rounded-lg p-2 text-xs font-semibold"
                >
                  <option value={1}>⭐ 1 Star (Critical)</option>
                  <option value={2}>⭐⭐ 2 Stars (Poor)</option>
                  <option value={3}>⭐⭐⭐ 3 Stars (Average)</option>
                  <option value={4}>⭐⭐⭐⭐ 4 Stars (Good)</option>
                  <option value={5}>⭐⭐⭐⭐⭐ 5 Stars (Luxury)</option>
                </select>
              </div>

              <textarea
                placeholder="Guest feedback comment (e.g. 'Air conditioner in Villa 202 was humming loudly all night')..."
                value={customComment}
                onChange={(e) => setCustomComment(e.target.value)}
                rows={2}
                className="w-full bg-white border border-slate-300 rounded-lg p-2 text-xs focus:ring-1 focus:ring-purple-500"
              />

              <button
                type="submit"
                className="w-full py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-semibold transition cursor-pointer"
              >
                Inject Feedback into AI Stream
              </button>
            </form>
          </div>
        </div>

        {/* Right Column: AI Triage & Resolution Studio (7 cols) */}
        <div className="lg:col-span-7 bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-5">
          <div className="flex items-center justify-between border-b border-slate-200 pb-3">
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-purple-600" />
              <h3 className="text-base font-bold text-slate-900">
                AI Sentiment Diagnostic & Root Cause Engine
              </h3>
            </div>
            <button
              onClick={() => handleRunTriage(selectedReview)}
              disabled={isTriaging}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-purple-700 bg-purple-50 hover:bg-purple-100 border border-purple-200 transition cursor-pointer"
            >
              <RotateCcw className={`w-3.5 h-3.5 ${isTriaging ? "animate-spin" : ""}`} />
              <span>Re-Triage with Gemini</span>
            </button>
          </div>

          {/* Active Review Spotlight */}
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 text-xs space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="font-bold text-slate-900">
                {selectedReview.guestName} ({selectedReview.roomNumber})
              </span>
              <span className="text-slate-500">{selectedReview.channel}</span>
            </div>
            <p className="text-slate-700 italic text-sm">
              "{selectedReview.comment}"
            </p>
          </div>

          {isTriaging ? (
            <div className="py-12 text-center text-slate-500 text-xs space-y-2">
              <div className="w-6 h-6 border-2 border-purple-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
              <p>Analyzing psychological sentiment, isolating operational failures...</p>
            </div>
          ) : triageData ? (
            <div className="space-y-4">
              {/* Root Cause & Corrective Action */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div className="bg-rose-50 border border-rose-200 p-3.5 rounded-xl space-y-1">
                  <span className="text-rose-800 font-bold block flex items-center gap-1">
                    <AlertTriangle className="w-3.5 h-3.5" />
                    Identified Operational Root Cause:
                  </span>
                  <p className="text-rose-950 font-medium">
                    {triageData.rootCause}
                  </p>
                </div>

                <div className="bg-teal-50 border border-teal-200 p-3.5 rounded-xl space-y-1">
                  <span className="text-teal-800 font-bold block flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    Internal Corrective Mandate:
                  </span>
                  <p className="text-teal-950 font-medium">
                    {triageData.internalCorrectiveAction}
                  </p>
                </div>
              </div>

              {/* Personalized Response Draft */}
              <div className="space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <label className="font-bold text-slate-800 block">
                    AI-Drafted General Manager Recovery Letter:
                  </label>
                  <span className="text-[11px] text-slate-500">
                    Tone: Luxury, Empathetic, Solution-Oriented
                  </span>
                </div>

                <textarea
                  value={responseDraft}
                  onChange={(e) => setResponseDraft(e.target.value)}
                  rows={6}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl p-3.5 text-xs text-slate-900 leading-relaxed focus:bg-white focus:ring-2 focus:ring-purple-500 focus:outline-none"
                />

                <div className="flex justify-end gap-2 pt-2">
                  <button
                    id="approve-response-btn"
                    onClick={handleSendResponse}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 active:scale-98 transition shadow-xs cursor-pointer"
                  >
                    <Send className="w-3.5 h-3.5 text-amber-300" />
                    <span>Approve & Dispatch Recovery Response</span>
                  </button>
                </div>
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
};
