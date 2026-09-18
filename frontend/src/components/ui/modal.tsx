"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useEffect } from "react";

export function Modal({
  open,
  title,
  onClose,
  children,
}: {
  open: boolean;
  title: string;
  onClose: () => void;
  children: React.ReactNode;
}) {
  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  return (
    <AnimatePresence>
      {open ? (
        <motion.div
          className="fixed inset-0 z-50 flex items-end justify-center bg-[#1a281f]/60 backdrop-blur-xs p-4 sm:items-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-labelledby="modal-title"
            initial={{ scale: 0.95, opacity: 0, y: 16 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: 16 }}
            transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
            className="w-full max-w-lg rounded-3xl border border-[#e3dfd5] dark:border-[#2a3f31] bg-[#fdfcf7]/95 dark:bg-[#152219]/95 p-6 sm:p-7 shadow-2xl backdrop-blur-xl"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex items-center justify-between gap-4 pb-4 border-b border-[#efeae0] dark:border-[#2a3f31]/80">
              <h2 id="modal-title" className="text-xl font-bold tracking-tight text-[#1a281f] dark:text-[#f5f9f6]">
                {title}
              </h2>
              <button
                type="button"
                className="flex h-8 w-8 items-center justify-center rounded-full bg-[#f3efe6] dark:bg-[#1d2d22] text-[#4a5e50] hover:text-[#1a281f] dark:text-[#a5b8aa] dark:hover:text-[#f5f9f6] hover:bg-[#eae4d7] transition-colors cursor-pointer"
                onClick={onClose}
                aria-label="Close modal"
              >
                <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="mt-5">{children}</div>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
