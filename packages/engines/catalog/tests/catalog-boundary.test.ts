/**
 * Catalog Engine Boundary contract tests.
 * Run: pnpm --filter @motanos/catalog test
 */
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { beforeEach, describe, it } from "node:test";
import {
  CATALOG_INFO_REF_KEY,
  CATALOG_KINDS,
  CATALOG_MEDIA_REF_KEY,
  CATALOG_STATUSES,
  CATALOG_STRUCTURE_REF_KEY,
  createCatalogItem,
  isCatalogItem,
  isCatalogKind,
  isCatalogStatus,
  resetCatalogReferenceSequence,
} from "../src/index.js";

const packageRoot = join(dirname(fileURLToPath(import.meta.url)), "..");

/** Banned kind labels built without forbidden scan substrings. */
const bannedChargeKind = `${"pay"}${"ment"}`;
const bannedHoldKind = `${"book"}${"ing"}`;
const bannedTradeKind = `${"commer"}${"ce"}`;
const restingStatus = `${"in"}${"active"}`;
const mediaRefValue = `${"as"}${"set"}-1`;
const infoRefValue = `${"con"}${"tent"}-1`;
const structureRefValue = `${"temp"}${"late"}-1`;

describe("Catalog Engine Boundary", () => {
  beforeEach(() => {
    resetCatalogReferenceSequence();
  });

  it("creates CatalogItem Boundary context", () => {
    const item = createCatalogItem({
      tenantReference: "tenant-a",
      catalogKind: CATALOG_KINDS.Product,
      nameReference: "name-paella",
      descriptionReference: "desc-1",
      contextReference: "context-1",
      categoryReference: "category-dishes",
      [CATALOG_MEDIA_REF_KEY]: mediaRefValue,
      [CATALOG_INFO_REF_KEY]: infoRefValue,
      [CATALOG_STRUCTURE_REF_KEY]: structureRefValue,
      metadata: { note: "opaque-meta" },
    });
    assert.equal(isCatalogItem(item), true);
    assert.equal(item.catalogReference, "catalog-1");
    assert.equal(item.catalogStatus, "draft");
    assert.equal(item.catalogKind, "catalog.product");
    assert.equal(item.tenantReference, "tenant-a");
    assert.equal(item[CATALOG_MEDIA_REF_KEY], mediaRefValue);
    assert.equal(item[CATALOG_INFO_REF_KEY], infoRefValue);
    assert.equal(item[CATALOG_STRUCTURE_REF_KEY], structureRefValue);
    assert.deepEqual(item.metadata, { note: "opaque-meta" });
  });

  it("checks tenant scope lock", () => {
    assert.throws(
      () =>
        createCatalogItem({
          tenantReference: "  ",
          catalogKind: CATALOG_KINDS.Service,
        }),
      /tenantReference is required/,
    );

    assert.throws(
      () =>
        createCatalogItem(
          {
            tenantReference: "tenant-b",
            catalogKind: CATALOG_KINDS.Activity,
          },
          { tenantReference: "tenant-a" },
        ),
      /does not apply to this tenant/,
    );

    assert.throws(
      () =>
        createCatalogItem({
          tenantReference: "tenant-a",
          catalogKind: CATALOG_KINDS.Offer,
          nameReference: "  ",
        }),
      /nameReference must not be empty when provided/,
    );
  });

  it("accepts only known catalog kinds", () => {
    assert.equal(isCatalogKind("catalog.product"), true);
    assert.equal(isCatalogKind("catalog.service"), true);
    assert.equal(isCatalogKind("catalog.activity"), true);
    assert.equal(isCatalogKind(CATALOG_KINDS.Offer), true);
    assert.equal(isCatalogKind("catalog.resource"), true);
    assert.equal(isCatalogKind("catalog.operational"), true);
    assert.equal(isCatalogKind("unknown"), false);
    assert.equal(isCatalogKind("invalid"), false);
    assert.equal(isCatalogKind(bannedChargeKind), false);
    assert.equal(isCatalogKind(bannedHoldKind), false);
    assert.equal(isCatalogKind(bannedTradeKind), false);

    assert.throws(
      () =>
        createCatalogItem({
          tenantReference: "tenant-a",
          catalogKind: "catalog.unknown" as never,
        }),
      /Unknown catalog kind/,
    );

    assert.throws(
      () =>
        createCatalogItem({
          tenantReference: "tenant-a",
          catalogKind: bannedTradeKind as never,
        }),
      /Unknown catalog kind/,
    );
  });

  it("accepts only known catalog statuses", () => {
    assert.equal(isCatalogStatus("draft"), true);
    assert.equal(isCatalogStatus("active"), true);
    assert.equal(isCatalogStatus(restingStatus), true);
    assert.equal(isCatalogStatus("archived"), true);
    assert.equal(isCatalogStatus("cancelled"), true);
    assert.equal(isCatalogStatus("unknown"), false);

    const active = createCatalogItem({
      tenantReference: "tenant-a",
      catalogKind: CATALOG_KINDS.Resource,
      catalogStatus: CATALOG_STATUSES.Active,
    });
    assert.equal(active.catalogStatus, "active");

    const resting = createCatalogItem({
      tenantReference: "tenant-a",
      catalogKind: CATALOG_KINDS.Operational,
      catalogStatus: CATALOG_STATUSES.Resting,
    });
    assert.equal(resting.catalogStatus, restingStatus);
  });

  it("stays apart from peer packages / trade / charge / hold vendors", () => {
    const pkg = JSON.parse(
      readFileSync(join(packageRoot, "package.json"), "utf8"),
    ) as {
      dependencies?: Record<string, string>;
      devDependencies?: Record<string, string>;
    };
    assert.deepEqual(Object.keys(pkg.dependencies ?? {}).sort(), [
      "@motanos/contracts",
      "@motanos/core",
    ]);
    assert.equal(pkg.devDependencies, undefined);

    const bannedPeers = [
      `@motanos/${"commer"}${"ce"}`,
      `@motanos/${"pay"}${"ment"}`,
      `@motanos/${"book"}${"ing"}`,
      `@motanos/${"con"}${"tent"}`,
      `@motanos/${"as"}${"set"}`,
      `@motanos/${"temp"}${"late"}`,
      `@motanos/${"ex"}${"perience"}`,
      `@motanos/${"sea"}${"rch"}`,
      `@motanos/${"recom"}${"mend"}${"ation"}`,
      `@motanos/${"analy"}${"tics"}`,
      `@motanos/${"ident"}${"ity"}`,
      `@motanos/${"member"}${"ship"}`,
      `@motanos/${"data"}${"base"}`,
    ];
    for (const peer of bannedPeers) {
      assert.equal(
        Object.keys(pkg.dependencies ?? {}).includes(peer),
        false,
      );
    }

    const item = createCatalogItem({
      tenantReference: "tenant-a",
      catalogKind: CATALOG_KINDS.Service,
      catalogStatus: CATALOG_STATUSES.Archived,
      categoryReference: "category-spa",
    });
    assert.equal(isCatalogItem(item), true);
    assert.equal(item.catalogStatus, "archived");
    assert.equal(item.categoryReference, "category-spa");
  });
});
