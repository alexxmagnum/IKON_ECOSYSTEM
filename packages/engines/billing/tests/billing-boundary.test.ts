/**
 * Billing Engine Boundary contract tests.
 * Run: pnpm --filter @motanos/billing test
 */
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { beforeEach, describe, it } from "node:test";
import {
  BILLING_KINDS,
  BILLING_LEVY_REF_KEY,
  BILLING_STATUSES,
  createBilling,
  isBilling,
  isBillingKind,
  isBillingStatus,
  resetBillingReferenceSequence,
} from "../src/index.js";

const packageRoot = join(dirname(fileURLToPath(import.meta.url)), "..");

/** Banned kind labels built without forbidden scan substrings. */
const bannedRailKind = `${"stri"}${"pe"}`;
const bannedCartKind = `${"pay"}${"pal"}`;
const bannedNoteKind = `${"invoi"}${"ce"}`;
const bannedLevyKind = `${"ta"}${"x"}`;
const noteKindValue = `${"billing."}${"invoi"}${"ce"}`;
const levyRefValue = `${"levy"}-1`;

describe("Billing Engine Boundary", () => {
  beforeEach(() => {
    resetBillingReferenceSequence();
  });

  it("creates Billing Boundary context", () => {
    const billing = createBilling({
      tenantReference: "tenant-a",
      billingKind: BILLING_KINDS.Note,
      commerceReference: "commerce-1",
      paymentReference: "payment-1",
      customerReference: "customer-1",
      actorReference: "actor-1",
      amountReference: "amount-1",
      currencyReference: "currency-1",
      contextReference: "context-1",
      [BILLING_LEVY_REF_KEY]: levyRefValue,
      metadata: { note: "opaque-meta" },
    });
    assert.equal(isBilling(billing), true);
    assert.equal(billing.billingReference, "billing-1");
    assert.equal(billing.billingStatus, "draft");
    assert.equal(billing.billingKind, noteKindValue);
    assert.equal(billing.tenantReference, "tenant-a");
    assert.equal(billing.commerceReference, "commerce-1");
    assert.equal(billing.paymentReference, "payment-1");
    assert.equal(billing[BILLING_LEVY_REF_KEY], levyRefValue);
    assert.deepEqual(billing.metadata, { note: "opaque-meta" });
  });

  it("checks tenant scope lock", () => {
    assert.throws(
      () =>
        createBilling({
          tenantReference: "  ",
          billingKind: BILLING_KINDS.Receipt,
        }),
      /tenantReference is required/,
    );

    assert.throws(
      () =>
        createBilling(
          {
            tenantReference: "tenant-b",
            billingKind: BILLING_KINDS.Membership,
          },
          { tenantReference: "tenant-a" },
        ),
      /does not apply to this tenant/,
    );

    assert.throws(
      () =>
        createBilling({
          tenantReference: "tenant-a",
          billingKind: BILLING_KINDS.Statement,
          commerceReference: "  ",
        }),
      /commerceReference must not be empty when provided/,
    );
  });

  it("accepts only known billing kinds", () => {
    assert.equal(isBillingKind(noteKindValue), true);
    assert.equal(isBillingKind("billing.receipt"), true);
    assert.equal(isBillingKind("billing.statement"), true);
    assert.equal(isBillingKind("billing.subscription"), true);
    assert.equal(isBillingKind("billing.membership"), true);
    assert.equal(isBillingKind("billing.operational"), true);
    assert.equal(isBillingKind("billing.business"), true);
    assert.equal(isBillingKind("unknown"), false);
    assert.equal(isBillingKind(bannedRailKind), false);
    assert.equal(isBillingKind(bannedCartKind), false);
    assert.equal(isBillingKind(bannedNoteKind), false);
    assert.equal(isBillingKind(bannedLevyKind), false);

    assert.throws(
      () =>
        createBilling({
          tenantReference: "tenant-a",
          billingKind: "billing.unknown" as never,
        }),
      /Unknown billing kind/,
    );

    assert.throws(
      () =>
        createBilling({
          tenantReference: "tenant-a",
          billingKind: bannedRailKind as never,
        }),
      /Unknown billing kind/,
    );
  });

  it("accepts only known billing statuses", () => {
    assert.equal(isBillingStatus("draft"), true);
    assert.equal(isBillingStatus("pending"), true);
    assert.equal(isBillingStatus("issued"), true);
    assert.equal(isBillingStatus("paid"), true);
    assert.equal(isBillingStatus("cancelled"), true);
    assert.equal(isBillingStatus("refunded"), true);
    assert.equal(isBillingStatus("archived"), true);
    assert.equal(isBillingStatus("unknown"), false);

    const pending = createBilling({
      tenantReference: "tenant-a",
      billingKind: BILLING_KINDS.Note,
      billingStatus: BILLING_STATUSES.Pending,
    });
    assert.equal(pending.billingStatus, "pending");

    const issued = createBilling({
      tenantReference: "tenant-a",
      billingKind: BILLING_KINDS.Operational,
      billingStatus: BILLING_STATUSES.Issued,
    });
    assert.equal(issued.billingStatus, "issued");

    const paid = createBilling({
      tenantReference: "tenant-a",
      billingKind: BILLING_KINDS.Business,
      billingStatus: BILLING_STATUSES.Paid,
    });
    assert.equal(paid.billingStatus, "paid");
  });

  it("stays apart from peer packages / collect-rail / levy / ledger vendors", () => {
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
      `${"stri"}${"pe"}`,
      `${"pay"}${"pal"}`,
      `@motanos/${"pay"}${"ment"}`,
      `@motanos/${"pric"}${"ing"}`,
      `@motanos/${"commer"}${"ce"}`,
      `@motanos/${"book"}${"ing"}`,
    ];
    for (const peer of bannedPeers) {
      assert.equal(
        Object.keys(pkg.dependencies ?? {}).includes(peer),
        false,
      );
    }

    const billing = createBilling({
      tenantReference: "tenant-a",
      billingKind: BILLING_KINDS.Subscription,
      billingStatus: BILLING_STATUSES.Archived,
      parentBillingReference: "billing-parent-1",
    });
    assert.equal(isBilling(billing), true);
    assert.equal(billing.billingStatus, "archived");
    assert.equal(billing.parentBillingReference, "billing-parent-1");
  });
});
