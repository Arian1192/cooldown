import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";

import "./globals.css";
import { SiteShell } from "@/components/SiteShell";
import { env } from "@/env";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL(env.SITE_URL),
  title: {
    default: env.NEXT_PUBLIC_SITE_NAME,
    template: `%s · ${env.NEXT_PUBLIC_SITE_NAME}`,
  },
  description: "Baseline scaffold (Sprint 1)",
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    title: env.NEXT_PUBLIC_SITE_NAME,
    description: "Baseline scaffold (Sprint 1)",
    url: "/",
    siteName: env.NEXT_PUBLIC_SITE_NAME,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <SiteShell>{children}</SiteShell>
      </body>
    </html>
  );
}
