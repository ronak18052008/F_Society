"use client";

import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { useRef } from "react";

gsap.registerPlugin(useGSAP, ScrollTrigger);

const stages = [
  { n: "01", title: "Discover", copy: "Search with rent, locality, and living pattern." },
  { n: "02", title: "Compare", copy: "Read RentTruth so monthly costs sit beside headline rent." },
  { n: "03", title: "Connect", copy: "Enquire with the owner. Nothing is sent outside this prototype." },
  { n: "04", title: "Record", copy: "Keep agreements, bills, and move-in condition in one workspace." },
];

export function LifecycleStrip() {
  const ref = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add("(prefers-reduced-motion: no-preference) and (min-width: 768px)", () => {
        const cards = gsap.utils.toArray<HTMLElement>(".stage");
        gsap.from(cards, {
          x: 40,
          autoAlpha: 0,
          stagger: 0.12,
          duration: 0.8,
          ease: "power2.out",
          scrollTrigger: { trigger: ref.current, start: "top 75%" },
        });
      });
      return () => mm.revert();
    },
    { scope: ref },
  );

  return (
    <div ref={ref} className="grid gap-4 sm:grid-cols-2 md:grid-cols-4">
      {stages.map((stage) => (
        <article key={stage.n} className="stage rounded-3xl border border-slate-200/80 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 p-6 shadow-sm backdrop-blur-sm">
          <p className="text-xs font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400">{stage.n}</p>
          <h3 className="mt-3 text-lg font-bold text-slate-900 dark:text-white">{stage.title}</h3>
          <p className="mt-2 text-xs text-slate-500 dark:text-slate-400 leading-relaxed">{stage.copy}</p>
        </article>
      ))}
    </div>
  );
}
