"use client";

import { useState, useEffect } from "react";
import { RentalCopilot } from "@/components/ai/rental-copilot";
import { cn } from "@/lib/cn";

interface ConversationItem {
  id: string;
  title: string;
  last_intent?: string;
  updated_at: string;
}

export default function CopilotPage() {
  const [conversations, setConversations] = useState<ConversationItem[]>([]);
  const [activeConvId, setActiveConvId] = useState<string | undefined>(undefined);
  const [loadingHistory, setLoadingHistory] = useState(false);

  useEffect(() => {
    loadConversations();
  }, []);

  const loadConversations = async () => {
    try {
      setLoadingHistory(true);
      const res = await fetch("/api/ai/copilot");
      if (res.ok) {
        const data = await res.json();
        if (data.conversations && Array.isArray(data.conversations)) {
          setConversations(data.conversations);
        }
      }
    } catch {
      // Graceful fallback
    } finally {
      setLoadingHistory(false);
    }
  };

  const handleStartNewChat = () => {
    setActiveConvId(undefined);
  };

  const handleSelectConv = (id: string) => {
    setActiveConvId(id);
  };

  return (
    <div className="min-h-[calc(100vh-80px)] bg-[#faf7f0] dark:bg-[#142018] py-6 px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        {/* Page Hero Header */}
        <div className="mb-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-[#e5dfc5] dark:border-[#2a3f31] pb-6">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full bg-[#7ca982]/15 px-3 py-1 text-xs font-bold text-[#5a835f] dark:text-[#a8cca9] mb-2 border border-[#7ca982]/30">
              <span className="h-2 w-2 rounded-full bg-[#7ca982]" />
              NESTORA Intelligent Copilot · Feature 1
            </div>
            <h1 className="font-serif text-2xl sm:text-3xl font-bold tracking-tight text-[#1d3122] dark:text-[#f5f9f6]">
              AI Rental Copilot
            </h1>
            <p className="mt-1 text-sm text-[#4e6853] dark:text-[#9bb3a0] max-w-2xl">
              Conversational intelligence for verified property discovery, side-by-side metric comparison,
              RentTruth™ security deposit audits, and tenancy issue triage.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1 rounded-lg bg-white dark:bg-[#1a281f] border border-[#e5dfc5] dark:border-[#2a3f31] px-3 py-1.5 text-xs font-semibold text-[#1d3122] dark:text-[#f5f9f6]">
              🛡️ Zero Brokerage
            </span>
            <span className="inline-flex items-center gap-1 rounded-lg bg-white dark:bg-[#1a281f] border border-[#e5dfc5] dark:border-[#2a3f31] px-3 py-1.5 text-xs font-semibold text-[#1d3122] dark:text-[#f5f9f6]">
              📜 MTA Compliant
            </span>
            <span className="inline-flex items-center gap-1 rounded-lg bg-white dark:bg-[#1a281f] border border-[#e5dfc5] dark:border-[#2a3f31] px-3 py-1.5 text-xs font-semibold text-[#1d3122] dark:text-[#f5f9f6]">
              ⚡ Live Intelligence
            </span>
          </div>
        </div>

        {/* Dual-Pane Workspace */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left Column: History & Quick Capabilities */}
          <div className="lg:col-span-4 space-y-4">
            {/* New Consultation CTA */}
            <button
              type="button"
              onClick={handleStartNewChat}
              className="w-full flex items-center justify-center gap-2 rounded-xl bg-[#7ca982] hover:bg-[#6b9a71] text-white font-semibold py-3 px-4 shadow-sm hover:shadow-md transition-all active:scale-[0.99] cursor-pointer text-sm"
            >
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              <span>Start New Consultation</span>
            </button>

            {/* Past Consultations Card */}
            <div className="rounded-2xl border border-[#e5dfc5] dark:border-[#2a3f31] bg-white dark:bg-[#1a281f] p-4 shadow-xs">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-serif font-bold text-sm text-[#1d3122] dark:text-[#f5f9f6]">
                  Recent Consultations
                </h3>
                <span className="text-[11px] font-mono text-[#7d9782]">
                  {conversations.length} saved
                </span>
              </div>

              {loadingHistory ? (
                <div className="py-6 text-center text-xs text-[#7d9782]">Loading history...</div>
              ) : conversations.length === 0 ? (
                <div className="py-6 text-center text-xs text-[#7d9782]">
                  No past consultations yet. Start chatting to save your inquiries.
                </div>
              ) : (
                <div className="space-y-1.5 max-h-60 overflow-y-auto pr-1">
                  {conversations.map((c) => (
                    <button
                      key={c.id}
                      type="button"
                      onClick={() => handleSelectConv(c.id)}
                      className={cn(
                        "w-full text-left p-2.5 rounded-xl text-xs transition-all flex items-center justify-between gap-2 cursor-pointer",
                        activeConvId === c.id
                          ? "bg-[#7ca982]/15 text-[#1d3122] dark:text-[#f5f9f6] font-semibold border border-[#7ca982]/40"
                          : "hover:bg-[#faf7f0] dark:hover:bg-[#142018] text-[#4e6853] dark:text-[#9bb3a0]"
                      )}
                    >
                      <div className="truncate">
                        <div className="truncate">{c.title}</div>
                        <div className="text-[10px] text-[#7d9782] font-mono mt-0.5">
                          {new Date(c.updated_at).toLocaleDateString()}
                        </div>
                      </div>
                      {c.last_intent && (
                        <span className="shrink-0 px-2 py-0.5 rounded-md text-[9px] font-bold uppercase bg-black/5 dark:bg-white/10">
                          {c.last_intent.replace("_", " ")}
                        </span>
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* 7 Supported Domains Guide */}
            <div className="rounded-2xl border border-[#e5dfc5] dark:border-[#2a3f31] bg-white dark:bg-[#1a281f] p-4 shadow-xs space-y-3">
              <h3 className="font-serif font-bold text-sm text-[#1d3122] dark:text-[#f5f9f6]">
                Copilot Capabilities
              </h3>
              <div className="space-y-2 text-xs">
                <div className="flex items-start gap-2.5 p-2 rounded-lg bg-[#faf7f0] dark:bg-[#142018]">
                  <span>🔍</span>
                  <div>
                    <div className="font-semibold text-[#1d3122] dark:text-[#f5f9f6]">Property Discovery</div>
                    <div className="text-[#4e6853] dark:text-[#9bb3a0]">Searches 4,750+ verified homes across 6 metros.</div>
                  </div>
                </div>

                <div className="flex items-start gap-2.5 p-2 rounded-lg bg-[#faf7f0] dark:bg-[#142018]">
                  <span>⚖️</span>
                  <div>
                    <div className="font-semibold text-[#1d3122] dark:text-[#f5f9f6]">Comparison Matrices</div>
                    <div className="text-[#4e6853] dark:text-[#9bb3a0]">Evaluates rent, deposits, rate/sqft, and trust metrics.</div>
                  </div>
                </div>

                <div className="flex items-start gap-2.5 p-2 rounded-lg bg-[#faf7f0] dark:bg-[#142018]">
                  <span>🛡️</span>
                  <div>
                    <div className="font-semibold text-[#1d3122] dark:text-[#f5f9f6]">RentTruth™ Risk Audits</div>
                    <div className="text-[#4e6853] dark:text-[#9bb3a0]">Identifies deposit inflations and unfair clauses.</div>
                  </div>
                </div>

                <div className="flex items-start gap-2.5 p-2 rounded-lg bg-[#faf7f0] dark:bg-[#142018]">
                  <span>🤝</span>
                  <div>
                    <div className="font-semibold text-[#1d3122] dark:text-[#f5f9f6]">Roommate Match</div>
                    <div className="text-[#4e6853] dark:text-[#9bb3a0]">Matches verified roommates by dietary, sleep, and budget fit.</div>
                  </div>
                </div>

                <div className="flex items-start gap-2.5 p-2 rounded-lg bg-[#faf7f0] dark:bg-[#142018]">
                  <span>🔧</span>
                  <div>
                    <div className="font-semibold text-[#1d3122] dark:text-[#f5f9f6]">Maintenance Triage</div>
                    <div className="text-[#4e6853] dark:text-[#9bb3a0]">Triages repairs and clarifies legal responsibilities.</div>
                  </div>
                </div>

                <div className="flex items-start gap-2.5 p-2 rounded-lg bg-[#faf7f0] dark:bg-[#142018]">
                  <span>✅</span>
                  <div>
                    <div className="font-semibold text-[#1d3122] dark:text-[#f5f9f6]">Verification Protocol</div>
                    <div className="text-[#4e6853] dark:text-[#9bb3a0]">Guides Aadhaar KYC, title deeds, and condition passports.</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Main Chat Window */}
          <div className="lg:col-span-8 h-[760px]">
            <RentalCopilot
              key={activeConvId || "fresh"}
              initialConversationId={activeConvId}
              onSelectConversation={(id) => {
                setActiveConvId(id);
                loadConversations();
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
