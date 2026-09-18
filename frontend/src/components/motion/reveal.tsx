"use client";

import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { useRef } from "react";

gsap.registerPlugin(useGSAP, ScrollTrigger);

export function Reveal({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add(
        {
          reduceMotion: "(prefers-reduced-motion: reduce)",
          motion: "(prefers-reduced-motion: no-preference)",
        },
        (context) => {
          const { reduceMotion } = context.conditions as { reduceMotion: boolean };
          if (reduceMotion) return;
          gsap.from(ref.current, {
            y: 28,
            autoAlpha: 0,
            duration: 0.9,
            ease: "power3.out",
            scrollTrigger: {
              trigger: ref.current,
              start: "top 86%",
            },
          });
        },
      );
      return () => mm.revert();
    },
    { scope: ref },
  );

  return (
    <div ref={ref} className={className}>
      {children}
    </div>
  );
}
