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
    default: "Nivasa — Modern Verified Tenancy & Living Ecosystem",
    template: "%s · Nivasa",
  },
  description:
    "Nivasa is a modern tenancy and verified living platform connecting residents and property owners with absolute cost clarity, shared condition passports, and direct workflows.",
  keywords: [
    "Nivasa",
    "spatial living",
    "verified rentals India",
    "RentTruth cost transparency",
    "condition passport",
    "modern homes Mumbai",
    "verified rentals Bengaluru",
    "AI tenancy agreement audit",
  ],
  authors: [{ name: "Nivasa" }],
  openGraph: {
    title: "Nivasa — Modern Verified Tenancy & Living Ecosystem",
    description:
      "A serene rental ecosystem built for verified cost clarity, shared property passports, and effortless modern dwellings.",
    url: "https://nivasa.living",
    siteName: "Nivasa",
    locale: "en_IN",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Nivasa — Modern Verified Tenancy & Living Ecosystem",
    description: "Curated residences with transparent RentTruth expense tracking and direct verified tenancy.",
  },
  icons: {
    icon: "/favicon.png",
    apple: "/brand/nivasa-logo.jpg",
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      data-theme="light"
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
