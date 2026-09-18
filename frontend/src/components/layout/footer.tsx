import Link from "next/link";

export function Footer() {
  return (
    <footer className="border-t border-line">
      <div className="mx-auto grid max-w-6xl gap-10 px-5 py-16 md:grid-cols-4">
        <div className="md:col-span-2">
          <p className="font-serif text-4xl">Nestora</p>
          <p className="mt-4 max-w-md text-sm text-ink-soft">
            A rental lifecycle platform for tenants and owners. This frontend is
            a working prototype. Payments, messages, and files stay on this
            device unless a backend is connected.
          </p>
        </div>
        <div className="space-y-2 text-sm">
          <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-ink-soft">
            Explore
          </p>
          <Link className="block hover:text-bronze" href="/homes">
            Homes
          </Link>
          <Link className="block hover:text-bronze" href="/how-it-works">
            How it works
          </Link>
          <Link className="block hover:text-bronze" href="/renttruth/prop-navrang-02">
            RentTruth
          </Link>
          <Link className="block hover:text-bronze" href="/ai/agreement">
            Agreement analyzer
          </Link>
        </div>
        <div className="space-y-2 text-sm">
          <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-ink-soft">
            Workspace
          </p>
          <Link className="block hover:text-bronze" href="/login">
            Sign in
          </Link>
          <Link className="block hover:text-bronze" href="/register">
            Create account
          </Link>
          <Link className="block hover:text-bronze" href="/owner/properties/new">
            List a property
          </Link>
        </div>
      </div>
    </footer>
  );
}
