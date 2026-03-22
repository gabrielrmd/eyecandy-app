import type { Metadata } from "next";
import { Inter, Oswald } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const oswald = Oswald({
  variable: "--font-oswald",
  subsets: ["latin"],
  display: "swap",
  weight: ["400", "500", "600", "700"],
});

const siteUrl = process.env.NEXT_PUBLIC_APP_URL || "https://advertisingunplugged.com";

export const metadata: Metadata = {
  title: {
    default: "Advertising Unplugged | AI-Powered Brand Strategy",
    template: "%s | Advertising Unplugged",
  },
  description:
    "Professional brand strategy, powered by AI. Turn weeks of consulting into 24 hours with our AI Strategy Builder, 41 marketing templates, and 90-Day Growth Challenge.",
  keywords: [
    "brand strategy",
    "AI marketing",
    "marketing templates",
    "growth challenge",
    "advertising unplugged",
    "AI strategy builder",
    "marketing strategy",
    "brand consulting",
  ],
  metadataBase: new URL(siteUrl),
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: siteUrl,
    siteName: "Advertising Unplugged",
    title: "Advertising Unplugged | AI-Powered Brand Strategy",
    description:
      "Professional brand strategy, powered by AI. Turn weeks of consulting into 24 hours with our AI Strategy Builder, 41 marketing templates, and 90-Day Growth Challenge.",
    images: [
      {
        url: "/brand/social-linkedin-banner.svg",
        width: 1200,
        height: 630,
        alt: "Advertising Unplugged — Clarity Over Noise",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Advertising Unplugged | AI-Powered Brand Strategy",
    description:
      "Professional brand strategy in 24 hours. AI Strategy Builder, 41 templates, and 90-Day Growth Challenge.",
    images: ["/brand/social-linkedin-banner.svg"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, "max-image-preview": "large" },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${oswald.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
