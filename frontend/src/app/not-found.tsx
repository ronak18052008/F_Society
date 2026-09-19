import { SiteShell } from "@/components/layout/site-shell";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <SiteShell>
      <div className="mx-auto max-w-xl px-5 py-28 text-center">
        <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-[var(--primary-pista-subtle)] text-[var(--primary-pista-hover)] border border-[var(--border-subtle)]">
          <span className="text-2xl font-serif font-bold">404</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-serif font-bold tracking-tight text-[var(--text-main)]">
          Page Not Found
        </h1>
        <p className="mx-auto mt-3 max-w-md text-sm text-[var(--text-muted)]">
          The property, workspace, or resource you are looking for has been relocated, archived, or is currently unavailable.
        </p>
        <div className="mt-8 flex items-center justify-center gap-3">
          <Button href="/">Return Home</Button>
          <Button href="/homes" variant="outline">Browse Residences</Button>
        </div>
      </div>
    </SiteShell>
  );
}
