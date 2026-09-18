import { SiteShell } from "@/components/layout/site-shell";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <SiteShell>
      <div className="mx-auto max-w-xl px-5 py-24 text-center">
        <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-bronze">
          404
        </p>
        <h1 className="mt-4 font-serif text-5xl">This page is not in the structure.</h1>
        <div className="mt-8 flex justify-center">
          <Button href="/">Return home</Button>
        </div>
      </div>
    </SiteShell>
  );
}
