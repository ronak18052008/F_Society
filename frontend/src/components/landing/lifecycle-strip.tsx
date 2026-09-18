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
    <div ref={ref} className="grid gap-px bg-line md:grid-cols-4">
      {stages.map((stage) => (
        <article key={stage.n} className="stage bg-paper p-6">
          <p className="font-mono text-[11px] text-bronze">{stage.n}</p>
          <h3 className="mt-4 font-serif text-3xl">{stage.title}</h3>
          <p className="mt-3 text-sm text-ink-soft">{stage.copy}</p>
        </article>
      ))}
    </div>
  );
}
