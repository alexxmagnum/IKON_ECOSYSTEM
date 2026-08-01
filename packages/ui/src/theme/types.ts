import type {
  ColorTokens,
  MotionTokens,
  ShapeTokens,
  SpacingTokens,
  TypographyTokens,
} from "../tokens";

/**
 * MotanOS theme contract.
 * Implementations (e.g. IKON) supply values; UI owns the contract.
 */
export type MotanTheme = {
  id: string;
  colors: ColorTokens;
  typography: TypographyTokens;
  spacing: SpacingTokens;
  shape: ShapeTokens;
  motion: MotionTokens;
};
