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
    default: "NIVASA — Living, Harmonized | Modern Verified Tenancy",
    template: "%s · NIVASA",
  },
  description:
    "NIVASA is a spatial living platform connecting modern tenants and verified property owners with absolute cost clarity, cryptographic condition passports, and direct tenancy workflows.",
  keywords: [
    "NIVASA",
    "spatial living",
    "verified rentals India",
    "RentTruth cost transparency",
    "condition passport",
    "modern homes Mumbai",
    "verified rentals Bengaluru",
    "AI tenancy agreement audit",
  ],
  authors: [{ name: "NIVASA Living" }],
  openGraph: {
    title: "NIVASA — Living, Harmonized",
    description:
      "A luminous rental ecosystem built for verified cost clarity, shared property passports, and effortless modern dwellings.",
    url: "https://nivasa.in",
    siteName: "NIVASA",
    locale: "en_IN",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "NIVASA — Living, Harmonized",
    description: "Curated contemporary residences with transparent RentTruth expense tracking.",
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
