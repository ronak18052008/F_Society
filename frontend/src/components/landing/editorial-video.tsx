"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { Reveal } from "@/components/motion/reveal";
import { cn } from "@/lib/cn";

/**
 * ============================================================================
 * LOCAL VIDEO ASSET INSTRUCTIONS:
 * ============================================================================
 * To provide a custom walkthrough video for Nestora:
 * 1. Place your MP4 or WebM video inside: `frontend/public/videos/nestora-walkthrough.mp4`
 * 2. Pass `src="/videos/nestora-walkthrough.mp4"` to this `<EditorialVideo />` component.
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
  src, // e.g. "/videos/nestora-walkthrough.mp4"
  poster = "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1800&q=85",
  title = "Inside the Nestora Experience",
  subtitle = "Architectural walkthrough & rental verification workflow",
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
    <section className="section-lg border-t border-line bg-paper text-ink">
      <div className="wrap">
        <Reveal>
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-10">
            <div>
              <p className="kicker-bronze">Visual Walkthrough</p>
              <h2 className="display mt-3 text-3xl sm:text-4xl md:text-5xl tracking-tight">
                {title}
              </h2>
            </div>
            <p className="lede text-sm sm:text-base text-ink-soft max-w-md">
              {subtitle}
            </p>
          </div>
        </Reveal>

        <Reveal delay={0.15}>
          <div className="relative aspect-video w-full overflow-hidden border border-line bg-[#12100d] shadow-2xl group">
            {/* Video element (renders only if valid source provided & no error) */}
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
                  alt="Architectural modern residential home"
                  fill
                  className="object-cover opacity-80 filter brightness-90 transition-transform duration-700 group-hover:scale-102"
                  sizes="(max-width: 1200px) 100vw, 1200px"
                  unoptimized
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
              </div>
            )}

            {/* Play Overlay / Action Controls */}
            <div className="absolute inset-0 flex flex-col justify-between p-6 sm:p-10 pointer-events-none">
              <div className="flex items-center justify-between">
                <span className="inline-flex items-center gap-2 border border-white/20 bg-black/60 px-3 py-1 font-mono text-[10px] uppercase tracking-[0.2em] text-white/90 backdrop-blur-md">
                  <span className="h-1.5 w-1.5 rounded-full bg-bronze" />
                  {src && !hasError ? "Walkthrough Film" : "Architectural Showcase · Demo Preview"}
                </span>

                {src && !hasError && isPlaying && (
                  <button
                    type="button"
                    onClick={toggleMute}
                    className="pointer-events-auto border border-white/20 bg-black/60 px-3 py-1 font-mono text-[10px] uppercase tracking-wider text-white hover:bg-black/80 backdrop-blur-md"
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
                    "pointer-events-auto flex h-16 w-16 sm:h-20 sm:w-20 items-center justify-center rounded-full border border-white/40 bg-black/50 text-white backdrop-blur-md transition-all duration-300",
                    "hover:scale-110 hover:border-bronze hover:bg-black/75 hover:text-bronze focus-visible:ring-2 focus-visible:ring-bronze focus-visible:outline-none",
                    isPlaying && "opacity-0 group-hover:opacity-100",
                  )}
                  aria-label={isPlaying ? "Pause video walkthrough" : "Play video walkthrough"}
                >
                  {isPlaying ? (
                    <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                      <rect x="6" y="4" width="4" height="16" />
                      <rect x="14" y="4" width="4" height="16" />
                    </svg>
                  ) : (
                    <svg className="h-7 w-7 ml-1" fill="currentColor" viewBox="0 0 24 24">
                      <polygon points="5,3 19,12 5,21" />
                    </svg>
                  )}
                </button>
              </div>

              {/* Bottom Caption Bar */}
              <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 text-white/90">
                <p className="max-w-xl text-xs sm:text-sm font-sans tracking-wide drop-shadow-sm">
                  {caption}
                </p>
                <span className="font-mono text-[10px] uppercase tracking-[0.16em] text-white/60">
                  {src && !hasError ? "4K Architectural Reel" : "Local asset placeholder: /public/videos/"}
                </span>
              </div>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
