/**
 * Semantic color token keys for MotanOS UI.
 * Values are supplied by themes (MotanOS default or implementation).
 */
export const colorTokenKeys = [
  "background",
  "foreground",
  "muted",
  "mutedForeground",
  "primary",
  "primaryForeground",
  "secondary",
  "secondaryForeground",
  "accent",
  "accentForeground",
  "destructive",
  "destructiveForeground",
  "border",
  "ring",
  "surface",
] as const;

export type ColorTokenKey = (typeof colorTokenKeys)[number];

export type ColorTokens = Record<ColorTokenKey, string>;
