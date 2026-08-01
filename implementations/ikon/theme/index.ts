import {
  defaultMotanTheme,
  type MotanTheme,
  motionTokens,
  shapeTokens,
  spacingTokens,
  typographyTokens,
} from "@motanos/ui";

/**
 * IKON visual theme values consuming MotanOS token contracts.
 * No database/auth/engines here.
 */
export const ikonTheme: MotanTheme = {
  ...defaultMotanTheme,
  id: "ikon-sports-lounge",
  colors: {
    ...defaultMotanTheme.colors,
    // Premium hospitality-oriented accents (implementation values)
    primary: "#c4a35a",
    accent: "#d2b56d",
    background: "#10151c",
    surface: "#18212c",
    muted: "#1d2733",
  },
  typography: typographyTokens,
  spacing: spacingTokens,
  shape: shapeTokens,
  motion: motionTokens,
};

/** @deprecated Use `ikonTheme` */
export const IKON_THEME = {
  id: ikonTheme.id,
} as const;
