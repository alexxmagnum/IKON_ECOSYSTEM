import type { Money } from "@motanos/payments";
import type { MenuCategoryId } from "./menu";

export type MenuItemId = string;

/**
 * Product on a digital menu (Menu Item).
 * No stock, kitchen recipes, or complex ingredient graphs in this foundation.
 */
export interface MenuItem {
  id: MenuItemId;
  name: string;
  description?: string;
  /** Final display price (Payments Money — minor units + currency). */
  price: Money;
  categoryId: MenuCategoryId;
  /** Operational availability flag (Digital Menu SoT). */
  available?: boolean;
  metadata?: Record<string, unknown>;
}
