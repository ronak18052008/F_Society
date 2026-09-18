"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useNestora } from "@/store/nestora-store";

export function ToastViewport() {
  const { toasts, dismissToast } = useNestora();
  return (
    <div className="pointer-events-none fixed bottom-6 right-6 z-50 flex w-[min(92vw,360px)] flex-col gap-2">
      <AnimatePresence>
        {toasts.map((toast) => (
          <motion.button
            key={toast.id}
            type="button"
            layout
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 8 }}
            className="pointer-events-auto border border-line bg-paper-2 px-4 py-3 text-left text-sm text-ink shadow-[var(--shadow)]"
            onClick={() => dismissToast(toast.id)}
          >
            {toast.message}
          </motion.button>
        ))}
      </AnimatePresence>
    </div>
  );
}
