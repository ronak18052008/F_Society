import Link from "next/link";

export function Footer() {
  return (
    <footer className="border-t border-line bg-paper text-ink">
      <div className="wrap grid gap-12 py-16 sm:py-20 md:grid-cols-12 lg:gap-8">
        {/* Brand & Manifesto */}
        <div className="md:col-span-5 lg:col-span-4 space-y-4">
          <div className="flex items-baseline gap-2.5">
            <span className="font-serif text-3xl tracking-tight">Nestora</span>
            <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-bronze">
              v0.1 Prototype
            </span>
          </div>
          <p className="lede text-sm text-ink-soft max-w-sm">
            A rental lifecycle platform connecting tenants and owners across
            discovery, verifiable costs, mutual agreements, and move-in condition.
          </p>
          <div className="pt-2">
            <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-ink-soft">
              Prototype Environment
            </p>
            <p className="mt-1 text-xs text-ink-soft/80 leading-relaxed max-w-xs">
              All listings, passports, and records are demo data stored locally in your browser. No payments are processed.
            </p>
          </div>
        </div>

        {/* Column: Lifecycle & Product */}
        <div className="space-y-3 md:col-span-3 lg:col-span-3 text-sm">
          <p className="kicker-bronze">Explore Lifecycle</p>
          <ul className="space-y-2">
            <li>
              <Link className="text-ink-soft transition-colors hover:text-ink hover:underline underline-offset-4" href="/homes">
                Browse homes
              </Link>
            </li>
            <li>
              <Link className="text-ink-soft transition-colors hover:text-ink hover:underline underline-offset-4" href="/how-it-works">
                8-step rental lifecycle
              </Link>
            </li>
            <li>
              <Link className="text-ink-soft transition-colors hover:text-ink hover:underline underline-offset-4" href="/renttruth/prop-navrang-02">
                RentTruth cost breakdown
              </Link>
            </li>
            <li>
              <Link className="text-ink-soft transition-colors hover:text-ink hover:underline underline-offset-4" href="/rental/rent-navrang/passport">
                Condition Passport
              </Link>
            </li>
            <li>
              <Link className="text-ink-soft transition-colors hover:text-ink hover:underline underline-offset-4" href="/ai/agreement">
                Agreement analyzer
              </Link>
            </li>
          </ul>
        </div>

        {/* Column: Workspaces */}
        <div className="space-y-3 md:col-span-2 lg:col-span-2 text-sm">
          <p className="kicker-bronze">Workspace</p>
          <ul className="space-y-2">
            <li>
              <Link className="text-ink-soft transition-colors hover:text-ink hover:underline underline-offset-4" href="/login">
                Sign in
              </Link>
            </li>
            <li>
              <Link className="text-ink-soft transition-colors hover:text-ink hover:underline underline-offset-4" href="/register">
                Create account
              </Link>
            </li>
            <li>
              <Link className="text-ink-soft transition-colors hover:text-ink hover:underline underline-offset-4" href="/owner/properties/new">
                List a home
              </Link>
            </li>
            <li>
              <Link className="text-ink-soft transition-colors hover:text-ink hover:underline underline-offset-4" href="/tenant/roommates">
                Roommate matching
              </Link>
            </li>
            <li>
              <Link className="text-ink-soft transition-colors hover:text-ink hover:underline underline-offset-4" href="/ai/recommend">
                Ask Nestora AI
              </Link>
            </li>
          </ul>
        </div>

        {/* Column: Architectural Principles */}
        <div className="space-y-3 md:col-span-2 lg:col-span-3 text-sm">
          <p className="kicker-bronze">Principles</p>
          <ul className="space-y-2 text-xs text-ink-soft leading-relaxed">
            <li className="flex items-start gap-2">
              <span className="text-bronze font-mono">01</span>
              <span>Truth before conversion: headline rent sits beside true costs.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-bronze font-mono">02</span>
              <span>Mutual records: move-in condition is logged together, not contested later.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-bronze font-mono">03</span>
              <span>Local sovereignty: prototype records remain on device.</span>
            </li>
          </ul>
        </div>
      </div>

      {/* Bottom Sub-bar */}
      <div className="border-t border-line py-6">
        <div className="wrap flex flex-col sm:flex-row items-center justify-between gap-4 font-mono text-[11px] text-ink-soft">
          <div className="flex items-center gap-3">
            <span className="inline-block h-1.5 w-1.5 rounded-full bg-ok" />
            <span>Nestora Prototype · Architectural Rental System</span>
          </div>
          <div className="flex items-center gap-6">
            <span>23°01&apos;N 72°34&apos;E</span>
            <a
              href="#top"
              className="uppercase tracking-[0.14em] text-bronze hover:underline underline-offset-2"
            >
              Back to top ↑
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
