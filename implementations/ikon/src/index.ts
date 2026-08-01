import { UI_PACKAGE } from "@motanos/ui";

import { IKON_BRAND } from "../brand";
import { IKON_CONFIG } from "../config";
import { IKON_THEME } from "../theme";

/**
 * @motanos/ikon — IKON Sports & Lounge experience composition.
 * Composes UI / brand / theme / config only.
 */
export const IKON_IMPLEMENTATION = {
  brand: IKON_BRAND,
  theme: IKON_THEME,
  config: IKON_CONFIG,
  uiPackage: UI_PACKAGE,
} as const;

export { IKON_BRAND, IKON_CONFIG, IKON_THEME };
