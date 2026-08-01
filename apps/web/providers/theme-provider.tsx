"use client";

import { useEffect, type ReactNode } from "react";

import { applyThemeToElement, type MotanTheme } from "@motanos/ui";

export type ThemeProviderProps = {
  theme: MotanTheme;
  children: ReactNode;
};

/**
 * Applies MotanOS theme CSS variables to the document root.
 * Future AuthProvider can sit beside this in AppProviders.
 */
export function ThemeProvider({ theme, children }: ThemeProviderProps) {
  useEffect(() => {
    applyThemeToElement(document.documentElement, theme);
  }, [theme]);

  return children;
}
