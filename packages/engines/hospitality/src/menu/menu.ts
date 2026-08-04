/**
 * Hospitality Menu — operative carta within a hospitality business.
 * Digital-carta / Smart Table OS foundation (existence only).
 *
 * @see DEC-HOSPITALITY-MENU-CONTEXT-001
 */

/** Internal menu kinds — carta types, not order/kitchen concepts. */
export const MENU_KINDS = {
  /** Restaurant carta. */
  Restaurant: "menu.restaurant",
  /** Bar carta. */
  Bar: "menu.bar",
  /** Club / beach-club carta. */
  Club: "menu.club",
  /** Hotel F&B carta. */
  Hotel: "menu.hotel",
  /** Seasonal / limited-time carta. */
  Seasonal: "menu.seasonal",
  /** Internal MotanOS hospitality carta. */
  Internal: "menu.internal",
} as const;

export type MenuKind = (typeof MENU_KINDS)[keyof typeof MENU_KINDS];

export const MENU_KIND_VALUES = Object.values(
  MENU_KINDS,
) as readonly MenuKind[];

/** Menu carta status. */
export const MENU_STATUSES = {
  Draft: "draft",
  Active: "active",
  Inactive: "inactive",
  Available: "available",
  Archived: "archived",
  Cancelled: "cancelled",
} as const;

export type MenuStatus = (typeof MENU_STATUSES)[keyof typeof MENU_STATUSES];

export const MENU_STATUS_VALUES = Object.values(
  MENU_STATUSES,
) as readonly MenuStatus[];

/**
 * Opaque hospitality menu — carta existence only.
 * No order, kitchen, payment, inventory, or pricing-engine payloads.
 */
export type HospitalityMenu = {
  /** Opaque unique menu reference. */
  menuReference: string;
  /** Internal menu kind. */
  menuKind: MenuKind;
  /** Menu status. */
  menuStatus: MenuStatus;
  /** Opaque hospitality business pointer when known. */
  hospitalityReference?: string;
  /** Opaque ambit pointer when known. */
  contextReference?: string;
  /** Opaque display-name pointer when known. */
  nameReference?: string;
  /** Opaque parent menu pointer when nested. */
  parentMenuReference?: string;
  /** Controlled optional metadata — never secrets or PII. */
  metadata?: Record<string, unknown>;
};

/**
 * Outbound port for future menu adapters.
 * Not wired in this foundation — no publish / print / QR methods.
 */
export interface MenuPort {
  createMenu(input: CreateMenuInput): Promise<HospitalityMenu>;
  resolveMenu(menu: HospitalityMenu): Promise<HospitalityMenu>;
}

export type CreateMenuInput = {
  menuKind: MenuKind;
  menuStatus?: MenuStatus;
  menuReference?: string;
  hospitalityReference?: string;
  contextReference?: string;
  nameReference?: string;
  parentMenuReference?: string;
  metadata?: Record<string, unknown>;
};

export function isMenuKind(value: string): value is MenuKind {
  return (MENU_KIND_VALUES as readonly string[]).includes(value);
}

export function isMenuStatus(value: string): value is MenuStatus {
  return (MENU_STATUS_VALUES as readonly string[]).includes(value);
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

export function isHospitalityMenu(value: unknown): value is HospitalityMenu {
  if (value === null || typeof value !== "object") {
    return false;
  }
  const candidate = value as Record<string, unknown>;
  return (
    typeof candidate.menuReference === "string" &&
    candidate.menuReference.length > 0 &&
    optionalOpaqueOk(candidate, "hospitalityReference") &&
    optionalOpaqueOk(candidate, "contextReference") &&
    optionalOpaqueOk(candidate, "nameReference") &&
    optionalOpaqueOk(candidate, "parentMenuReference") &&
    typeof candidate.menuKind === "string" &&
    isMenuKind(candidate.menuKind) &&
    typeof candidate.menuStatus === "string" &&
    isMenuStatus(candidate.menuStatus)
  );
}

export function isMenuPort(value: unknown): value is MenuPort {
  return (
    value !== null &&
    typeof value === "object" &&
    typeof (value as MenuPort).createMenu === "function" &&
    typeof (value as MenuPort).resolveMenu === "function"
  );
}
