"use client";

import { useState } from "react";
import { RentalCopilot } from "@/components/ai/rental-copilot";
import { cn } from "@/lib/cn";

export function FloatingCopilot() {
  const [isOpen, setIsOpen] = useState(false);
  const [minimized, setMinimized] = useState(false);

  return (
    <>
      {/* Floating Action Trigger Button */}
      <div className="fixed bottom-5 right-5 z-40">
        {!isOpen ? (
          <button
            type="button"
            onClick={() => {
              setIsOpen(true);
              setMinimized(false);
            }}
            aria-label="Open AI Rental Copilot"
            className="group relative flex items-center gap-2.5 rounded-full bg-[#7ca982] hover:bg-[#6b9a71] text-white px-4 py-3 shadow-lg hover:shadow-xl transition-all duration-300 active:scale-95 cursor-pointer border border-white/20"
          >
            {/* Pulsing indicator ring */}
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75" />
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-white" />
            </span>

            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"
              />
            </svg>

            <span className="font-serif font-bold text-sm tracking-tight hidden sm:inline">
              AI Copilot
            </span>

            <span className="rounded-full bg-white/20 px-1.5 py-0.2 text-[9px] font-mono uppercase tracking-wider font-bold">
              AI
            </span>
          </button>
        ) : null}
      </div>

      {/* Slide-over / Modal Chat Panel */}
      {isOpen && (
        <div
          className={cn(
            "fixed z-50 transition-all duration-300 ease-out",
            minimized
              ? "bottom-5 right-5 w-72"
              : "bottom-5 right-5 w-[94vw] sm:w-[480px] h-[640px] max-h-[90vh]"
          )}
        >
          {minimized ? (
            <div className="flex items-center justify-between p-3 rounded-xl bg-white dark:bg-[#1a281f] border border-[#e5dfc5] dark:border-[#2a3f31] shadow-xl">
              <div className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-[#7ca982]" />
                <span className="font-serif font-bold text-xs text-[#1d3122] dark:text-[#f5f9f6]">
                  Nivasa AI Copilot
                </span>
              </div>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => setMinimized(false)}
                  className="p-1 text-xs text-[#4e6853] hover:text-[#1d3122]"
                  title="Expand"
                >
                  ⤢
                </button>
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="p-1 text-xs text-[#4e6853] hover:text-[#1d3122]"
                  title="Close"
                >
                  ✕
                </button>
              </div>
            </div>
          ) : (
            <div className="h-full relative">
              <RentalCopilot compact={true} onClose={() => setIsOpen(false)} />
            </div>
          )}
        </div>
      )}
    </>
  );
}
