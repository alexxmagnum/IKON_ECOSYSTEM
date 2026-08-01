export const shapeTokens = {
  radius: {
    sm: "0.375rem",
    md: "0.75rem",
    lg: "1rem",
    full: "9999px",
  },
  borderWidth: {
    thin: "1px",
    medium: "2px",
  },
  shadow: {
    sm: "0 1px 2px rgba(0, 0, 0, 0.18)",
    md: "0 8px 24px rgba(0, 0, 0, 0.22)",
  },
} as const;

export type ShapeTokens = typeof shapeTokens;
