"use client";

import { useEffect, useState } from "react";
import { NivasaIconMark } from "@/components/brand/nivasa-logo";
import { cn } from "@/lib/cn";

const SPLASH_STORAGE_KEY = "nivasa_splash_v1_seen";

export function NivasaSplash() {
  const [mounted, setMounted] = useState(false);
  const [visible, setVisible] = useState(false);
  const [stage, setStage] = useState<"initial" | "logoIn" | "brandIn" | "fadeOut" | "done">("initial");

  useEffect(() => {
    setMounted(true);

    // 1. Respect prefers-reduced-motion
    if (typeof window !== "undefined") {
      const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      if (prefersReducedMotion) {
        setStage("done");
        return;
      }

      // 2. Check if already shown in this browser session
      try {
        const alreadyShown = sessionStorage.getItem(SPLASH_STORAGE_KEY);
        if (alreadyShown) {
          setStage("done");
          return;
        }
        sessionStorage.setItem(SPLASH_STORAGE_KEY, "true");
      } catch {
        // Fallback for restricted storage environments
      }
    }

    // 3. Initiate animation sequence
    setVisible(true);

    // Stage 1: Logo fades in & scales gently
    const t1 = setTimeout(() => {
      setStage("logoIn");
    }, 40);

    // Stage 2: Brand name and tagline fade in
    const t2 = setTimeout(() => {
      setStage("brandIn");
    }, 400);

    // Stage 3: Smoothly fade out into the main application
    const t3 = setTimeout(() => {
      setStage("fadeOut");
    }, 1100);

    // Stage 4: Unmount completely after fade-out transition
    const t4 = setTimeout(() => {
      setVisible(false);
      setStage("done");
    }, 1450);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
      clearTimeout(t4);
    };
  }, []);

  if (!mounted || !visible || stage === "done") {
    return null;
  }

  return (
    <aside
      aria-label="Nivasa startup presentation"
      className={cn(
        "fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-[#faf7f0] transition-opacity duration-350 ease-out pointer-events-auto",
        stage === "fadeOut" && "opacity-0 pointer-events-none"
      )}
    >
      <div className="flex flex-col items-center justify-center text-center p-6 max-w-sm mx-auto">
        {/* Animated House Roof & Ribbon Mark */}
        <div
          className={cn(
            "transform transition-all duration-600 ease-out",
            stage === "initial" && "opacity-0 scale-90 translate-y-3",
            (stage === "logoIn" || stage === "brandIn" || stage === "fadeOut") &&
              "opacity-100 scale-100 translate-y-0"
          )}
        >
          <div className="relative flex items-center justify-center p-4 rounded-3xl bg-white/80 shadow-xl shadow-[#7ca982]/10 border border-[#e5dfc5]">
            <NivasaIconMark size={72} />
          </div>
        </div>

        {/* Wordmark and Tagline */}
        <div
          className={cn(
            "mt-5 flex flex-col items-center transition-all duration-500 ease-out",
            (stage === "initial" || stage === "logoIn") && "opacity-0 translate-y-2",
            (stage === "brandIn" || stage === "fadeOut") && "opacity-100 translate-y-0"
          )}
        >
          <h1 className="font-sans text-3xl sm:text-4xl font-black tracking-tight text-[#192734]">
            Nivasã
          </h1>
          <p className="mt-1.5 text-xs sm:text-sm font-medium text-[#5b6c7a] tracking-wide">
            Rent with clarity. Live with confidence.
          </p>

          {/* Minimalist sleek loading indicator */}
          <div className="mt-6 flex items-center gap-1.5">
            <span className="h-1.5 w-6 rounded-full bg-[#7ca982] animate-pulse" />
            <span className="h-1.5 w-1.5 rounded-full bg-[#96bd9b]" />
            <span className="h-1.5 w-1.5 rounded-full bg-[#e5dfc5]" />
          </div>
        </div>
      </div>
    </aside>
  );
}
