import Link from "next/link";

export function Footer() {
  return (
    <footer className="border-t border-slate-200/80 dark:border-slate-800/80 bg-white/60 dark:bg-slate-950/60 backdrop-blur-xl text-slate-900 dark:text-slate-100">
      <div className="wrap grid gap-12 py-16 sm:py-20 md:grid-cols-12 lg:gap-10">
        {/* Brand & Manifesto */}
        <div className="md:col-span-5 lg:col-span-4 space-y-5">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-tr from-blue-600 to-teal-400 text-white shadow-md shadow-blue-500/20">
              <span className="font-sans font-black text-lg tracking-tighter">N</span>
            </div>
            <span className="font-sans text-2xl font-bold tracking-tight">NIVASA</span>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-500/10 px-2.5 py-0.5 text-[11px] font-semibold text-blue-600 dark:text-blue-400">
              Living, Harmonized
            </span>
          </div>
          <p className="text-sm leading-relaxed text-slate-600 dark:text-slate-400 max-w-sm">
            A contemporary spatial living platform connecting tenants and verified property owners through transparent RentTruth™ itemization, shared condition passports, and verified rental workspaces.
          </p>
          <div className="flex items-center gap-3 pt-2">
            <span className="flex h-2.5 w-2.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.7)]" />
            <span className="text-xs font-medium text-slate-600 dark:text-slate-400">
              Supabase Verified Backend & Realtime Active
            </span>
          </div>
        </div>

        {/* Column: Discover */}
        <div className="space-y-4 md:col-span-3 lg:col-span-3 text-sm">
          <p className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
            Platform Discovery
          </p>
          <ul className="space-y-2.5">
            <li>
              <Link className="text-slate-600 transition-colors hover:text-blue-600 dark:text-slate-400 dark:hover:text-blue-400" href="/homes">
                Explore residences
              </Link>
            </li>
            <li>
              <Link className="text-slate-600 transition-colors hover:text-blue-600 dark:text-slate-400 dark:hover:text-blue-400" href="/how-it-works">
                Verified rental lifecycle
              </Link>
            </li>
            <li>
              <Link className="text-slate-600 transition-colors hover:text-blue-600 dark:text-slate-400 dark:hover:text-blue-400" href="/renttruth/prop-navrang-02">
                RentTruth™ expense auditor
              </Link>
            </li>
            <li>
              <Link className="text-slate-600 transition-colors hover:text-blue-600 dark:text-slate-400 dark:hover:text-blue-400" href="/rental/rent-navrang/passport">
                Digital Condition Passport
              </Link>
            </li>
            <li>
              <Link className="text-slate-600 transition-colors hover:text-blue-600 dark:text-slate-400 dark:hover:text-blue-400" href="/ai/agreement">
                AI Agreement analyzer
              </Link>
            </li>
          </ul>
        </div>

        {/* Column: Workspace & Accounts */}
        <div className="space-y-4 md:col-span-2 lg:col-span-2 text-sm">
          <p className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
            Workspaces
          </p>
          <ul className="space-y-2.5">
            <li>
              <Link className="text-slate-600 transition-colors hover:text-blue-600 dark:text-slate-400 dark:hover:text-blue-400" href="/login">
                Member sign in
              </Link>
            </li>
            <li>
              <Link className="text-slate-600 transition-colors hover:text-blue-600 dark:text-slate-400 dark:hover:text-blue-400" href="/register">
                Register account
              </Link>
            </li>
            <li>
              <Link className="text-slate-600 transition-colors hover:text-blue-600 dark:text-slate-400 dark:hover:text-blue-400" href="/owner/properties/new">
                List your property
              </Link>
            </li>
            <li>
              <Link className="text-slate-600 transition-colors hover:text-blue-600 dark:text-slate-400 dark:hover:text-blue-400" href="/tenant/roommates">
                Roommate matching
              </Link>
            </li>
            <li>
              <Link className="text-slate-600 transition-colors hover:text-blue-600 dark:text-slate-400 dark:hover:text-blue-400" href="/ai/recommend">
                Ask NIVASA AI
              </Link>
            </li>
          </ul>
        </div>

        {/* Column: Tenancy Principles */}
        <div className="space-y-4 md:col-span-2 lg:col-span-3 text-sm">
          <p className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
            Tenancy Standards
          </p>
          <ul className="space-y-2.5 text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
            <li className="flex items-start gap-2.5">
              <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-blue-500/10 text-[10px] font-bold text-blue-600 dark:text-blue-400">
                01
              </span>
              <span><strong>Total cost clarity:</strong> Headline rent published alongside maintenance, utilities & security deposit.</span>
            </li>
            <li className="flex items-start gap-2.5">
              <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-teal-500/10 text-[10px] font-bold text-teal-600 dark:text-teal-400">
                02
              </span>
              <span><strong>Immutable passports:</strong> Move-in condition logged jointly to safeguard security deposits.</span>
            </li>
            <li className="flex items-start gap-2.5">
              <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-indigo-500/10 text-[10px] font-bold text-indigo-600 dark:text-indigo-400">
                03
              </span>
              <span><strong>Direct interaction:</strong> Zero broker intermediaries distorting lease negotiations.</span>
            </li>
          </ul>
        </div>
      </div>

      {/* Bottom Sub-bar */}
      <div className="border-t border-slate-200/60 dark:border-slate-800/60 py-6">
        <div className="wrap flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500 dark:text-slate-400">
          <div className="flex items-center gap-3">
            <span>© {new Date().getFullYear()} NIVASA Living Technologies. All rights reserved.</span>
          </div>
          <div className="flex items-center gap-6">
            <span>Verified Residential Living</span>
            <a
              href="#main"
              className="font-medium text-blue-600 hover:text-blue-500 dark:text-blue-400 transition-colors"
            >
              Back to top ↑
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
