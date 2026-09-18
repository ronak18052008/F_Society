"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useNivasa } from "@/store/nivasa-store";

export function ToastViewport() {
  const { toasts, dismissToast } = useNivasa();
  return (
    <div className="pointer-events-none fixed bottom-6 right-6 z-50 flex w-[min(92vw,360px)] flex-col gap-2.5">
      <AnimatePresence>
        {toasts.map((toast) => (
          <motion.button
            key={toast.id}
            type="button"
            layout
            initial={{ opacity: 0, y: 16, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="pointer-events-auto flex items-start gap-3 rounded-2xl border border-[#e3dfd5] dark:border-[#2a3f31] bg-[#fdfcf7]/95 dark:bg-[#152219]/95 p-4 text-left shadow-xl shadow-black/10 backdrop-blur-xl hover:scale-[1.02] active:scale-[0.98] transition-transform cursor-pointer"
            onClick={() => dismissToast(toast.id)}
          >
            <div className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#6e9271]/15 text-[#6e9271] dark:bg-[#8fb893]/20 dark:text-[#8fb893]">
              <svg className="h-3 w-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <p className="flex-1 text-xs font-medium text-[#1a281f] dark:text-[#f5f9f6] leading-relaxed">
              {toast.message}
            </p>
          </motion.button>
        ))}
      </AnimatePresence>
    </div>
  );
}
