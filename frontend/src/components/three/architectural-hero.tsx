"use client";

import dynamic from "next/dynamic";
import { Component, useSyncExternalStore, type ReactNode } from "react";

function useMediaQuery(query: string, defaultValue = false) {
  return useSyncExternalStore(
    (callback) => {
      if (typeof window === "undefined") return () => {};
      const mql = window.matchMedia(query);
      mql.addEventListener("change", callback);
      return () => mql.removeEventListener("change", callback);
    },
    () => (typeof window !== "undefined" ? window.matchMedia(query).matches : defaultValue),
    () => defaultValue,
  );
}

// Error boundary to gracefully catch WebGL context crashes or shader errors
interface ErrorBoundaryProps {
  fallback: ReactNode;
  children: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
}

class CanvasErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.warn("Architectural Canvas WebGL fallback triggered:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback;
    }
    return this.props.children;
  }
}

const ArchitecturalCanvas = dynamic(
  () =>
    import("@/components/three/architectural-canvas").then(
      (mod) => mod.ArchitecturalCanvas,
    ),
  {
    ssr: false,
    loading: () => <HeroFallback label="Assembling structure..." isAssembling />,
  },
);

function HeroFallback({
  label,
  isAssembling = false,
}: {
  label: string;
  isAssembling?: boolean;
}) {
  return (
    <div className="relative flex h-full min-h-[480px] w-full items-end overflow-hidden bg-[#110f0d] p-6 sm:p-10 select-none">
      {/* Background Architectural Blueprint / Grid */}
      <div className="absolute inset-0 opacity-25">
        <svg viewBox="0 0 800 600" className="h-full w-full" preserveAspectRatio="xMidYMid slice">
          <defs>
            <pattern id="archGrid" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#9a7b4f" strokeWidth="0.5" opacity="0.3" />
            </pattern>
          </defs>
          <rect width="800" height="600" fill="url(#archGrid)" />

          {/* Residence Elevation Schematic */}
          <g fill="none" stroke="#c4a574" strokeWidth="1.2">
            {/* Ground datum line */}
            <line x1="80" y1="460" x2="720" y2="460" strokeWidth="1.5" />
            <line x1="60" y1="466" x2="740" y2="466" strokeWidth="0.5" strokeDasharray="4 4" />

            {/* Stepped podium */}
            <rect x="160" y="440" width="480" height="20" strokeWidth="1" />
            <rect x="190" y="420" width="420" height="20" />

            {/* Ground floor massing */}
            <rect x="210" y="300" width="220" height="120" />
            <rect x="430" y="300" width="160" height="120" strokeDasharray="3 3" />

            {/* Living glass corner mullions */}
            <line x1="480" y1="300" x2="480" y2="420" strokeWidth="0.8" />
            <line x1="530" y1="300" x2="530" y2="420" strokeWidth="0.8" />

            {/* Entrance canopy & door */}
            <line x1="380" y1="350" x2="425" y2="350" />
            <rect x="385" y="350" width="40" height="70" />

            {/* Cantilevered upper level */}
            <rect x="180" y="190" width="370" height="110" strokeWidth="1.5" />

            {/* Balcony balustrade */}
            <rect x="370" y="240" width="190" height="60" stroke="#9a7b4f" strokeDasharray="2 2" />
            <line x1="370" y1="240" x2="560" y2="240" stroke="#c4a574" strokeWidth="1.2" />

            {/* Ribbon window */}
            <rect x="200" y="215" width="160" height="55" />
            <line x1="240" y1="215" x2="240" y2="270" strokeWidth="0.8" />
            <line x1="280" y1="215" x2="280" y2="270" strokeWidth="0.8" />
            <line x1="320" y1="215" x2="320" y2="270" strokeWidth="0.8" />

            {/* Overhanging roof & pergola */}
            <line x1="160" y1="185" x2="570" y2="185" strokeWidth="2" />
            <line x1="380" y1="175" x2="380" y2="185" />
            <line x1="420" y1="175" x2="420" y2="185" />
            <line x1="460" y1="175" x2="460" y2="185" />
            <line x1="500" y1="175" x2="500" y2="185" />
            <line x1="540" y1="175" x2="540" y2="185" />

            {/* Dimension & elevation markers */}
            <g stroke="#9a7b4f" strokeWidth="0.6" opacity="0.6">
              <line x1="140" y1="185" x2="140" y2="460" strokeDasharray="2 2" />
              <line x1="135" y1="185" x2="145" y2="185" />
              <line x1="135" y1="460" x2="145" y2="460" />
              <text x="110" y="325" fill="#c4a574" fontSize="10" fontFamily="monospace" transform="rotate(-90 110,325)">
                H: 8.40m
              </text>
            </g>
          </g>
        </svg>
      </div>

      {/* Status Overlay Footer */}
      <div className="relative z-10 flex w-full items-center justify-between border-t border-line/40 pt-4">
        <div className="flex items-center gap-2.5">
          <span
            className={`h-2 w-2 rounded-full ${
              isAssembling ? "bg-blue-500 animate-ping" : "bg-blue-500"
            }`}
          />
          <p className="text-[11px] font-semibold tracking-wider text-blue-500 uppercase">
            {label}
          </p>
        </div>
        <p className="text-[11px] font-medium text-slate-400 hidden sm:block">
          Spatial Habitat · NIVASA Architecture
        </p>
      </div>
    </div>
  );
}

export function ArchitecturalHero() {
  const isClient = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  );
  const reduced = useMediaQuery("(prefers-reduced-motion: reduce)", false);
  const isMobile = useMediaQuery("(max-width: 767px)", false);

  if (!isClient) {
    return <HeroFallback label="Initializing spatial habitat..." isAssembling />;
  }

  if (isMobile || reduced) {
    return (
      <HeroFallback
        label={
          reduced
            ? "NIVASA Elevation · Reduced motion"
            : "Spatial Habitat · Active on desktop viewports"
        }
      />
    );
  }

  return (
    <div className="relative h-full min-h-[500px] w-full bg-[#050a17]">
      <CanvasErrorBoundary
        fallback={
          <HeroFallback label="Spatial schematic · WebGL hardware fallback" />
        }
      >
        <ArchitecturalCanvas reduced={reduced} />
      </CanvasErrorBoundary>

      {/* Modern floating badge */}
      <div className="pointer-events-none absolute bottom-4 right-4 z-10 hidden items-center gap-2 rounded-full border border-white/10 bg-slate-950/75 px-3.5 py-1.5 backdrop-blur-md sm:flex shadow-lg">
        <span className="h-1.5 w-1.5 rounded-full bg-blue-400 animate-pulse" />
        <span className="text-[11px] font-medium tracking-wide text-slate-300">
          NIVASA Habitat · Spatial Orbit
        </span>
      </div>
    </div>
  );
}
