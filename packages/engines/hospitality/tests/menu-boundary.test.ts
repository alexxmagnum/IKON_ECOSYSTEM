/**
 * Hospitality Menu Management contract tests.
 * Run: pnpm --filter @motanos/hospitality test
 */
import assert from "node:assert/strict";
import { readFileSync, readdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { beforeEach, describe, it } from "node:test";
import {
  MENU_CATEGORY_STATUSES,
  MENU_ITEM_STATUSES,
  MENU_KINDS,
  MENU_STATUSES,
  createMenu,
  createMenuCategory,
  createMenuItem,
  isHospitalityMenu,
  isMenuCategory,
  isMenuItem,
  isMenuItemStatus,
  isMenuKind,
  isMenuStatus,
  resetMenuItemReferenceSequence,
  resetMenuReferenceSequence,
} from "../src/public.js";

const packageRoot = join(dirname(fileURLToPath(import.meta.url)), "..");
const menuRoot = join(packageRoot, "src", "menu");
const hospitalityBusiness = "hospitality-a";
const otherHospitalityBusiness = "hospitality-b";

describe("Hospitality Menu Boundary", () => {
  beforeEach(() => {
    resetMenuReferenceSequence();
    resetMenuItemReferenceSequence();
  });

  it("creates Menu, MenuCategory, and MenuItem", () => {
    const menu = createMenu({
      menuKind: MENU_KINDS.Restaurant,
      hospitalityReference: hospitalityBusiness,
      contextReference: "context-1",
      nameReference: "name-carta",
      metadata: { note: "opaque-meta" },
    });
    assert.equal(isHospitalityMenu(menu), true);
    assert.equal(menu.menuReference, "menu-1");
    assert.equal(menu.menuStatus, "draft");
    assert.equal(menu.menuKind, "menu.restaurant");
    assert.equal(menu.hospitalityReference, hospitalityBusiness);

    const category = createMenuCategory({
      menuReference: menu.menuReference,
      nameReference: "name-entrantes",
      positionReference: "position-1",
      categoryStatus: MENU_CATEGORY_STATUSES.Active,
    });
    assert.equal(isMenuCategory(category), true);
    assert.equal(category.categoryReference, "menu-category-1");
    assert.equal(category.categoryStatus, "active");
    assert.equal(category.menuReference, menu.menuReference);

    const item = createMenuItem({
      menuReference: menu.menuReference,
      categoryReference: category.categoryReference,
      nameReference: "name-hamburguesa",
      descriptionReference: "desc-1",
      priceReference: "price-1",
      imageReference: "image-1",
      itemStatus: MENU_ITEM_STATUSES.Available,
    });
    assert.equal(isMenuItem(item), true);
    assert.equal(item.itemReference, "menu-item-1");
    assert.equal(item.itemStatus, "available");
    assert.equal(item.priceReference, "price-1");
    assert.equal(item.imageReference, "image-1");
  });

  it("checks hospitality business isolation", () => {
    assert.throws(
      () =>
        createMenu({
          menuKind: MENU_KINDS.Bar,
          hospitalityReference: "  ",
        }),
      /hospitalityReference must not be empty when provided/,
    );

    assert.throws(
      () =>
        createMenu(
          {
            menuKind: MENU_KINDS.Club,
            hospitalityReference: otherHospitalityBusiness,
          },
          { hospitalityReference: hospitalityBusiness },
        ),
      /does not apply to this hospitality business/,
    );

    assert.throws(
      () =>
        createMenu({
          menuKind: MENU_KINDS.Hotel,
          nameReference: "  ",
        }),
      /nameReference must not be empty when provided/,
    );
  });

  it("accepts only known menu kinds", () => {
    assert.equal(isMenuKind("menu.restaurant"), true);
    assert.equal(isMenuKind("menu.bar"), true);
    assert.equal(isMenuKind("menu.club"), true);
    assert.equal(isMenuKind("menu.hotel"), true);
    assert.equal(isMenuKind("menu.seasonal"), true);
    assert.equal(isMenuKind("menu.internal"), true);
    assert.equal(isMenuKind("order"), false);
    assert.equal(isMenuKind("payment"), false);
    assert.equal(isMenuKind("kitchen"), false);
    assert.equal(isMenuKind("inventory"), false);

    assert.throws(
      () =>
        createMenu({
          menuKind: "menu.unknown" as never,
        }),
      /Unknown menu kind/,
    );

    assert.throws(
      () =>
        createMenu({
          menuKind: "order" as never,
        }),
      /Unknown menu kind/,
    );
  });

  it("accepts only known menu and item statuses", () => {
    assert.equal(isMenuStatus("draft"), true);
    assert.equal(isMenuStatus("active"), true);
    assert.equal(isMenuStatus("inactive"), true);
    assert.equal(isMenuStatus("available"), true);
    assert.equal(isMenuStatus("archived"), true);
    assert.equal(isMenuStatus("cancelled"), true);
    assert.equal(isMenuStatus("unknown"), false);

    assert.equal(isMenuItemStatus("draft"), true);
    assert.equal(isMenuItemStatus("active"), true);
    assert.equal(isMenuItemStatus("available"), true);
    assert.equal(isMenuItemStatus("unavailable"), true);
    assert.equal(isMenuItemStatus("archived"), true);
    assert.equal(isMenuItemStatus("cancelled"), true);
    assert.equal(isMenuItemStatus("occupied"), false);

    const active = createMenu({
      menuKind: MENU_KINDS.Restaurant,
      menuStatus: MENU_STATUSES.Active,
    });
    assert.equal(active.menuStatus, "active");

    const unavailable = createMenuItem({
      itemStatus: MENU_ITEM_STATUSES.Unavailable,
    });
    assert.equal(unavailable.itemStatus, "unavailable");
  });

  it("stays apart from order / kitchen / payment / inventory / pricing / QR logic", () => {
    const menuSources = readdirSync(menuRoot)
      .filter((name) => name.endsWith(".ts"))
      .map((name) => readFileSync(join(menuRoot, name), "utf8"))
      .join("\n");

    assert.equal(menuSources.includes("createOrder"), false);
    assert.equal(menuSources.includes("sendKitchen"), false);
    assert.equal(menuSources.includes("processPayment"), false);
    assert.equal(menuSources.includes("syncInventory"), false);
    assert.equal(menuSources.includes("calculatePrice"), false);
    assert.equal(menuSources.includes("publishMenu"), false);
    assert.equal(menuSources.includes("generateQR"), false);
    assert.equal(menuSources.includes("syncTPV"), false);
    assert.equal(menuSources.includes("calculateCost"), false);
    assert.equal(menuSources.includes("orderItem"), false);

    const pkg = JSON.parse(
      readFileSync(join(packageRoot, "package.json"), "utf8"),
    ) as {
      dependencies?: Record<string, string>;
    };
    assert.deepEqual(Object.keys(pkg.dependencies ?? {}).sort(), [
      "@motanos/contracts",
      "@motanos/core",
    ]);
    assert.equal(
      Object.keys(pkg.dependencies ?? {}).includes("@motanos/pricing"),
      false,
    );

    const menu = createMenu({
      menuKind: MENU_KINDS.Seasonal,
      menuStatus: MENU_STATUSES.Archived,
      hospitalityReference: hospitalityBusiness,
      parentMenuReference: "menu-parent-1",
    });
    assert.equal(isHospitalityMenu(menu), true);
    assert.equal(menu.menuStatus, "archived");
    assert.equal(menu.parentMenuReference, "menu-parent-1");
  });
});
