import type { RestaurantVenueId } from "./venue";
import type { MenuItem } from "./product";
import type { MenuStatus } from "../types";

export type MenuId = string;
export type MenuCategoryId = string;

/**
 * Category within a digital / seasonal menu.
 */
export interface MenuCategory {
  id: MenuCategoryId;
  menuId: MenuId;
  name: string;
  /** Display order hint; lower first. */
  sortOrder?: number;
  items?: MenuItem[];
  metadata?: Record<string, unknown>;
}

/**
 * Digital / seasonal menu (carta) for a venue.
 * QR, checkout, and kitchen flows are out of scope for this foundation.
 */
export interface Menu {
  id: MenuId;
  venueId: RestaurantVenueId;
  name: string;
  status: MenuStatus;
  categories: MenuCategory[];
  /** Optional season / validity window (ISO-8601). */
  validFrom?: string;
  validTo?: string;
  metadata?: Record<string, unknown>;
}
