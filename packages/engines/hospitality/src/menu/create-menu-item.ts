import type {
  CreateMenuItemInput,
  MenuItem,
  MenuItemStatus,
} from "./menu-item";
import { MENU_ITEM_STATUSES, isMenuItemStatus } from "./menu-item";

let itemSequence = 0;

/**
 * Build a checked MenuItem (in-memory — carta element existence only).
 * Does not order, price, send to kitchen, or sync TPV.
 */
export function createMenuItem(input: CreateMenuItemInput = {}): MenuItem {
  const menuReference = input.menuReference?.trim();
  const categoryReference = input.categoryReference?.trim();
  const nameReference = input.nameReference?.trim();
  const descriptionReference = input.descriptionReference?.trim();
  const priceReference = input.priceReference?.trim();
  const imageReference = input.imageReference?.trim();

  const itemStatus: MenuItemStatus =
    input.itemStatus ?? MENU_ITEM_STATUSES.Draft;
  if (!isMenuItemStatus(itemStatus)) {
    throw new Error(`Unknown menu item status: ${String(input.itemStatus)}`);
  }

  if (input.menuReference !== undefined && !menuReference) {
    throw new Error("menuReference must not be empty when provided");
  }
  if (input.categoryReference !== undefined && !categoryReference) {
    throw new Error("categoryReference must not be empty when provided");
  }
  if (input.nameReference !== undefined && !nameReference) {
    throw new Error("nameReference must not be empty when provided");
  }
  if (input.descriptionReference !== undefined && !descriptionReference) {
    throw new Error(
      "descriptionReference must not be empty when provided",
    );
  }
  if (input.priceReference !== undefined && !priceReference) {
    throw new Error("priceReference must not be empty when provided");
  }
  if (input.imageReference !== undefined && !imageReference) {
    throw new Error("imageReference must not be empty when provided");
  }

  const providedReference = input.itemReference?.trim() ?? "";
  if (input.itemReference !== undefined && !providedReference) {
    throw new Error("itemReference must not be empty when provided");
  }

  const itemReference = providedReference || allocateItemReference();

  return {
    itemReference,
    itemStatus,
    ...(menuReference !== undefined && menuReference.length > 0
      ? { menuReference }
      : {}),
    ...(categoryReference !== undefined && categoryReference.length > 0
      ? { categoryReference }
      : {}),
    ...(nameReference !== undefined && nameReference.length > 0
      ? { nameReference }
      : {}),
    ...(descriptionReference !== undefined &&
    descriptionReference.length > 0
      ? { descriptionReference }
      : {}),
    ...(priceReference !== undefined && priceReference.length > 0
      ? { priceReference }
      : {}),
    ...(imageReference !== undefined && imageReference.length > 0
      ? { imageReference }
      : {}),
    ...(input.metadata !== undefined ? { metadata: input.metadata } : {}),
  };
}

function allocateItemReference(): string {
  itemSequence += 1;
  return `menu-item-${itemSequence}`;
}

/** Test helper — reset opaque id sequence. */
export function resetMenuItemReferenceSequence(): void {
  itemSequence = 0;
}
