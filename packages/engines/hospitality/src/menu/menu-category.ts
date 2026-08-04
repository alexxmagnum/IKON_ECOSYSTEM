/**
 * MenuCategory — grouping of items within a hospitality carta.
 *
 * @see DEC-HOSPITALITY-MENU-CONTEXT-001
 */

/** Category grouping status (aligned with carta lifecycle). */
export const MENU_CATEGORY_STATUSES = {
  Draft: "draft",
  Active: "active",
  Inactive: "inactive",
  Available: "available",
  Archived: "archived",
  Cancelled: "cancelled",
} as const;

export type MenuCategoryStatus =
  (typeof MENU_CATEGORY_STATUSES)[keyof typeof MENU_CATEGORY_STATUSES];

export const MENU_CATEGORY_STATUS_VALUES = Object.values(
  MENU_CATEGORY_STATUSES,
) as readonly MenuCategoryStatus[];

/**
 * Opaque menu category — grouping existence only.
 */
export type MenuCategory = {
  /** Opaque unique category reference. */
  categoryReference: string;
  /** Category status. */
  categoryStatus: MenuCategoryStatus;
  /** Opaque menu pointer when known. */
  menuReference?: string;
  /** Opaque display-name pointer when known. */
  nameReference?: string;
  /** Opaque sort/position pointer when known. */
  positionReference?: string;
  /** Controlled optional metadata — never secrets or PII. */
  metadata?: Record<string, unknown>;
};

export type CreateMenuCategoryInput = {
  categoryStatus?: MenuCategoryStatus;
  categoryReference?: string;
  menuReference?: string;
  nameReference?: string;
  positionReference?: string;
  metadata?: Record<string, unknown>;
};

export function isMenuCategoryStatus(
  value: string,
): value is MenuCategoryStatus {
  return (MENU_CATEGORY_STATUS_VALUES as readonly string[]).includes(value);
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

export function isMenuCategory(value: unknown): value is MenuCategory {
  if (value === null || typeof value !== "object") {
    return false;
  }
  const candidate = value as Record<string, unknown>;
  return (
    typeof candidate.categoryReference === "string" &&
    candidate.categoryReference.length > 0 &&
    optionalOpaqueOk(candidate, "menuReference") &&
    optionalOpaqueOk(candidate, "nameReference") &&
    optionalOpaqueOk(candidate, "positionReference") &&
    typeof candidate.categoryStatus === "string" &&
    isMenuCategoryStatus(candidate.categoryStatus)
  );
}
