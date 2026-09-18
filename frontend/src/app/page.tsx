import { SiteShell } from "@/components/layout/site-shell";
import { ArchitecturalHero } from "@/components/three/architectural-hero";
import { Button } from "@/components/ui/button";
import { LifecycleStrip } from "@/components/landing/lifecycle-strip";
import { Reveal } from "@/components/motion/reveal";
import { PropertyCard } from "@/components/property/property-card";
import { properties } from "@/data/demo";
import Link from "next/link";

export default function HomePage() {
  return (
    <SiteShell>
      <section className="relative grid min-h-[88vh] items-stretch lg:grid-cols-[1.05fr_0.95fr]">
        <div className="flex flex-col justify-end px-6 py-16 md:px-12 lg:py-24">
          <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-bronze">
            Rental lifecycle, made legible
          </p>
          <h1 className="mt-6 max-w-xl font-serif text-5xl leading-[0.95] md:text-7xl">
            Rent with the full picture in view.
          </h1>
          <p className="mt-6 max-w-md text-base text-ink-soft">
            Nestora connects tenants and owners across discovery, costs,
            documents, and move-in condition — without hiding estimates as facts.
          </p>
          <div className="mt-10 flex flex-wrap gap-3">
            <Button href="/homes">Explore homes</Button>
            <Button href="/register?intent=owner" variant="line">
              List your property
            </Button>
          </div>
        </div>
        <div className="min-h-[420px] border-t border-line lg:border-l lg:border-t-0">
          <ArchitecturalHero />
        </div>
      </section>

      <Reveal className="mx-auto max-w-6xl px-5 py-24">
        <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-ink-soft">
          What Nestora is
        </p>
        <h2 className="mt-4 max-w-3xl font-serif text-4xl md:text-5xl">
          A shared record for a relationship that usually lives in chats,
          PDFs, and memory.
        </h2>
        <p className="mt-6 max-w-2xl text-ink-soft">
          Listings, estimated costs, agreements, bills, and condition notes sit
          in one place. This build is a frontend prototype. Demo listings are
          labelled. No payment is processed.
        </p>
      </Reveal>

      <div className="mx-auto max-w-6xl px-5 pb-24">
        <LifecycleStrip />
      </div>

      <Reveal className="border-y border-line">
        <div className="mx-auto grid max-w-6xl gap-px bg-line md:grid-cols-3">
          {[
            {
              href: "/renttruth/prop-navrang-02",
              kicker: "RentTruth",
              title: "See more than headline rent",
              copy: "Maintenance, utilities, parking, and deposits with source labels.",
            },
            {
              href: "/rental/rent-navrang/passport",
              kicker: "Condition Passport",
              title: "Photograph the home as you found it",
              copy: "Room notes and timestamps. The system does not assign blame.",
            },
            {
              href: "/tenant/roommates",
              kicker: "Roommate matching",
              title: "Share preferences, not guarantees",
              copy: "Compatibility is overlap of stated preferences, not safety.",
            },
          ].map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="bg-paper p-8 transition-colors hover:bg-paper-2"
            >
              <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-bronze">
                {item.kicker}
              </p>
              <h3 className="mt-4 font-serif text-3xl">{item.title}</h3>
              <p className="mt-3 text-sm text-ink-soft">{item.copy}</p>
            </Link>
          ))}
        </div>
      </Reveal>

      <section className="mx-auto max-w-6xl px-5 py-24">
        <div className="mb-10 flex items-end justify-between gap-4">
          <div>
            <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-ink-soft">
              Sample listings
            </p>
            <h2 className="mt-2 font-serif text-4xl">Homes on the board</h2>
          </div>
          <Button href="/homes" variant="line">
            View all
          </Button>
        </div>
        <div className="grid gap-6 md:grid-cols-3">
          {properties.slice(0, 3).map((property) => (
            <PropertyCard key={property.id} property={property} />
          ))}
        </div>
      </section>
    </SiteShell>
  );
}
