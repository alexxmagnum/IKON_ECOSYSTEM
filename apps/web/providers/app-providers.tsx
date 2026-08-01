"use client";

import type { ReactNode } from "react";

import type { MotanTheme } from "@motanos/ui";

import { ThemeProvider } from "./theme-provider";

export type AppProvidersProps = {
  theme: MotanTheme;
  children: ReactNode;
};

/**
 * Application provider composition.
 * Theme is active; Auth/Application contexts are reserved for later phases.
 */
export function AppProviders({ theme, children }: AppProvidersProps) {
  return <ThemeProvider theme={theme}>{children}</ThemeProvider>;
}
