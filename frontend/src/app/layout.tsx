import type { Metadata } from "next";
import { Cormorant_Garamond, IBM_Plex_Mono, Outfit } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/layout/providers";

const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
  display: "swap",
});

const cormorant = Cormorant_Garamond({
  variable: "--font-cormorant",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  display: "swap",
});

const plex = IBM_Plex_Mono({
  variable: "--font-plex",
  subsets: ["latin"],
  weight: ["400", "500"],
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "Nestora — Architectural Property Living & Verified Tenancy",
    template: "%s · Nestora",
  },
  description:
    "Nestora is a residential living platform connecting discerning tenants and property owners with transparent RentTruth costs, cryptographic condition passports, and verified rental workflows.",
  keywords: [
    "architectural living",
    "verified rentals India",
    "RentTruth cost transparency",
    "condition passport",
    "luxury apartments Mumbai",
    "architectural homes Bengaluru",
    "lease agreement analysis",
  ],
  authors: [{ name: "Nestora Architectural Living" }],
  openGraph: {
    title: "Nestora — Architectural Property Living & Verified Tenancy",
    description:
      "A modern rental platform built for cost clarity, verified property passports, and elevated architectural spaces.",
    url: "https://nestora.in",
    siteName: "Nestora",
    locale: "en_IN",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Nestora — Architectural Property Living & Verified Tenancy",
    description: "Curated architectural properties with transparent RentTruth expense tracking.",
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      data-theme="dark"
      className={`${outfit.variable} ${cormorant.variable} ${plex.variable} h-full antialiased`}
    >
      <body className="min-h-full bg-paper text-ink">
        <a className="skip-link" href="#main">
          Skip to content
        </a>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
