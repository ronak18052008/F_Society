import { SiteShell } from "@/components/layout/site-shell";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <SiteShell>
      <div className="mx-auto max-w-xl px-5 py-28 text-center">
        <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-500/10 text-blue-600 dark:text-blue-400">
          <span className="text-2xl font-black">404</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-slate-900 dark:text-white">
          Dwelling not found
        </h1>
        <p className="mx-auto mt-3 max-w-md text-sm text-slate-500 dark:text-slate-400">
          The sanctuary or route you are looking for has been relocated, archived, or is currently unavailable.
        </p>
        <div className="mt-8 flex items-center justify-center gap-3">
          <Button href="/">Return to sanctuary</Button>
          <Button href="/homes" variant="secondary">Browse residences</Button>
        </div>
      </div>
    </SiteShell>
  );
}
