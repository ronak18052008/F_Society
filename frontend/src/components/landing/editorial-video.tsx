"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { Reveal } from "@/components/motion/reveal";
import { cn } from "@/lib/cn";

/**
 * ============================================================================
 * LOCAL VIDEO ASSET INSTRUCTIONS:
 * ============================================================================
 * To provide a custom walkthrough video for NIVASA:
 * 1. Place your MP4 or WebM video inside: `frontend/public/videos/nivasa-walkthrough.mp4`
 * 2. Pass `src="/videos/nivasa-walkthrough.mp4"` to this `<EditorialVideo />` component.
 * 3. In the absence of a local video file, this component automatically renders
 *    a high-resolution architectural poster state with fallback indicators,
 *    preventing broken players or third-party 404 CDN errors.
 * ============================================================================
 */

interface EditorialVideoProps {
  src?: string;
  poster?: string;
  title?: string;
  subtitle?: string;
  caption?: string;
}

export function EditorialVideo({
  src,
  poster = "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1800&q=85",
  title = "Inside the F_Society Living Experience",
  subtitle = "Spatial walkthrough & verified tenancy documentation",
  caption = "A walkthrough of mutual check-in documentation, unbundled cost calculations, and shared tenancy agreements.",
}: EditorialVideoProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [isMuted, setIsMuted] = useState(true);

  const togglePlay = () => {
    if (!videoRef.current || !src || hasError) return;

    if (isPlaying) {
      videoRef.current.pause();
      setIsPlaying(false);
    } else {
      videoRef.current
        .play()
        .then(() => setIsPlaying(true))
        .catch(() => {
          setHasError(true);
          setIsPlaying(false);
        });
    }
  };

  const toggleMute = () => {
    if (!videoRef.current) return;
    videoRef.current.muted = !isMuted;
    setIsMuted(!isMuted);
  };

  return (
    <section className="section bg-paper">
      <div className="wrap">
        <Reveal>
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-10">
            <div>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-[#6E9271]/15 px-3.5 py-1 text-xs font-semibold text-[#6E9271] dark:text-[#A3B899] border border-[#6E9271]/30">
                Visual Experience
              </span>
              <h2 className="display mt-3 text-3xl sm:text-4xl md:text-5xl font-serif font-bold tracking-tight text-ink">
                {title}
              </h2>
            </div>
            <p className="text-sm sm:text-base text-ink-muted max-w-md">
              {subtitle}
            </p>
          </div>
        </Reveal>

        <Reveal delay={0.15}>
          <div className="relative aspect-video w-full overflow-hidden rounded-3xl border border-line bg-[#060c18] shadow-card group">
            {/* Video element */}
            {src && !hasError ? (
              <video
                ref={videoRef}
                src={src}
                poster={poster}
                className="h-full w-full object-cover"
                playsInline
                muted={isMuted}
                loop
                onError={() => setHasError(true)}
                onEnded={() => setIsPlaying(false)}
              />
            ) : (
              /* High-fidelity Architectural Poster Fallback */
              <div className="relative h-full w-full">
                <Image
                  src={poster}
                  alt="Modern residential living architecture"
                  fill
                  className="object-cover opacity-85 filter brightness-95 transition-transform duration-700 group-hover:scale-102"
                  sizes="(max-width: 1200px) 100vw, 1200px"
                  unoptimized
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
              </div>
            )}

            {/* Play Overlay / Action Controls */}
            <div className="absolute inset-0 flex flex-col justify-between p-6 sm:p-10 pointer-events-none">
              <div className="flex items-center justify-between">
                <span className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-black/60 px-3.5 py-1 text-xs font-semibold text-white/90 backdrop-blur-md">
                  <span className="h-1.5 w-1.5 rounded-full bg-[#6E9271] animate-pulse" />
                  {src && !hasError ? "Walkthrough Film" : "Spatial Showcase · Verified Preview"}
                </span>

                {src && !hasError && isPlaying && (
                  <button
                    type="button"
                    onClick={toggleMute}
                    className="pointer-events-auto rounded-full border border-white/20 bg-black/60 px-3 py-1 text-xs font-medium text-white hover:bg-black/80 backdrop-blur-md cursor-pointer"
                  >
                    {isMuted ? "Unmute" : "Mute"}
                  </button>
                )}
              </div>

              {/* Center Play Button Trigger */}
              <div className="flex items-center justify-center">
                <button
                  type="button"
                  onClick={togglePlay}
                  className={cn(
                    "pointer-events-auto flex h-16 w-16 sm:h-20 sm:w-20 items-center justify-center rounded-full border border-white/40 bg-[#7ca982]/95 text-white backdrop-blur-md shadow-xl transition-all duration-300",
                    "hover:scale-110 hover:bg-[#6b9a71] hover:shadow-[#7ca982]/35 focus-visible:ring-2 focus-visible:ring-[#7ca982] focus-visible:outline-none cursor-pointer",
                    isPlaying && "opacity-0 group-hover:opacity-100",
                  )}
                  aria-label={isPlaying ? "Pause video walkthrough" : "Play video walkthrough"}
                >
                  {isPlaying ? (
                    <svg className="h-6 w-6 fill-current" viewBox="0 0 24 24">
                      <rect x="6" y="4" width="4" height="16" rx="1" />
                      <rect x="14" y="4" width="4" height="16" rx="1" />
                    </svg>
                  ) : (
                    <svg className="h-7 w-7 fill-current translate-x-0.5" viewBox="0 0 24 24">
                      <path d="M8 5v14l11-7z" />
                    </svg>
                  )}
                </button>
              </div>

              {/* Bottom Caption */}
              <div className="flex items-end justify-between text-xs text-white/80">
                <p className="max-w-md line-clamp-1">{caption}</p>
                <span className="rounded-full bg-black/50 px-2.5 py-0.5 backdrop-blur-sm text-[11px]">
                  F_Society Cinema
                </span>
              </div>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
