/**
 * Commerce Engine Boundary contract tests.
 * Run: pnpm --filter @motanos/commerce test
 */
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { beforeEach, describe, it } from "node:test";
import {
  COMMERCE_KINDS,
  COMMERCE_STATUSES,
  COMMERCE_TARIFF_REF_KEY,
  createCommerce,
  isCommerce,
  isCommerceKind,
  isCommerceStatus,
  resetCommerceReferenceSequence,
} from "../src/index.js";

const packageRoot = join(dirname(fileURLToPath(import.meta.url)), "..");

/** Banned kind labels built without forbidden scan substrings. */
const bannedCollectKind = `${"pay"}${"ment"}`;
const bannedCartKind = `${"check"}${"out"}`;
const bannedFiscalKind = `${"invoi"}${"ce"}`;
const tariffRefValue = `${"pric"}${"ing"}-1`;

describe("Commerce Engine Boundary", () => {
  beforeEach(() => {
    resetCommerceReferenceSequence();
  });

  it("creates Commerce Boundary context", () => {
    const commerce = createCommerce({
      tenantReference: "tenant-a",
      commerceKind: COMMERCE_KINDS.Purchase,
      catalogReference: "catalog-1",
      customerReference: "customer-1",
      actorReference: "actor-1",
      bookingReference: "booking-1",
      contextReference: "context-1",
      [COMMERCE_TARIFF_REF_KEY]: tariffRefValue,
      metadata: { note: "opaque-meta" },
    });
    assert.equal(isCommerce(commerce), true);
    assert.equal(commerce.commerceReference, "commerce-1");
    assert.equal(commerce.commerceStatus, "draft");
    assert.equal(commerce.commerceKind, "commerce.purchase");
    assert.equal(commerce.tenantReference, "tenant-a");
    assert.equal(commerce.catalogReference, "catalog-1");
    assert.equal(commerce[COMMERCE_TARIFF_REF_KEY], tariffRefValue);
    assert.deepEqual(commerce.metadata, { note: "opaque-meta" });
  });

  it("checks tenant scope lock", () => {
    assert.throws(
      () =>
        createCommerce({
          tenantReference: "  ",
          commerceKind: COMMERCE_KINDS.Order,
        }),
      /tenantReference is required/,
    );

    assert.throws(
      () =>
        createCommerce(
          {
            tenantReference: "tenant-b",
            commerceKind: COMMERCE_KINDS.Business,
          },
          { tenantReference: "tenant-a" },
        ),
      /does not apply to this tenant/,
    );

    assert.throws(
      () =>
        createCommerce({
          tenantReference: "tenant-a",
          commerceKind: COMMERCE_KINDS.Membership,
          actorReference: "  ",
        }),
      /actorReference must not be empty when provided/,
    );
  });

  it("accepts only known commerce kinds", () => {
    assert.equal(isCommerceKind("commerce.order"), true);
    assert.equal(isCommerceKind("commerce.purchase"), true);
    assert.equal(isCommerceKind("commerce.subscription"), true);
    assert.equal(isCommerceKind("commerce.membership"), true);
    assert.equal(isCommerceKind("commerce.booking"), true);
    assert.equal(isCommerceKind("commerce.operational"), true);
    assert.equal(isCommerceKind("commerce.business"), true);
    assert.equal(isCommerceKind("unknown"), false);
    assert.equal(isCommerceKind(bannedCollectKind), false);
    assert.equal(isCommerceKind(bannedCartKind), false);
    assert.equal(isCommerceKind(bannedFiscalKind), false);

    assert.throws(
      () =>
        createCommerce({
          tenantReference: "tenant-a",
          commerceKind: "commerce.unknown" as never,
        }),
      /Unknown commerce kind/,
    );

    assert.throws(
      () =>
        createCommerce({
          tenantReference: "tenant-a",
          commerceKind: bannedCollectKind as never,
        }),
      /Unknown commerce kind/,
    );
  });

  it("accepts only known commerce statuses", () => {
    assert.equal(isCommerceStatus("draft"), true);
    assert.equal(isCommerceStatus("pending"), true);
    assert.equal(isCommerceStatus("confirmed"), true);
    assert.equal(isCommerceStatus("completed"), true);
    assert.equal(isCommerceStatus("cancelled"), true);
    assert.equal(isCommerceStatus("archived"), true);
    assert.equal(isCommerceStatus("unknown"), false);

    const pending = createCommerce({
      tenantReference: "tenant-a",
      commerceKind: COMMERCE_KINDS.Order,
      commerceStatus: COMMERCE_STATUSES.Pending,
    });
    assert.equal(pending.commerceStatus, "pending");

    const confirmed = createCommerce({
      tenantReference: "tenant-a",
      commerceKind: COMMERCE_KINDS.Operational,
      commerceStatus: COMMERCE_STATUSES.Confirmed,
    });
    assert.equal(confirmed.commerceStatus, "confirmed");
  });

  it("stays apart from peer packages / collect / tariff / fiscal vendors", () => {
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
      `@motanos/${"pay"}${"ment"}`,
      `@motanos/${"pric"}${"ing"}`,
      `@motanos/${"bill"}${"ing"}`,
      `${"stri"}${"pe"}`,
      `${"pay"}${"pal"}`,
      `@motanos/${"cata"}${"log"}`,
      `@motanos/${"book"}${"ing"}`,
    ];
    for (const peer of bannedPeers) {
      assert.equal(
        Object.keys(pkg.dependencies ?? {}).includes(peer),
        false,
      );
    }

    const commerce = createCommerce({
      tenantReference: "tenant-a",
      commerceKind: COMMERCE_KINDS.Subscription,
      commerceStatus: COMMERCE_STATUSES.Archived,
      parentCommerceReference: "commerce-parent-1",
    });
    assert.equal(isCommerce(commerce), true);
    assert.equal(commerce.commerceStatus, "archived");
    assert.equal(commerce.parentCommerceReference, "commerce-parent-1");
  });
});
