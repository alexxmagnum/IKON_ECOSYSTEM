import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";

import { AppShell } from "@motanos/ui";
import { ikonTheme } from "@motanos/ikon";

import { FoundationHeader } from "../components/foundation-header";
import { siteConfig } from "../lib/site";
import { AppProviders } from "../providers/app-providers";

import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: siteConfig.name,
    template: "%s · MotanOS",
  },
  description: siteConfig.description,
  applicationName: "MotanOS",
  manifest: "/manifest.webmanifest",
  appleWebApp: {
    capable: true,
    title: "MotanOS",
    statusBarStyle: "black-translucent",
  },
  icons: {
    icon: [{ url: "/icons/icon.svg", type: "image/svg+xml" }],
  },
};

export const viewport: Viewport = {
  themeColor: ikonTheme.colors.background,
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>
        <a href="#main-content" className="skip-link">
          Skip to content
        </a>
        <AppProviders theme={ikonTheme}>
          <AppShell header={<FoundationHeader />}>{children}</AppShell>
        </AppProviders>
      </body>
    </html>
  );
}
