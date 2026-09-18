"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useTheme } from "@/components/layout/theme-provider";
import { useNestora } from "@/store/nestora-store";
import { cn } from "@/lib/cn";

const publicLinks = [
  { href: "/homes", label: "Homes" },
  { href: "/how-it-works", label: "How it works" },
  { href: "/ai/recommend", label: "Ask Nestora" },
];

export function Navbar() {
  const pathname = usePathname();
  const { user, signOut } = useNestora();
  const { theme, toggle } = useTheme();
  const [open, setOpen] = useState(false);
  const appHome =
    user?.role === "owner" ? "/owner/dashboard" : "/tenant/dashboard";

  return (
    <header className="sticky top-0 z-40 border-b border-line bg-paper/85 backdrop-blur-md">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-4">
        <Link href="/" className="font-serif text-2xl tracking-tight">
          Nestora
        </Link>
        <nav className="hidden items-center gap-8 text-sm md:flex">
          {publicLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "hover:text-bronze",
                pathname.startsWith(link.href) && "text-bronze",
              )}
            >
              {link.label}
            </Link>
          ))}
        </nav>
        <div className="hidden items-center gap-3 md:flex">
          <button
            type="button"
            onClick={toggle}
            className="font-mono text-[11px] uppercase tracking-[0.18em] text-ink-soft"
            aria-label="Toggle color theme"
          >
            {theme === "dark" ? "Light" : "Dark"}
          </button>
          {user ? (
            <>
              <Button href={appHome} variant="ghost">
                Workspace
              </Button>
              <Button onClick={signOut} variant="line">
                Sign out
              </Button>
            </>
          ) : (
            <>
              <Button href="/login" variant="ghost">
                Sign in
              </Button>
              <Button href="/register">Get started</Button>
            </>
          )}
        </div>
        <button
          type="button"
          className="md:hidden"
          aria-expanded={open}
          onClick={() => setOpen((value) => !value)}
        >
          Menu
        </button>
      </div>
      {open ? (
        <div className="space-y-3 border-t border-line px-5 py-4 md:hidden">
          {publicLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="block"
              onClick={() => setOpen(false)}
            >
              {link.label}
            </Link>
          ))}
          <button type="button" onClick={toggle}>
            Switch to {theme === "dark" ? "light" : "dark"}
          </button>
          {user ? (
            <>
              <Link href={appHome} onClick={() => setOpen(false)}>
                Workspace
              </Link>
              <button type="button" onClick={signOut}>
                Sign out
              </button>
            </>
          ) : (
            <>
              <Link href="/login" onClick={() => setOpen(false)}>
                Sign in
              </Link>
              <Link href="/register" onClick={() => setOpen(false)}>
                Get started
              </Link>
            </>
          )}
        </div>
      ) : null}
    </header>
  );
}
