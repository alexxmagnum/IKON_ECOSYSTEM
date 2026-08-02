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
  createCommerceOffer,
  isCommerceKind,
  isCommerceOffer,
  isCommerceStatus,
  resetCommerceReferenceSequence,
} from "../src/index.js";

const packageRoot = join(dirname(fileURLToPath(import.meta.url)), "..");

describe("Commerce Engine Boundary", () => {
  beforeEach(() => {
    resetCommerceReferenceSequence();
  });

  it("creates Commerce Offer Boundary context", () => {
    const offer = createCommerceOffer({
      tenantReference: "tenant-a",
      commerceKind: COMMERCE_KINDS.Offer,
      nameReference: "name-1",
      descriptionReference: "desc-1",
      experienceReference: "experience-1",
      priceReference: "price-1",
    });
    assert.equal(isCommerceOffer(offer), true);
    assert.equal(offer.commerceReference, "commerce-1");
    assert.equal(offer.commerceStatus, "draft");
    assert.equal(offer.commerceKind, "commerce.offer");
    assert.equal(offer.tenantReference, "tenant-a");
    assert.equal(offer.priceReference, "price-1");
  });

  it("validates tenant isolation", () => {
    assert.throws(
      () =>
        createCommerceOffer({
          tenantReference: "  ",
          commerceKind: COMMERCE_KINDS.Product,
        }),
      /tenantReference is required/,
    );

    assert.throws(
      () =>
        createCommerceOffer(
          {
            tenantReference: "tenant-b",
            commerceKind: COMMERCE_KINDS.Service,
          },
          { tenantReference: "tenant-a" },
        ),
      /does not apply to this tenant/,
    );

    assert.throws(
      () =>
        createCommerceOffer({
          tenantReference: "tenant-a",
          commerceKind: COMMERCE_KINDS.Registration,
          nameReference: "  ",
        }),
      /nameReference must not be empty when provided/,
    );
  });

  it("accepts only known commerce kinds", () => {
    assert.equal(isCommerceKind("commerce.offer"), true);
    assert.equal(isCommerceKind("commerce.product"), true);
    assert.equal(isCommerceKind("commerce.service"), true);
    assert.equal(isCommerceKind("commerce.registration"), true);
    assert.equal(isCommerceKind("commerce.membership"), true);
    assert.equal(isCommerceKind("commerce.operational"), true);
    assert.equal(isCommerceKind("commerce.unknown"), false);

    assert.throws(
      () =>
        createCommerceOffer({
          tenantReference: "tenant-a",
          commerceKind: "commerce.unknown" as never,
        }),
      /Unknown commerce kind/,
    );
  });

  it("accepts only known commerce statuses", () => {
    assert.equal(isCommerceStatus("draft"), true);
    assert.equal(isCommerceStatus("active"), true);
    assert.equal(isCommerceStatus("paused"), true);
    assert.equal(isCommerceStatus("expired"), true);
    assert.equal(isCommerceStatus("archived"), true);
    assert.equal(isCommerceStatus("cancelled"), true);
    assert.equal(isCommerceStatus("unknown"), false);

    const active = createCommerceOffer({
      tenantReference: "tenant-a",
      commerceKind: COMMERCE_KINDS.Membership,
      commerceStatus: COMMERCE_STATUSES.Active,
    });
    assert.equal(active.commerceStatus, "active");

    const paused = createCommerceOffer({
      tenantReference: "tenant-a",
      commerceKind: COMMERCE_KINDS.Operational,
      commerceStatus: COMMERCE_STATUSES.Paused,
    });
    assert.equal(paused.commerceStatus, "paused");
  });

  it("stays separated from charge-rail / fiscal / plan packages", () => {
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
    assert.equal(
      Object.keys(pkg.dependencies ?? {}).includes("@motanos/experience"),
      false,
    );
    assert.equal(
      Object.keys(pkg.dependencies ?? {}).includes("@motanos/membership"),
      false,
    );
    assert.equal(
      Object.keys(pkg.dependencies ?? {}).includes("@motanos/booking"),
      false,
    );
    assert.equal(
      Object.keys(pkg.dependencies ?? {}).includes("@motanos/auth"),
      false,
    );

    const offer = createCommerceOffer({
      tenantReference: "tenant-a",
      commerceKind: COMMERCE_KINDS.Offer,
      commerceStatus: COMMERCE_STATUSES.Expired,
      bookingReference: "bk-1",
    });
    assert.equal(isCommerceOffer(offer), true);
    assert.equal(offer.commerceStatus, "expired");
    assert.equal(offer.bookingReference, "bk-1");
  });
});
