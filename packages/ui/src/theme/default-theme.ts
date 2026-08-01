import { motionTokens } from "../tokens/motion";
import { shapeTokens } from "../tokens/shape";
import { spacingTokens } from "../tokens/spacing";
import { typographyTokens } from "../tokens/typography";
import type { MotanTheme } from "./types";

/**
 * Neutral MotanOS default theme (not IKON-exclusive).
 */
export const defaultMotanTheme: MotanTheme = {
  id: "motanos-default",
  colors: {
    background: "#0f1419",
    foreground: "#f4f1ea",
    muted: "#1c2430",
    mutedForeground: "rgba(244, 241, 234, 0.65)",
    primary: "#c4a35a",
    primaryForeground: "#11151a",
    secondary: "#243041",
    secondaryForeground: "#f4f1ea",
    accent: "#c4a35a",
    accentForeground: "#11151a",
    destructive: "#d45d5d",
    destructiveForeground: "#fff7f7",
    border: "rgba(244, 241, 234, 0.14)",
    ring: "rgba(196, 163, 90, 0.55)",
    surface: "#161d26",
  },
  typography: typographyTokens,
  spacing: spacingTokens,
  shape: shapeTokens,
  motion: motionTokens,
};
