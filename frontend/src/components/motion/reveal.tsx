"use client";

import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { useRef } from "react";
import { cn } from "@/lib/cn";

gsap.registerPlugin(useGSAP, ScrollTrigger);

export function Reveal({
  children,
  className,
  delay = 0,
  y = 28,
  x = 0,
  direction = "up",
  duration = 0.85,
}: {
  children: React.ReactNode;
  className?: string;
  delay?: number;
  y?: number;
  x?: number;
  direction?: "up" | "down" | "left" | "right" | "none";
  duration?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add("(prefers-reduced-motion: no-preference)", () => {
        let xOffset = x;
        let yOffset = y;

        if (direction === "up") {
          yOffset = y || 28;
          xOffset = 0;
        } else if (direction === "down") {
          yOffset = -(y || 28);
          xOffset = 0;
        } else if (direction === "left") {
          xOffset = 32;
          yOffset = 0;
        } else if (direction === "right") {
          xOffset = -32;
          yOffset = 0;
        } else if (direction === "none") {
          xOffset = 0;
          yOffset = 0;
        }

        gsap.from(ref.current, {
          x: xOffset,
          y: yOffset,
          autoAlpha: 0,
          delay,
          duration,
          ease: "power3.out",
          scrollTrigger: {
            trigger: ref.current,
            start: "top 88%",
            once: true,
          },
        });
      });
      return () => mm.revert();
    },
    { scope: ref, dependencies: [delay, y, x, direction, duration] },
  );

  return (
    <div ref={ref} className={className}>
      {children}
    </div>
  );
}

export function StaggerIn({
  children,
  className,
  selector = ":scope > *",
  stagger = 0.09,
  y = 24,
}: {
  children: React.ReactNode;
  className?: string;
  selector?: string;
  stagger?: number;
  y?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add("(prefers-reduced-motion: no-preference)", () => {
        const items = gsap.utils.toArray<HTMLElement>(
          ref.current?.querySelectorAll(selector) ?? [],
        );
        if (!items.length) return;
        gsap.from(items, {
          y,
          autoAlpha: 0,
          stagger,
          duration: 0.75,
          ease: "power2.out",
          scrollTrigger: {
            trigger: ref.current,
            start: "top 85%",
            once: true,
          },
        });
      });
      return () => mm.revert();
    },
    { scope: ref, dependencies: [selector, stagger, y] },
  );

  return (
    <div ref={ref} className={cn(className)}>
      {children}
    </div>
  );
}

export function LineReveal({
  className,
  delay = 0,
}: {
  className?: string;
  delay?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add("(prefers-reduced-motion: no-preference)", () => {
        gsap.from(ref.current, {
          scaleX: 0,
          transformOrigin: "left center",
          delay,
          duration: 1.1,
          ease: "power3.inOut",
          scrollTrigger: {
            trigger: ref.current,
            start: "top 90%",
            once: true,
          },
        });
      });
      return () => mm.revert();
    },
    { scope: ref, dependencies: [delay] },
  );

  return <div ref={ref} className={cn("h-px w-full bg-slate-200 dark:bg-slate-800", className)} />;
}
