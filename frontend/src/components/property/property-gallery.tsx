"use client";

import Image from "next/image";
import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";

export function PropertyGallery({ images, title }: { images: string[]; title: string }) {
  const [active, setActive] = useState(0);

  const prev = () => setActive((curr) => (curr > 0 ? curr - 1 : images.length - 1));
  const next = () => setActive((curr) => (curr < images.length - 1 ? curr + 1 : 0));

  return (
    <div className="space-y-3">
      {/* Main Showcase Viewport */}
      <div className="group relative h-[50vh] min-h-[380px] max-h-[560px] w-full overflow-hidden rounded-3xl border border-slate-200/80 dark:border-slate-800 bg-slate-900 shadow-lg">
        <AnimatePresence mode="wait">
          <motion.div
            key={active}
            initial={{ opacity: 0, scale: 1.02 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            className="absolute inset-0"
          >
            <Image
              src={images[active]}
              alt={`${title} photograph ${active + 1}`}
              fill
              className="object-cover"
              priority
              sizes="(max-width: 1200px) 100vw, 1200px"
              unoptimized
            />
          </motion.div>
        </AnimatePresence>

        {/* Gradient shadow overlay for legibility */}
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20" />

        {/* Floating Photo Counter */}
        <div className="absolute top-4 left-4 z-10 rounded-full bg-slate-950/70 backdrop-blur-md px-3.5 py-1 text-xs font-semibold text-white/90 shadow-sm border border-white/10">
          <span>{active + 1}</span>
          <span className="text-white/40 mx-1">/</span>
          <span>{images.length}</span>
        </div>

        {/* Prev / Next Action Arrows */}
        {images.length > 1 ? (
          <>
            <button
              type="button"
              onClick={prev}
              aria-label="Previous photograph"
              className="absolute left-4 top-1/2 -translate-y-1/2 flex h-10 w-10 items-center justify-center rounded-full bg-white/80 dark:bg-slate-950/80 backdrop-blur-md text-slate-800 dark:text-slate-100 opacity-0 group-hover:opacity-100 transition-all hover:scale-110 active:scale-95 shadow-md cursor-pointer"
            >
              <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <button
              type="button"
              onClick={next}
              aria-label="Next photograph"
              className="absolute right-4 top-1/2 -translate-y-1/2 flex h-10 w-10 items-center justify-center rounded-full bg-white/80 dark:bg-slate-950/80 backdrop-blur-md text-slate-800 dark:text-slate-100 opacity-0 group-hover:opacity-100 transition-all hover:scale-110 active:scale-95 shadow-md cursor-pointer"
            >
              <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </>
        ) : null}
      </div>

      {/* Thumbnail Rail */}
      {images.length > 1 ? (
        <div className="flex gap-2.5 overflow-x-auto pb-1 scrollbar-none">
          {images.map((src, index) => (
            <button
              key={src}
              type="button"
              onClick={() => setActive(index)}
              aria-label={`Switch to photograph ${index + 1}`}
              className={`group relative h-16 w-24 shrink-0 overflow-hidden rounded-2xl border-2 transition-all cursor-pointer ${
                index === active
                  ? "border-blue-500 ring-2 ring-blue-500/20 shadow-md"
                  : "border-transparent opacity-60 hover:opacity-100"
              }`}
            >
              <Image src={src} alt="" fill className="object-cover group-hover:scale-105 transition-transform" sizes="96px" />
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}
