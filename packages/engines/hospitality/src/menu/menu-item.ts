/**
 * MenuItem — available element within a hospitality carta.
 *
 * @see DEC-HOSPITALITY-MENU-CONTEXT-001
 */

/** Item availability status. */
export const MENU_ITEM_STATUSES = {
  Draft: "draft",
  Active: "active",
  Available: "available",
  Unavailable: "unavailable",
  Archived: "archived",
  Cancelled: "cancelled",
} as const;

export type MenuItemStatus =
  (typeof MENU_ITEM_STATUSES)[keyof typeof MENU_ITEM_STATUSES];

export const MENU_ITEM_STATUS_VALUES = Object.values(
  MENU_ITEM_STATUSES,
) as readonly MenuItemStatus[];

/**
 * Opaque menu item — carta element existence only.
 * priceReference / imageReference are opaque — no pricing engine or storage.
 */
export type MenuItem = {
  /** Opaque unique item reference. */
  itemReference: string;
  /** Item status. */
  itemStatus: MenuItemStatus;
  /** Opaque menu pointer when known. */
  menuReference?: string;
  /** Opaque category pointer when known. */
  categoryReference?: string;
  /** Opaque display-name pointer when known. */
  nameReference?: string;
  /** Opaque description pointer when known. */
  descriptionReference?: string;
  /** Opaque price pointer when known (future Pricing Engine). */
  priceReference?: string;
  /** Opaque image pointer when known (no media storage here). */
  imageReference?: string;
  /** Controlled optional metadata — never secrets or PII. */
  metadata?: Record<string, unknown>;
};

/**
 * Outbound port for future menu-item adapters.
 * Not wired in this foundation — no order / kitchen / cost methods.
 */
export interface MenuItemPort {
  createMenuItem(input: CreateMenuItemInput): Promise<MenuItem>;
  resolveMenuItem(item: MenuItem): Promise<MenuItem>;
}

export type CreateMenuItemInput = {
  itemStatus?: MenuItemStatus;
  itemReference?: string;
  menuReference?: string;
  categoryReference?: string;
  nameReference?: string;
  descriptionReference?: string;
  priceReference?: string;
  imageReference?: string;
  metadata?: Record<string, unknown>;
};

export function isMenuItemStatus(value: string): value is MenuItemStatus {
  return (MENU_ITEM_STATUS_VALUES as readonly string[]).includes(value);
}

function optionalOpaqueOk(
  candidate: Record<string, unknown>,
  key: string,
): boolean {
  const raw = candidate[key];
  return (
    raw === undefined || (typeof raw === "string" && raw.length > 0)
  );
}

export function isMenuItem(value: unknown): value is MenuItem {
  if (value === null || typeof value !== "object") {
    return false;
  }
  const candidate = value as Record<string, unknown>;
  return (
    typeof candidate.itemReference === "string" &&
    candidate.itemReference.length > 0 &&
    optionalOpaqueOk(candidate, "menuReference") &&
    optionalOpaqueOk(candidate, "categoryReference") &&
    optionalOpaqueOk(candidate, "nameReference") &&
    optionalOpaqueOk(candidate, "descriptionReference") &&
    optionalOpaqueOk(candidate, "priceReference") &&
    optionalOpaqueOk(candidate, "imageReference") &&
    typeof candidate.itemStatus === "string" &&
    isMenuItemStatus(candidate.itemStatus)
  );
}

export function isMenuItemPort(value: unknown): value is MenuItemPort {
  return (
    value !== null &&
    typeof value === "object" &&
    typeof (value as MenuItemPort).createMenuItem === "function" &&
    typeof (value as MenuItemPort).resolveMenuItem === "function"
  );
}
