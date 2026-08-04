import type {
  CreateMenuInput,
  HospitalityMenu,
  MenuKind,
  MenuStatus,
} from "./menu";
import { MENU_STATUSES, isMenuKind, isMenuStatus } from "./menu";
import type {
  CreateMenuCategoryInput,
  MenuCategory,
  MenuCategoryStatus,
} from "./menu-category";
import {
  MENU_CATEGORY_STATUSES,
  isMenuCategoryStatus,
} from "./menu-category";

let menuSequence = 0;
let categorySequence = 0;

export interface CreateMenuOptions {
  /**
   * When set, menu may only be created for this hospitality business
   * (cross-business isolation).
   */
  hospitalityReference?: string;
}

/**
 * Build a checked HospitalityMenu (in-memory — carta existence only).
 * Does not publish, print, price, or open kitchen / payment flows.
 */
export function createMenu(
  input: CreateMenuInput,
  options: CreateMenuOptions = {},
): HospitalityMenu {
  const hospitalityReference = input.hospitalityReference?.trim();
  const contextReference = input.contextReference?.trim();
  const nameReference = input.nameReference?.trim();
  const parentMenuReference = input.parentMenuReference?.trim();
  const boundHospitality = options.hospitalityReference?.trim() || undefined;

  if (!isMenuKind(input.menuKind)) {
    throw new Error(`Unknown menu kind: ${String(input.menuKind)}`);
  }

  const menuStatus: MenuStatus =
    input.menuStatus ?? MENU_STATUSES.Draft;
  if (!isMenuStatus(menuStatus)) {
    throw new Error(`Unknown menu status: ${String(input.menuStatus)}`);
  }

  if (input.hospitalityReference !== undefined && !hospitalityReference) {
    throw new Error(
      "hospitalityReference must not be empty when provided",
    );
  }
  if (input.contextReference !== undefined && !contextReference) {
    throw new Error("contextReference must not be empty when provided");
  }
  if (input.nameReference !== undefined && !nameReference) {
    throw new Error("nameReference must not be empty when provided");
  }
  if (input.parentMenuReference !== undefined && !parentMenuReference) {
    throw new Error(
      "parentMenuReference must not be empty when provided",
    );
  }

  if (
    boundHospitality !== undefined &&
    (hospitalityReference === undefined ||
      hospitalityReference !== boundHospitality)
  ) {
    throw new Error("menu does not apply to this hospitality business");
  }

  const providedReference = input.menuReference?.trim() ?? "";
  if (input.menuReference !== undefined && !providedReference) {
    throw new Error("menuReference must not be empty when provided");
  }

  const menuKind: MenuKind = input.menuKind;
  const menuReference = providedReference || allocateMenuReference();

  return {
    menuReference,
    menuKind,
    menuStatus,
    ...(hospitalityReference !== undefined && hospitalityReference.length > 0
      ? { hospitalityReference }
      : {}),
    ...(contextReference !== undefined && contextReference.length > 0
      ? { contextReference }
      : {}),
    ...(nameReference !== undefined && nameReference.length > 0
      ? { nameReference }
      : {}),
    ...(parentMenuReference !== undefined && parentMenuReference.length > 0
      ? { parentMenuReference }
      : {}),
    ...(input.metadata !== undefined ? { metadata: input.metadata } : {}),
  };
}

/**
 * Build a checked MenuCategory (in-memory — grouping existence only).
 */
export function createMenuCategory(
  input: CreateMenuCategoryInput = {},
): MenuCategory {
  const menuReference = input.menuReference?.trim();
  const nameReference = input.nameReference?.trim();
  const positionReference = input.positionReference?.trim();

  const categoryStatus: MenuCategoryStatus =
    input.categoryStatus ?? MENU_CATEGORY_STATUSES.Draft;
  if (!isMenuCategoryStatus(categoryStatus)) {
    throw new Error(
      `Unknown menu category status: ${String(input.categoryStatus)}`,
    );
  }

  if (input.menuReference !== undefined && !menuReference) {
    throw new Error("menuReference must not be empty when provided");
  }
  if (input.nameReference !== undefined && !nameReference) {
    throw new Error("nameReference must not be empty when provided");
  }
  if (input.positionReference !== undefined && !positionReference) {
    throw new Error("positionReference must not be empty when provided");
  }

  const providedReference = input.categoryReference?.trim() ?? "";
  if (input.categoryReference !== undefined && !providedReference) {
    throw new Error("categoryReference must not be empty when provided");
  }

  const categoryReference =
    providedReference || allocateCategoryReference();

  return {
    categoryReference,
    categoryStatus,
    ...(menuReference !== undefined && menuReference.length > 0
      ? { menuReference }
      : {}),
    ...(nameReference !== undefined && nameReference.length > 0
      ? { nameReference }
      : {}),
    ...(positionReference !== undefined && positionReference.length > 0
      ? { positionReference }
      : {}),
    ...(input.metadata !== undefined ? { metadata: input.metadata } : {}),
  };
}

function allocateMenuReference(): string {
  menuSequence += 1;
  return `menu-${menuSequence}`;
}

function allocateCategoryReference(): string {
  categorySequence += 1;
  return `menu-category-${categorySequence}`;
}

/** Test helper — reset opaque id sequences. */
export function resetMenuReferenceSequence(): void {
  menuSequence = 0;
  categorySequence = 0;
}
