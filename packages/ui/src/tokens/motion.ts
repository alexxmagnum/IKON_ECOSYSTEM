export const motionTokens = {
  duration: {
    fast: "120ms",
    normal: "220ms",
    slow: "360ms",
  },
  easing: {
    standard: "cubic-bezier(0.2, 0.8, 0.2, 1)",
    emphasized: "cubic-bezier(0.2, 0, 0, 1)",
  },
} as const;

export type MotionTokens = typeof motionTokens;
