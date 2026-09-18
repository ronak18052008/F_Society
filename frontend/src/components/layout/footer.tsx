import { NivasaLogo } from "@/components/brand/nivasa-logo";
import Link from "next/link";

export function Footer() {
  return (
    <footer className="border-t border-[#e5dfc5] dark:border-[#2a3f31] bg-[#faf7f0]/90 dark:bg-[#142018]/80 backdrop-blur-xl text-[#1d3122] dark:text-[#f5f9f6]">
      <div className="wrap grid gap-12 py-16 sm:py-20 md:grid-cols-12 lg:gap-10">
        {/* Brand & Manifesto */}
        <div className="md:col-span-5 lg:col-span-4 space-y-5">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-tr from-[#7ca982] to-[#5c8e63] text-white shadow-md shadow-[#7ca982]/20">
              <span className="font-serif font-bold text-lg tracking-tight">F</span>
            </div>
            <span className="font-sans text-2xl font-bold tracking-tight">Nivasa</span>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-[#7ca982]/15 px-2.5 py-0.5 text-[11px] font-semibold text-[#23452b] dark:text-[#8fb893]">
              Verified Living
            </span>
          </div>
          <p className="text-sm leading-relaxed text-[#4e6853] dark:text-[#a5b8aa] max-w-sm">
            A modern verified rental ecosystem connecting residents and property owners through transparent RentTruth™ itemization, shared condition passports, and direct workspaces.
          </p>
          <div className="flex items-center gap-3 pt-2">
            <span className="flex h-2.5 w-2.5 rounded-full bg-[#4e9b5f] shadow-[0_0_8px_rgba(78,155,95,0.7)]" />
            <span className="text-xs font-medium text-[#4e6853] dark:text-[#a5b8aa]">
              Supabase Verified Database & Realtime Active
            </span>
          </div>
        </div>

        {/* Column: Discover */}
        <div className="space-y-4 md:col-span-3 lg:col-span-3 text-sm">
          <p className="text-xs font-bold uppercase tracking-wider text-[#7d9782] dark:text-[#6e8272]">
            Platform Discovery
          </p>
          <ul className="space-y-2.5">
            <li>
              <Link className="text-[#4e6853] transition-colors hover:text-[#57875d] dark:text-[#a5b8aa] dark:hover:text-[#8fb893]" href="/homes">
                Explore residences
              </Link>
            </li>
            <li>
              <Link className="text-[#4e6853] transition-colors hover:text-[#57875d] dark:text-[#a5b8aa] dark:hover:text-[#8fb893]" href="/how-it-works">
                Verified rental lifecycle
              </Link>
            </li>
            <li>
              <Link className="text-[#4e6853] transition-colors hover:text-[#57875d] dark:text-[#a5b8aa] dark:hover:text-[#8fb893]" href="/renttruth/prop-navrang-02">
                RentTruth™ expense auditor
              </Link>
            </li>
            <li>
              <Link className="text-[#4e6853] transition-colors hover:text-[#57875d] dark:text-[#a5b8aa] dark:hover:text-[#8fb893]" href="/rental/rent-navrang/passport">
                Digital Condition Passport
              </Link>
            </li>
            <li>
              <Link className="text-[#4e6853] transition-colors hover:text-[#57875d] dark:text-[#a5b8aa] dark:hover:text-[#8fb893]" href="/ai/agreement">
                AI Agreement analyzer
              </Link>
            </li>
          </ul>
        </div>

        {/* Column: Workspace & Accounts */}
        <div className="space-y-4 md:col-span-2 lg:col-span-2 text-sm">
          <p className="text-xs font-bold uppercase tracking-wider text-[#7d9782] dark:text-[#6e8272]">
            Workspaces
          </p>
          <ul className="space-y-2.5">
            <li>
              <Link className="text-[#4e6853] transition-colors hover:text-[#57875d] dark:text-[#a5b8aa] dark:hover:text-[#8fb893]" href="/login">
                Member sign in
              </Link>
            </li>
            <li>
              <Link className="text-[#4e6853] transition-colors hover:text-[#57875d] dark:text-[#a5b8aa] dark:hover:text-[#8fb893]" href="/register">
                Register account
              </Link>
            </li>
            <li>
              <Link className="text-[#4e6853] transition-colors hover:text-[#57875d] dark:text-[#a5b8aa] dark:hover:text-[#8fb893]" href="/profile">
                My Profile & settings
              </Link>
            </li>
            <li>
              <Link className="text-[#4e6853] transition-colors hover:text-[#57875d] dark:text-[#a5b8aa] dark:hover:text-[#8fb893]" href="/owner/properties/new">
                List your property
              </Link>
            </li>
            <li>
              <Link className="text-[#4e6853] transition-colors hover:text-[#57875d] dark:text-[#a5b8aa] dark:hover:text-[#8fb893]" href="/tenant/roommates">
                Roommate matching
              </Link>
            </li>
            <li>
              <Link className="text-[#4e6853] transition-colors hover:text-[#57875d] dark:text-[#a5b8aa] dark:hover:text-[#8fb893]" href="/ai/recommend">
                Ask Nivasa AI
              </Link>
            </li>
          </ul>
        </div>

        {/* Column: Tenancy Principles */}
        <div className="space-y-4 md:col-span-2 lg:col-span-3 text-sm">
          <p className="text-xs font-bold uppercase tracking-wider text-[#7d9782] dark:text-[#6e8272]">
            Tenancy Standards
          </p>
          <ul className="space-y-2.5 text-xs text-[#5e7565] dark:text-[#a5b8aa] leading-relaxed">
            <li className="flex items-start gap-2.5">
              <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#7ca982]/15 text-[10px] font-bold text-[#1d3122] dark:text-[#8fb893]">
                01
              </span>
              <span><strong>Total cost clarity:</strong> Headline rent published alongside maintenance, utilities & security deposit.</span>
            </li>
            <li className="flex items-start gap-2.5">
              <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#96bd9b]/20 text-[10px] font-bold text-[#1d3122] dark:text-[#a1bdb0]">
                02
              </span>
              <span><strong>Immutable passports:</strong> Move-in condition logged jointly to safeguard security deposits.</span>
            </li>
            <li className="flex items-start gap-2.5">
              <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#7ca982]/20 text-[10px] font-bold text-[#1d3122] dark:text-[#d2e8d6]">
                03
              </span>
              <span><strong>Direct interaction:</strong> Zero broker intermediaries distorting lease negotiations.</span>
            </li>
          </ul>
        </div>
      </div>

      {/* Bottom Sub-bar */}
      <div className="border-t border-[#e5dfc5]/80 dark:border-[#2a3f31]/80 py-6">
        <div className="wrap flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[#5e7565] dark:text-[#a5b8aa]">
          <div className="flex items-center gap-3">
            <span>© {new Date().getFullYear()} Nivasa. All rights reserved.</span>
          </div>
          <div className="flex items-center gap-6">
            <span>Verified Residential Living</span>
            <a
              href="#main"
              className="font-medium text-[#1d3122] hover:text-[#7ca982] dark:text-[#8fb893] dark:hover:text-[#a3caa6] transition-colors"
            >
              Back to top ↑
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
