"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";

const ArchitecturalCanvas = dynamic(
  () =>
    import("@/components/three/architectural-canvas").then(
      (mod) => mod.ArchitecturalCanvas,
    ),
  { ssr: false, loading: () => <HeroFallback label="Assembling structure" /> },
);

function HeroFallback({ label }: { label: string }) {
  return (
    <div className="relative flex h-full items-end overflow-hidden bg-[#12100d] p-8">
      <div className="absolute inset-0 opacity-40">
        <svg viewBox="0 0 800 600" className="h-full w-full">
          <g fill="none" stroke="#c4a574" strokeWidth="1">
            <rect x="220" y="280" width="360" height="140" />
            <rect x="250" y="190" width="300" height="90" />
            <line x1="250" y1="420" x2="250" y2="190" />
            <line x1="550" y1="420" x2="550" y2="190" />
            <line x1="80" y1="460" x2="720" y2="460" />
          </g>
        </svg>
      </div>
      <p className="relative font-mono text-[11px] uppercase tracking-[0.2em] text-[#c4a574]">
        {label}
      </p>
    </div>
  );
}

export function ArchitecturalHero() {
  const [allow3d, setAllow3d] = useState(false);
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    const motion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const mobile = window.matchMedia("(max-width: 767px)");
    const update = () => {
      setReduced(motion.matches);
      setAllow3d(!motion.matches && !mobile.matches);
    };
    update();
    motion.addEventListener("change", update);
    mobile.addEventListener("change", update);
    return () => {
      motion.removeEventListener("change", update);
      mobile.removeEventListener("change", update);
    };
  }, []);

  if (!allow3d) {
    return (
      <HeroFallback
        label={
          reduced
            ? "Static architectural plan · reduced motion"
            : "Plan drawing · 3D reserved for larger screens"
        }
      />
    );
  }

  return (
    <div className="h-full min-h-[520px]">
      <ArchitecturalCanvas reduced={reduced} />
    </div>
  );
}
