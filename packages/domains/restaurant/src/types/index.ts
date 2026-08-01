/**
 * Restaurant domain statuses from docs/35_RESTAURANT_MODULE and Digital Menu SoT.
 * ORDER machine statuses are declared for future use — no order workflows here.
 */

/** Table operational statuses (Restaurant Module — English canonical labels). */
export const RESTAURANT_TABLE_STATUSES = [
  "Available",
  "Reserved",
  "Occupied",
  "Preparing",
  "OutOfService",
] as const;

export type RestaurantTableStatus = (typeof RESTAURANT_TABLE_STATUSES)[number];

/** Seasonal / digital menu publication statuses. */
export const MENU_STATUSES = ["Draft", "Active", "Archived"] as const;

export type MenuStatus = (typeof MENU_STATUSES)[number];

/**
 * ORDER machine statuses (state-machines.md §6).
 * Declared for type alignment; order execution is out of scope for this foundation.
 */
export const ORDER_STATUSES = [
  "Draft",
  "Sent",
  "Preparing",
  "Ready",
  "Served",
  "Completed",
  "Cancelled",
] as const;

export type OrderStatus = (typeof ORDER_STATUSES)[number];

export function isRestaurantTableStatus(
  value: string,
): value is RestaurantTableStatus {
  return (RESTAURANT_TABLE_STATUSES as readonly string[]).includes(value);
}

export function isMenuStatus(value: string): value is MenuStatus {
  return (MENU_STATUSES as readonly string[]).includes(value);
}

export function isOrderStatus(value: string): value is OrderStatus {
  return (ORDER_STATUSES as readonly string[]).includes(value);
}
