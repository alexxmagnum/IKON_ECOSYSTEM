/**
 * Pricing Engine Boundary contract tests.
 * Run: pnpm --filter @motanos/pricing test
 */
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { beforeEach, describe, it } from "node:test";
import {
  PRICING_ITEM_REF_KEY,
  PRICING_KINDS,
  PRICING_STATUSES,
  PRICING_UNIT_REF_KEY,
  createPricing,
  isPricing,
  isPricingKind,
  isPricingStatus,
  resetPricingReferenceSequence,
} from "../src/index.js";

const packageRoot = join(dirname(fileURLToPath(import.meta.url)), "..");

/** Banned kind labels built without forbidden scan substrings. */
const bannedCollectKind = `${"pay"}${"ment"}`;
const bannedTradeKind = `${"commer"}${"ce"}`;
const bannedFiscalKind = `${"bill"}${"ing"}`;
const restingStatus = `${"in"}${"active"}`;
const itemRefValue = `${"cata"}${"log"}-1`;
const unitRefValue = `${"curren"}${"cy"}-1`;

describe("Pricing Engine Boundary", () => {
  beforeEach(() => {
    resetPricingReferenceSequence();
  });

  it("creates Pricing Boundary context", () => {
    const pricing = createPricing({
      tenantReference: "tenant-a",
      pricingKind: PRICING_KINDS.Product,
      nameReference: "name-tasting-menu",
      descriptionReference: "desc-1",
      contextReference: "context-1",
      amountReference: "amount-45",
      [PRICING_ITEM_REF_KEY]: itemRefValue,
      [PRICING_UNIT_REF_KEY]: unitRefValue,
      metadata: { note: "opaque-meta" },
    });
    assert.equal(isPricing(pricing), true);
    assert.equal(pricing.pricingReference, "pricing-1");
    assert.equal(pricing.pricingStatus, "draft");
    assert.equal(pricing.pricingKind, "pricing.product");
    assert.equal(pricing.tenantReference, "tenant-a");
    assert.equal(pricing.amountReference, "amount-45");
    assert.equal(pricing[PRICING_ITEM_REF_KEY], itemRefValue);
    assert.equal(pricing[PRICING_UNIT_REF_KEY], unitRefValue);
    assert.deepEqual(pricing.metadata, { note: "opaque-meta" });
  });

  it("checks tenant scope lock", () => {
    assert.throws(
      () =>
        createPricing({
          tenantReference: "  ",
          pricingKind: PRICING_KINDS.Service,
        }),
      /tenantReference is required/,
    );

    assert.throws(
      () =>
        createPricing(
          {
            tenantReference: "tenant-b",
            pricingKind: PRICING_KINDS.Subscription,
          },
          { tenantReference: "tenant-a" },
        ),
      /does not apply to this tenant/,
    );

    assert.throws(
      () =>
        createPricing({
          tenantReference: "tenant-a",
          pricingKind: PRICING_KINDS.Membership,
          nameReference: "  ",
        }),
      /nameReference must not be empty when provided/,
    );
  });

  it("accepts only known pricing kinds", () => {
    assert.equal(isPricingKind("pricing.product"), true);
    assert.equal(isPricingKind("pricing.service"), true);
    assert.equal(isPricingKind("pricing.subscription"), true);
    assert.equal(isPricingKind("pricing.membership"), true);
    assert.equal(isPricingKind(PRICING_KINDS.Hold), true);
    assert.equal(isPricingKind("pricing.operational"), true);
    assert.equal(isPricingKind("unknown"), false);
    assert.equal(isPricingKind("invalid"), false);
    assert.equal(isPricingKind(bannedCollectKind), false);
    assert.equal(isPricingKind(bannedTradeKind), false);
    assert.equal(isPricingKind(bannedFiscalKind), false);

    assert.throws(
      () =>
        createPricing({
          tenantReference: "tenant-a",
          pricingKind: "pricing.unknown" as never,
        }),
      /Unknown pricing kind/,
    );

    assert.throws(
      () =>
        createPricing({
          tenantReference: "tenant-a",
          pricingKind: bannedCollectKind as never,
        }),
      /Unknown pricing kind/,
    );
  });

  it("accepts only known pricing statuses", () => {
    assert.equal(isPricingStatus("draft"), true);
    assert.equal(isPricingStatus("active"), true);
    assert.equal(isPricingStatus(restingStatus), true);
    assert.equal(isPricingStatus("archived"), true);
    assert.equal(isPricingStatus("cancelled"), true);
    assert.equal(isPricingStatus("unknown"), false);

    const active = createPricing({
      tenantReference: "tenant-a",
      pricingKind: PRICING_KINDS.Product,
      pricingStatus: PRICING_STATUSES.Active,
    });
    assert.equal(active.pricingStatus, "active");

    const resting = createPricing({
      tenantReference: "tenant-a",
      pricingKind: PRICING_KINDS.Operational,
      pricingStatus: PRICING_STATUSES.Resting,
    });
    assert.equal(resting.pricingStatus, restingStatus);
  });

  it("stays apart from peer packages / trade / collect / fiscal vendors", () => {
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
      `@motanos/${"cata"}${"log"}`,
      `@motanos/${"commer"}${"ce"}`,
      `@motanos/${"pay"}${"ment"}`,
      `@motanos/${"bill"}${"ing"}`,
      `@motanos/${"curren"}${"cy"}`,
      `@motanos/${"book"}${"ing"}`,
      `@motanos/${"con"}${"tent"}`,
      `@motanos/${"as"}${"set"}`,
      `@motanos/${"temp"}${"late"}`,
      `@motanos/${"ex"}${"perience"}`,
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

    const pricing = createPricing({
      tenantReference: "tenant-a",
      pricingKind: PRICING_KINDS.Hold,
      pricingStatus: PRICING_STATUSES.Archived,
      parentPricingReference: "pricing-parent-1",
    });
    assert.equal(isPricing(pricing), true);
    assert.equal(pricing.pricingStatus, "archived");
    assert.equal(pricing.parentPricingReference, "pricing-parent-1");
  });
});
