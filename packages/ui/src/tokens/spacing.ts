export const spacingTokens = {
  xs: "0.25rem",
  sm: "0.5rem",
  md: "1rem",
  lg: "1.5rem",
  xl: "2.5rem",
} as const;

export type SpacingTokenKey = keyof typeof spacingTokens;
export type SpacingTokens = typeof spacingTokens;
