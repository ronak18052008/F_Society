"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { formatInr } from "@/lib/format";
import { useNivasa } from "@/store/nivasa-store";
import { cn } from "@/lib/cn";
import type { Property, RoommateProfile } from "@/types";
import type { PropertyComparisonData, RentalRiskAudit, CopilotIntent } from "@/lib/ai/copilot/engine";

export interface ChatMessage {
  id: string;
  role: "user" | "assistant" | "system";
  content: string;
  intent?: CopilotIntent;
  recommendations?: Property[];
  comparison?: PropertyComparisonData;
  riskAudit?: RentalRiskAudit;
  roommates?: RoommateProfile[];
  actionTriggers?: Array<{
    type: "view_property" | "save_property" | "compare" | "check_risk";
    label: string;
    href?: string;
    propertyId?: string;
  }>;
  suggestedPrompts?: string[];
  createdAt: string;
}

interface RentalCopilotProps {
  initialConversationId?: string;
  propertyContextId?: string;
  compact?: boolean;
  onClose?: () => void;
  onSelectConversation?: (id: string) => void;
}

const TENANT_SUGGESTED_PROMPTS = [
  "Find 2 BHK apartments in Mumbai under ₹45,000",
  "Compare properties in Bangalore side-by-side",
  "Is a 5-month security deposit normal? Check rental risk",
  "Looking for a verified roommate in Ahmedabad",
  "Water leakage in ceiling — is tenant or owner responsible?",
  "How does Nivasa verify landlord ownership and title?",
];

const OWNER_SUGGESTED_PROMPTS = [
  "Help me create a high-converting property listing",
  "How should I price my 2 BHK apartment?",
  "Compare my property with similar rental listings",
  "Draft a standard bilingual rental agreement",
  "How can I respond to this tenant inquiry?",
  "Explain maintenance responsibilities between owner and tenant",
];

