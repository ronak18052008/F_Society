import { NivasaLogo } from "@/components/brand/nivasa-logo";
import Link from "next/link";

export function Footer() {
  return (
    <footer className="border-t border-[var(--border)] bg-[var(--bg-canvas)]/90 backdrop-blur-xl text-[var(--text-main)]">
      <div className="wrap grid gap-12 py-16 sm:py-20 md:grid-cols-12 lg:gap-10">
        {/* Brand & Manifesto */}
        <div className="md:col-span-5 lg:col-span-4 space-y-5">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-tr from-[var(--accent-forest)] to-[var(--accent-forest-hover)] text-white shadow-md shadow-[var(--accent-forest)]/20">
              <span className="font-serif font-bold text-lg tracking-tight">N</span>
            </div>
            <span className="font-sans text-2xl font-bold tracking-tight">Nivasa</span>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-[var(--primary-pista)]/15 px-2.5 py-0.5 text-[11px] font-semibold text-[var(--text-main)]">
              Verified Living
            </span>
          </div>
          <p className="text-sm leading-relaxed text-[var(--text-muted)] max-w-sm">
            A modern verified rental ecosystem connecting residents and property owners through transparent RentTruth™ itemization, shared condition passports, and direct workspaces.
          </p>
          <div className="flex items-center gap-3 pt-2">
            <span className="flex h-2.5 w-2.5 rounded-full bg-[var(--success)] shadow-[0_0_8px_var(--success)]" />
            <span className="text-xs font-medium text-[var(--text-muted)]">
              Supabase Verified Database &amp; Realtime Active
            </span>
          </div>
        </div>

        {/* Column: Discover */}
        <div className="space-y-4 md:col-span-3 lg:col-span-3 text-sm">
          <p className="text-xs font-bold uppercase tracking-wider text-[var(--text-faint)]">
            Platform Discovery
          </p>
          <ul className="space-y-2.5">
            <li>
              <Link className="text-[var(--text-muted)] transition-colors hover:text-[var(--accent-forest)]" href="/homes">
                Explore residences
              </Link>
            </li>
            <li>
              <Link className="text-[var(--text-muted)] transition-colors hover:text-[var(--accent-forest)]" href="/how-it-works">
                Verified rental lifecycle
              </Link>
            </li>
            <li>
              <Link className="text-[var(--text-muted)] transition-colors hover:text-[var(--accent-forest)]" href="/renttruth/prop-navrang-02">
                RentTruth™ expense auditor
              </Link>
            </li>
            <li>
              <Link className="text-[var(--text-muted)] transition-colors hover:text-[var(--accent-forest)]" href="/rental/rent-navrang/passport">
                Digital Condition Passport
              </Link>
            </li>
            <li>
              <Link className="text-[var(--text-muted)] transition-colors hover:text-[var(--accent-forest)]" href="/ai/agreement">
                AI Agreement analyzer
              </Link>
            </li>
          </ul>
        </div>

        {/* Column: Workspace & Accounts */}
        <div className="space-y-4 md:col-span-2 lg:col-span-2 text-sm">
          <p className="text-xs font-bold uppercase tracking-wider text-[var(--text-faint)]">
            Workspaces
          </p>
          <ul className="space-y-2.5">
            <li>
              <Link className="text-[var(--text-muted)] transition-colors hover:text-[var(--accent-forest)]" href="/login">
                Member sign in
              </Link>
            </li>
            <li>
              <Link className="text-[var(--text-muted)] transition-colors hover:text-[var(--accent-forest)]" href="/register">
                Register account
              </Link>
            </li>
            <li>
              <Link className="text-[var(--text-muted)] transition-colors hover:text-[var(--accent-forest)]" href="/profile">
                My Profile &amp; settings
              </Link>
            </li>
            <li>
              <Link className="text-[var(--text-muted)] transition-colors hover:text-[var(--accent-forest)]" href="/owner/properties/new">
                List your property
              </Link>
            </li>
            <li>
              <Link className="text-[var(--text-muted)] transition-colors hover:text-[var(--accent-forest)]" href="/tenant/roommates">
                Roommate matching
              </Link>
            </li>
            <li>
              <Link className="text-[var(--text-muted)] transition-colors hover:text-[var(--accent-forest)]" href="/ai/recommend">
                Ask Nivasa AI
              </Link>
            </li>
          </ul>
        </div>

        {/* Column: Tenancy Principles */}
        <div className="space-y-4 md:col-span-2 lg:col-span-3 text-sm">
          <p className="text-xs font-bold uppercase tracking-wider text-[var(--text-faint)]">
            Tenancy Standards
          </p>
          <ul className="space-y-2.5 text-xs text-[var(--text-muted)] leading-relaxed">
            <li className="flex items-start gap-2.5">
              <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[var(--primary-pista)]/15 text-[10px] font-bold text-[var(--text-main)]">
                01
              </span>
              <span><strong>Total cost clarity:</strong> Headline rent published alongside maintenance, utilities &amp; security deposit.</span>
            </li>
            <li className="flex items-start gap-2.5">
              <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[var(--secondary-sage)]/20 text-[10px] font-bold text-[var(--text-main)]">
                02
              </span>
              <span><strong>Immutable passports:</strong> Move-in condition logged jointly to safeguard security deposits.</span>
            </li>
            <li className="flex items-start gap-2.5">
              <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[var(--primary-pista)]/20 text-[10px] font-bold text-[var(--text-main)]">
                03
              </span>
              <span><strong>Direct interaction:</strong> Zero broker intermediaries distorting lease negotiations.</span>
            </li>
          </ul>
        </div>
      </div>

      {/* Bottom Sub-bar */}
      <div className="border-t border-[var(--border)]/80 py-6">
        <div className="wrap flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[var(--text-muted)]">
          <div className="flex items-center gap-3">
            <span>© {new Date().getFullYear()} Nivasa. All rights reserved.</span>
          </div>
          <div className="flex items-center gap-6">
            <span>Verified Residential Living</span>
            <a
              href="#main"
              className="font-medium text-[var(--text-main)] hover:text-[var(--primary-pista)] transition-colors"
            >
              Back to top ↑
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
