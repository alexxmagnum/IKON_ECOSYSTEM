/**
 * Currency Engine Boundary contract tests.
 * Run: pnpm --filter @motanos/currency test
 */
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { beforeEach, describe, it } from "node:test";
import {
  CURRENCY_KINDS,
  CURRENCY_STATUSES,
  createCurrency,
  isCurrency,
  isCurrencyKind,
  isCurrencyStatus,
  resetCurrencyReferenceSequence,
} from "../src/index.js";

const packageRoot = join(dirname(fileURLToPath(import.meta.url)), "..");

describe("Currency Engine Boundary", () => {
  beforeEach(() => {
    resetCurrencyReferenceSequence();
  });

  it("creates Currency Boundary context", () => {
    const currency = createCurrency({
      tenantReference: "tenant-a",
      currencyKind: CURRENCY_KINDS.Primary,
      codeReference: "code-EUR",
      symbolReference: "symbol-euro",
      localeReference: "locale-es",
      regionReference: "region-ES",
      nameReference: "name-euro",
    });
    assert.equal(isCurrency(currency), true);
    assert.equal(currency.currencyReference, "currency-1");
    assert.equal(currency.currencyStatus, "draft");
    assert.equal(currency.currencyKind, "currency.primary");
    assert.equal(currency.tenantReference, "tenant-a");
    assert.equal(currency.codeReference, "code-EUR");
  });

  it("checks tenant isolation", () => {
    assert.throws(
      () =>
        createCurrency({
          tenantReference: "  ",
          currencyKind: CURRENCY_KINDS.Supported,
        }),
      /tenantReference is required/,
    );

    assert.throws(
      () =>
        createCurrency(
          {
            tenantReference: "tenant-b",
            currencyKind: CURRENCY_KINDS.Display,
          },
          { tenantReference: "tenant-a" },
        ),
      /does not apply to this tenant/,
    );

    assert.throws(
      () =>
        createCurrency({
          tenantReference: "tenant-a",
          currencyKind: CURRENCY_KINDS.Settlement,
          codeReference: "  ",
        }),
      /codeReference must not be empty when provided/,
    );
  });

  it("accepts only known currency kinds", () => {
    assert.equal(isCurrencyKind("currency.primary"), true);
    assert.equal(isCurrencyKind("currency.supported"), true);
    assert.equal(isCurrencyKind("currency.operational"), true);
    assert.equal(isCurrencyKind("currency.display"), true);
    assert.equal(isCurrencyKind("currency.settlement"), true);
    assert.equal(isCurrencyKind("currency.unknown"), false);

    assert.throws(
      () =>
        createCurrency({
          tenantReference: "tenant-a",
          currencyKind: "currency.unknown" as never,
        }),
      /Unknown currency kind/,
    );
  });

  it("accepts only known currency statuses", () => {
    assert.equal(isCurrencyStatus("draft"), true);
    assert.equal(isCurrencyStatus("active"), true);
    assert.equal(isCurrencyStatus("inactive"), true);
    assert.equal(isCurrencyStatus("archived"), true);
    assert.equal(isCurrencyStatus("cancelled"), true);
    assert.equal(isCurrencyStatus("unknown"), false);

    const active = createCurrency({
      tenantReference: "tenant-a",
      currencyKind: CURRENCY_KINDS.Operational,
      currencyStatus: CURRENCY_STATUSES.Active,
    });
    assert.equal(active.currencyStatus, "active");

    const inactive = createCurrency({
      tenantReference: "tenant-a",
      currencyKind: CURRENCY_KINDS.Display,
      currencyStatus: CURRENCY_STATUSES.Inactive,
    });
    assert.equal(inactive.currencyStatus, "inactive");
  });

  it("stays apart from peer packages / charge vendors", () => {
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
      Object.keys(pkg.dependencies ?? {}).includes("@motanos/commerce"),
      false,
    );
    assert.equal(
      Object.keys(pkg.dependencies ?? {}).includes("@motanos/tenant"),
      false,
    );
    assert.equal(
      Object.keys(pkg.dependencies ?? {}).includes("@motanos/booking"),
      false,
    );
    assert.equal(
      Object.keys(pkg.dependencies ?? {}).includes("@motanos/community"),
      false,
    );
    assert.equal(
      Object.keys(pkg.dependencies ?? {}).includes("@motanos/localization"),
      false,
    );

    const currency = createCurrency({
      tenantReference: "tenant-a",
      currencyKind: CURRENCY_KINDS.Supported,
      currencyStatus: CURRENCY_STATUSES.Archived,
      regionReference: "region-UK",
    });
    assert.equal(isCurrency(currency), true);
    assert.equal(currency.currencyStatus, "archived");
    assert.equal(currency.regionReference, "region-UK");
  });
});