export function RentalCopilot({
  initialConversationId,
  propertyContextId,
  compact = false,
  onClose,
  onSelectConversation,
}: RentalCopilotProps) {
  const { user, savedIds, toggleSave } = useNivasa();
  const isOwner = user?.role === "owner";
  const defaultPrompts = isOwner ? OWNER_SUGGESTED_PROMPTS : TENANT_SUGGESTED_PROMPTS;

  const [conversationId, setConversationId] = useState<string | undefined>(initialConversationId);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastFailedMessage, setLastFailedMessage] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-scroll to latest message
  const scrollToBottom = (smooth = true) => {
    messagesEndRef.current?.scrollIntoView({ behavior: smooth ? "smooth" : "auto" });
  };

  useEffect(() => {
    scrollToBottom(false);
  }, [messages, loading]);

  // Load existing conversation if id provided
  useEffect(() => {
    if (initialConversationId) {
      setConversationId(initialConversationId);
      loadConversationHistory(initialConversationId);
    } else if (messages.length === 0) {
      // Add welcome greeting
      const welcomeContent = isOwner
        ? `Hello${user?.name ? `, ${user.name}` : ""}! I am your **Nivasa AI Rental Copilot for Property Owners**. I can assist you with listing creation, rental pricing strategies, market yield benchmarks, drafting bilingual lease agreements, and managing tenant inquiries. How can I assist your property portfolio today?`
        : `Hello${user?.name ? `, ${user.name}` : ""}! I am your **Nivasa AI Rental Copilot**. I can help you find verified residences, run side-by-side property comparisons, audit rental deposit risks, triage maintenance issues, and match compatible flatmates. How can I assist your rental search today?`;

      setMessages([
        {
          id: "welcome",
          role: "assistant",
          content: welcomeContent,
          intent: "GENERAL_HELP",
          suggestedPrompts: defaultPrompts.slice(0, 4),
          createdAt: new Date().toISOString(),
        },
      ]);
    }
  }, [initialConversationId, isOwner, user?.name]);

  const loadConversationHistory = async (id: string) => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch(`/api/ai/copilot?conversationId=${encodeURIComponent(id)}`);
      if (!res.ok) throw new Error("Failed to load conversation history");
      const data = await res.json();
      if (data.messages && Array.isArray(data.messages)) {
        setMessages(
          data.messages.map((m: any) => ({
            id: m.id,
            role: m.role,
            content: m.content,
            intent: m.intent,
            recommendations: m.metadata?.recommendations,
            comparison: m.metadata?.comparison,
            riskAudit: m.metadata?.riskAudit,
            roommates: m.metadata?.roommates,
            actionTriggers: m.metadata?.actionTriggers,
            suggestedPrompts: m.metadata?.suggestedPrompts,
            createdAt: m.created_at,
          }))
        );
      }
    } catch (err: any) {
      console.error(err);
      setError("Could not load past conversation history.");
    } finally {
      setLoading(false);
    }
  };

  const handleSendMessage = async (textToSend?: string) => {
    const query = (textToSend || input).trim();
    if (!query || loading) return;

    setInput("");
    setError(null);
    setLastFailedMessage(null);

    // Create optimistic user message
    const userMsgId = "user-" + Date.now();
    const newMessages: ChatMessage[] = [
      ...messages,
      {
        id: userMsgId,
        role: "user",
        content: query,
        createdAt: new Date().toISOString(),
      },
    ];
    setMessages(newMessages);
    setLoading(true);

    try {
      const res = await fetch("/api/ai/copilot", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: query,
          conversationId,
          propertyId: propertyContextId,
          role: user?.role || "tenant",
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to receive copilot response.");
      }

      if (data.conversationId && data.conversationId !== conversationId) {
        setConversationId(data.conversationId);
        if (onSelectConversation) {
          onSelectConversation(data.conversationId);
        }
      }

      const assistantMsg: ChatMessage = {
        id: "assistant-" + Date.now(),
        role: "assistant",
        content: data.reply,
        intent: data.intent,
        recommendations: data.recommendations,
        comparison: data.comparison,
        riskAudit: data.riskAudit,
        roommates: data.roommates,
        actionTriggers: data.actionTriggers,
        suggestedPrompts: data.suggestedPrompts,
        createdAt: new Date().toISOString(),
      };

      setMessages([...newMessages, assistantMsg]);
    } catch (err: any) {
      console.error(err);
      setError(err.message || "An unexpected error occurred. Please try again.");
      setLastFailedMessage(query);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const getIntentBadge = (intent?: CopilotIntent) => {
    if (!intent) return null;
    const map: Record<CopilotIntent, { label: string; icon: string; bg: string; text: string }> = {
      PROPERTY_SEARCH: {
        label: "Property Search",
        icon: "🔍",
        bg: "bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800",
        text: "text-emerald-800 dark:text-emerald-300",
      },
      PROPERTY_COMPARISON: {
        label: "Comparative Matrix",
        icon: "⚖️",
        bg: "bg-amber-50 dark:bg-amber-950/40 border-amber-200 dark:border-amber-800",
        text: "text-amber-800 dark:text-amber-300",
      },
      RENTAL_RISK: {
        label: "RentTruth™ Risk Audit",
        icon: "🛡️",
        bg: "bg-rose-50 dark:bg-rose-950/40 border-rose-200 dark:border-rose-800",
        text: "text-rose-800 dark:text-rose-300",
      },
      ROOMMATE: {
        label: "Roommate Match",
        icon: "🤝",
        bg: "bg-purple-50 dark:bg-purple-950/40 border-purple-200 dark:border-purple-800",
        text: "text-purple-800 dark:text-purple-300",
      },
      MAINTENANCE: {
        label: "Maintenance Triage",
        icon: "🔧",
        bg: "bg-blue-50 dark:bg-blue-950/40 border-blue-200 dark:border-blue-800",
        text: "text-blue-800 dark:text-blue-300",
      },
      VERIFICATION: {
        label: "Verification Protocol",
        icon: "✅",
        bg: "bg-teal-50 dark:bg-teal-950/40 border-teal-200 dark:border-teal-800",
        text: "text-teal-800 dark:text-teal-300",
      },
      GENERAL_HELP: {
        label: "Rental Assistance",
        icon: "💡",
        bg: "bg-[var(--bg-canvas)] border-[var(--border)]",
        text: "text-[var(--text-main)]",
      },
    };

    const cfg = map[intent] || map.GENERAL_HELP;
    return (
      <span
        className={cn(
          "inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold border mb-2",
          cfg.bg,
          cfg.text
        )}
      >
        <span>{cfg.icon}</span>
        <span>{cfg.label}</span>
      </span>
    );
  };

  return (
    <div
      className={cn(
        "flex flex-col h-full bg-[var(--bg-canvas)] text-[var(--text-main)] rounded-2xl overflow-hidden border border-[var(--border)] shadow-xl",
        compact ? "max-h-[640px]" : "min-h-[600px]"
      )}
    >
      {/* Copilot Header */}
      <div className="flex items-center justify-between px-5 py-4 bg-[var(--bg-surface)]/80 backdrop-blur-md border-b border-[var(--border)]">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--accent-forest)] text-white shadow-xs">
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
              />
            </svg>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="font-serif font-bold text-base tracking-tight text-[var(--text-main)]">
                Nivasa AI Copilot
              </h2>
              <span className="inline-flex items-center rounded-full bg-[var(--accent-forest-subtle)] px-2 py-0.5 text-[10px] font-bold text-[var(--accent-forest)] uppercase tracking-wider">
                Active
              </span>
            </div>
            <p className="text-xs text-[var(--text-muted)]">
              Rental intelligence, risk audits & instant comparisons
            </p>
          </div>
        </div>

        {onClose && (
          <button
            type="button"
            onClick={onClose}
            aria-label="Close Copilot"
            className="flex h-8 w-8 items-center justify-center rounded-lg text-[var(--text-muted)] hover:bg-[var(--bg-surface-elevated)] transition-colors cursor-pointer"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={cn(
              "flex flex-col gap-2 max-w-[90%] sm:max-w-[85%]",
              msg.role === "user" ? "ml-auto items-end" : "mr-auto items-start"
            )}
          >
            {/* Message Bubble */}
            <div
              className={cn(
                "rounded-2xl p-4 sm:p-5 shadow-xs text-sm leading-relaxed",
                msg.role === "user"
                  ? "bg-[var(--accent-forest)] text-white rounded-br-none"
                  : "bg-[var(--bg-surface)] text-[var(--text-main)] border border-[var(--border)] rounded-bl-none"
              )}
            >
              {msg.role === "assistant" && getIntentBadge(msg.intent)}

              {/* Message Markdown/Body */}
              <div className="whitespace-pre-wrap space-y-2">
                {msg.content.split("\n\n").map((paragraph, pIdx) => {
                  // Handle bullet points
                  if (paragraph.startsWith("- ") || paragraph.startsWith("1. ")) {
                    const lines = paragraph.split("\n");
                    return (
                      <ul key={pIdx} className="list-disc pl-5 space-y-1 my-1">
                        {lines.map((l, lIdx) => (
                          <li key={lIdx} dangerouslySetInnerHTML={{ __html: formatInlineMarkdown(l.replace(/^[-*]\s+|\d+\.\s+/, "")) }} />
                        ))}
                      </ul>
                    );
                  }
                  return (
                    <p
                      key={pIdx}
                      dangerouslySetInnerHTML={{ __html: formatInlineMarkdown(paragraph) }}
                    />
                  );
                })}
              </div>

              {/* Timestamp */}
              <div
                className={cn(
                  "text-[10px] mt-2 font-mono text-right",
                  msg.role === "user" ? "text-white/70" : "text-[var(--text-faint)]"
                )}
              >
                {new Date(msg.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
              </div>
            </div>

            {/* Contextual Recommendations (Property Cards) */}
            {msg.recommendations && msg.recommendations.length > 0 && (
              <div className="w-full mt-2 space-y-3">
                <div className="text-xs font-bold uppercase tracking-wider text-[var(--text-muted)] flex items-center gap-1.5">
                  <span>🏡 Matched Properties ({msg.recommendations.length})</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full">
                  {msg.recommendations.map((property) => {
                    const isSaved = savedIds.includes(property.id);
                    return (
                      <div
                        key={property.id}
                        className="rounded-xl border border-[var(--border)] bg-[var(--bg-surface)] overflow-hidden shadow-xs hover:border-[var(--accent-forest)] transition-all flex flex-col"
                      >
                        <div className="relative aspect-[16/9] w-full bg-[var(--bg-surface-elevated)]">
                          <Image
                            src={
                              property.images?.[0] ||
                              "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=80"
                            }
                            alt={property.title}
                            fill
                            className="object-cover"
                            sizes="(max-width: 640px) 100vw, 300px"
                            unoptimized
                          />
                          <div className="absolute top-2 right-2">
                            <button
                              type="button"
                              onClick={() => toggleSave(property.id)}
                              aria-label={isSaved ? "Remove from saved" : "Save property"}
                              className="flex h-7 w-7 items-center justify-center rounded-full bg-white/90 dark:bg-[var(--bg-surface)]/90 backdrop-blur-md shadow-xs transition-transform hover:scale-110 active:scale-95 cursor-pointer"
                            >
                              <svg
                                className={cn("h-3.5 w-3.5", isSaved ? "fill-[var(--error)] text-[var(--error)]" : "fill-none text-[var(--text-faint)]")}
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                                strokeWidth="2"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                                />
                              </svg>
                            </button>
                          </div>
                          <div className="absolute bottom-2 left-2">
                            <span className="rounded-md bg-black/70 backdrop-blur-md px-2 py-0.5 text-[10px] font-semibold text-white">
                              ₹{formatInr(property.rent)}/mo
                            </span>
                          </div>
                        </div>

                        <div className="p-3 flex-1 flex flex-col justify-between">
                          <div>
                            <h4 className="font-serif font-bold text-sm text-[var(--text-main)] line-clamp-1">
                              {property.title}
                            </h4>
                            <p className="text-xs text-[var(--text-muted)] line-clamp-1">
                              {property.bhk || property.bedrooms} BHK · {property.locality}, {property.city}
                            </p>
                          </div>

                          <div className="mt-3 pt-2 border-t border-[var(--bg-surface-elevated)] flex items-center justify-between gap-2">
                            <Link
                              href={`/property/${property.id}`}
                              className="flex-1 text-center py-1.5 px-2.5 rounded-lg bg-[var(--accent-forest)] text-white text-xs font-semibold hover:bg-[var(--accent-forest-hover)] transition-colors"
                            >
                              View Property
                            </Link>
                            <Link
                              href={`/renttruth/${property.id}`}
                              className="py-1.5 px-2 rounded-lg bg-[var(--bg-surface-elevated)] text-[var(--text-main)] text-[11px] font-semibold hover:bg-[var(--border)] transition-colors"
                              title="Check Risk"
                            >
                              🛡️ Risk
                            </Link>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Contextual Comparison Matrix */}
            {msg.comparison && (
              <div className="w-full mt-2 rounded-xl border border-[var(--border)] bg-[var(--bg-surface)] p-4 shadow-xs">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <span className="text-base">⚖️</span>
                    <h4 className="font-serif font-bold text-sm text-[var(--text-main)]">
                      Side-by-Side Comparison Matrix
                    </h4>
                  </div>
                  <span className="text-[10px] font-bold text-[var(--accent-forest)] bg-[var(--accent-forest-subtle)] px-2 py-0.5 rounded-full">
                    Best Value Highlighted
                  </span>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-xs text-left">
                    <thead>
                      <tr className="border-b border-[var(--border)] text-[var(--text-muted)]">
                        <th className="py-2 pr-3 font-semibold">Metric</th>
                        {msg.comparison.properties.map((p) => (
                          <th
                            key={p.id}
                            className={cn(
                              "py-2 px-3 font-semibold",
                              p.id === msg.comparison?.bestValueId
                                ? "text-[var(--accent-forest)] bg-[var(--accent-forest-subtle)] rounded-t-lg"
                                : ""
                            )}
                          >
                            {p.title}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[var(--bg-surface-elevated)]">
                      <tr>
                        <td className="py-2 pr-3 font-medium text-[var(--text-muted)]">Monthly Rent</td>
                        {msg.comparison.properties.map((p) => (
                          <td key={p.id} className="py-2 px-3 font-bold text-[var(--text-main)]">
                            ₹{formatInr(p.rent)}
                          </td>
                        ))}
                      </tr>
                      <tr>
                        <td className="py-2 pr-3 font-medium text-[var(--text-muted)]">Deposit</td>
                        {msg.comparison.properties.map((p) => (
                          <td key={p.id} className="py-2 px-3">
                            ₹{formatInr(p.deposit)}
                          </td>
                        ))}
                      </tr>
                      <tr>
                        <td className="py-2 pr-3 font-medium text-[var(--text-muted)]">Rate / sqft</td>
                        {msg.comparison.properties.map((p) => (
                          <td key={p.id} className="py-2 px-3">
                            ₹{Math.round(p.rent / p.sizeSqft)}/sqft
                          </td>
                        ))}
                      </tr>
                      <tr>
                        <td className="py-2 pr-3 font-medium text-[var(--text-muted)]">Furnishing</td>
                        {msg.comparison.properties.map((p) => (
                          <td key={p.id} className="py-2 px-3">
                            {p.furnishing}
                          </td>
                        ))}
                      </tr>
                      <tr>
                        <td className="py-2 pr-3 font-medium text-[var(--text-muted)]">Trust Score</td>
                        {msg.comparison.properties.map((p) => (
                          <td key={p.id} className="py-2 px-3 font-bold text-[var(--success)]">
                            {p.trustScore}/100
                          </td>
                        ))}
                      </tr>
                      <tr>
                        <td className="py-2 pr-3 font-medium text-[var(--text-muted)]">Action</td>
                        {msg.comparison.properties.map((p) => (
                          <td key={p.id} className="py-2 px-3">
                            <Link
                              href={`/property/${p.id}`}
                              className="inline-block px-2.5 py-1 rounded bg-[var(--accent-forest)] text-white text-[11px] font-semibold hover:bg-[var(--accent-forest-hover)]"
                            >
                              View
                            </Link>
                          </td>
                        ))}
                      </tr>
                    </tbody>
                  </table>
                </div>

                <div className="mt-3 p-2.5 rounded-lg bg-[var(--bg-canvas)] border border-[var(--border)] text-xs text-[var(--text-muted)]">
                  <strong>Copilot Verdict:</strong> {msg.comparison.verdict}
                </div>
              </div>
            )}

            {/* Contextual Risk Audit Card */}
            {msg.riskAudit && (
              <div className="w-full mt-2 rounded-xl border border-[var(--border)] bg-[var(--bg-surface)] p-4 shadow-xs">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <span className="text-base">🛡️</span>
                    <h4 className="font-serif font-bold text-sm text-[var(--text-main)]">
                      RentTruth™ Risk & Safety Assessment
                    </h4>
                  </div>
                  <span
                    className={cn(
                      "px-2.5 py-0.5 rounded-full text-xs font-bold uppercase",
                      msg.riskAudit.level === "Low"
                        ? "bg-[var(--success)]/20 text-[var(--success)]"
                        : msg.riskAudit.level === "Moderate"
                        ? "bg-[var(--warning)]/20 text-[var(--warning)]"
                        : "bg-[var(--error)]/20 text-[var(--error)]"
                    )}
                  >
                    {msg.riskAudit.level} Risk ({msg.riskAudit.score}/100)
                  </span>
                </div>

                <div className="space-y-2 text-xs">
                  {msg.riskAudit.factors.map((f, fIdx) => (
                    <div
                      key={fIdx}
                      className="p-2.5 rounded-lg bg-[var(--bg-canvas)] border border-[var(--border)] flex items-start gap-2.5"
                    >
                      <span className="text-sm">
                        {f.status === "pass" ? "✅" : f.status === "warning" ? "⚠️" : "❌"}
                      </span>
                      <div>
                        <div className="font-semibold text-[var(--text-main)]">{f.title}</div>
                        <div className="text-[var(--text-muted)] mt-0.5">{f.detail}</div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-3 p-2.5 rounded-lg bg-[var(--success)]/10 border border-[var(--success)]/30 text-xs text-[var(--success)]">
                  <strong>Legal Benchmark:</strong> {msg.riskAudit.legalGuidance}
                </div>
              </div>
            )}

            {/* Contextual Roommate Cards */}
            {msg.roommates && msg.roommates.length > 0 && (
              <div className="w-full mt-2 space-y-2">
                <div className="text-xs font-bold uppercase tracking-wider text-[var(--text-muted)]">
                  Verified Roommate Matches
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {msg.roommates.map((r) => (
                    <div
                      key={r.id}
                      className="p-3 rounded-xl border border-[var(--border)] bg-[var(--bg-surface)] text-xs space-y-1.5"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-[var(--text-main)]">{r.displayName}</span>
                        <span className="font-mono text-[var(--accent-forest)] font-semibold">₹{r.budget.toLocaleString("en-IN")}/mo</span>
                      </div>
                      <div className="text-[var(--text-muted)] flex flex-wrap gap-1">
                        <span className="px-1.5 py-0.5 rounded bg-[var(--bg-surface-elevated)]">
                          {r.occupation}
                        </span>
                        <span className="px-1.5 py-0.5 rounded bg-[var(--bg-surface-elevated)]">
                          {r.food} diet
                        </span>
                        <span className="px-1.5 py-0.5 rounded bg-[var(--bg-surface-elevated)]">
                          {r.cleanliness} clean
                        </span>
                      </div>
                      <Link
                        href="/tenant/roommates"
                        className="inline-block mt-1 text-[11px] font-semibold text-[var(--accent-forest)] hover:underline"
                      >
                        Connect via Roommate Hub →
                      </Link>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Suggested Follow-up Prompt Pills */}
            {msg.suggestedPrompts && msg.suggestedPrompts.length > 0 && (
              <div className="w-full mt-2 flex flex-wrap gap-1.5">
                {msg.suggestedPrompts.map((prompt, pIdx) => (
                  <button
                    key={pIdx}
                    type="button"
                    onClick={() => handleSendMessage(prompt)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs bg-[var(--bg-surface)] border border-[var(--border)] text-[var(--text-main)] hover:border-[var(--accent-forest)] hover:bg-[var(--accent-forest-subtle)] transition-colors shadow-xs cursor-pointer"
                  >
                    <span>💬</span>
                    <span>{prompt}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        ))}

        {/* Typing Indicator */}
        {loading && (
          <div className="mr-auto flex items-center gap-2 rounded-2xl rounded-bl-none bg-[var(--bg-surface)] border border-[var(--border)] px-4 py-3 shadow-xs">
            <span className="text-xs text-[var(--text-muted)] font-medium">
              Copilot is analyzing...
            </span>
            <div className="flex items-center gap-1">
              <span className="h-2 w-2 rounded-full bg-[var(--accent-forest)] animate-bounce" style={{ animationDelay: "0ms" }} />
              <span className="h-2 w-2 rounded-full bg-[var(--accent-forest)] animate-bounce" style={{ animationDelay: "150ms" }} />
              <span className="h-2 w-2 rounded-full bg-[var(--accent-forest)] animate-bounce" style={{ animationDelay: "300ms" }} />
            </div>
          </div>
        )}

        {/* Error State with Retry Button */}
        {error && (
          <div className="w-full rounded-xl bg-rose-50 dark:bg-[var(--error)]/10 border border-[var(--error)]/30 p-4 flex items-center justify-between gap-3 text-xs text-[var(--error)]">
            <div className="flex items-center gap-2">
              <span>⚠️</span>
              <span>{error}</span>
            </div>
            {lastFailedMessage && (
              <button
                type="button"
                onClick={() => handleSendMessage(lastFailedMessage)}
                className="px-3 py-1 rounded-lg bg-[var(--error)] text-white font-semibold hover:bg-rose-700 transition-colors cursor-pointer"
              >
                Retry
              </button>
            )}
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Form Bar */}
      <div className="p-3 sm:p-4 bg-[var(--bg-surface)]/90 backdrop-blur-md border-t border-[var(--border)]">
        <div className="relative flex items-center rounded-xl bg-[var(--bg-canvas)] border border-[var(--border)] focus-within:border-[var(--accent-forest)] focus-within:ring-1 focus-within:ring-[var(--accent-forest)] transition-all">
          <textarea
            ref={textareaRef}
            rows={1}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask about properties, compare rent, audit deposit risks, or find roommates..."
            className="flex-1 max-h-32 min-h-[44px] py-2.5 px-3.5 bg-transparent text-xs sm:text-sm text-[var(--text-main)] placeholder-[var(--text-faint)] focus:outline-hidden resize-none"
          />

          <div className="pr-2 flex items-center gap-1.5">
            <button
              type="button"
              disabled={loading || !input.trim()}
              onClick={() => handleSendMessage()}
              aria-label="Send message"
              className={cn(
                "flex h-8 w-8 items-center justify-center rounded-lg text-white transition-all cursor-pointer",
                input.trim() && !loading
                  ? "bg-[var(--accent-forest)] hover:bg-[var(--accent-forest-hover)] shadow-xs active:scale-95"
                  : "bg-[var(--border)] text-[var(--text-faint)] cursor-not-allowed"
              )}
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
                />
              </svg>
            </button>
          </div>
        </div>

        <div className="mt-2 flex items-center justify-between text-[10px] text-[var(--text-faint)] px-1">
          <span>Press Enter to send · Shift+Enter for new line</span>
          <span>Zero-Brokerage · Model Tenancy Act Compliant</span>
        </div>
      </div>
    </div>
  );
}

function formatInlineMarkdown(text: string): string {
  return text
    .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
    .replace(/\*(.*?)\*/g, "<em>$1</em>")
    .replace(/`([^`]+)`/g, "<code class='px-1 py-0.5 rounded bg-black/10 dark:bg-white/10 font-mono text-xs'>$1</code>");
}
