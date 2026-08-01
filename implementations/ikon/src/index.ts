import { UI_PACKAGE } from "@motanos/ui";

import { IKON_BRAND } from "../brand";
import { IKON_CONFIG } from "../config";
import { IKON_THEME, ikonTheme } from "../theme";

/**
 * @motanos/ikon — IKON Sports & Lounge experience composition.
 * Owns brand/theme/config only.
 */
export const IKON_IMPLEMENTATION = {
  brand: IKON_BRAND,
  theme: ikonTheme,
  config: IKON_CONFIG,
  uiPackage: UI_PACKAGE,
} as const;

export { IKON_BRAND, type IkonBrand } from "../brand";
export { IKON_CONFIG, type IkonConfig } from "../config";
export { IKON_THEME, ikonTheme };
