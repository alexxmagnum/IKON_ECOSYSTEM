/**
 * Hospitality Cost Control contract tests.
 * Run: pnpm --filter @motanos/hospitality test
 */
import assert from "node:assert/strict";
import { readFileSync, readdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { beforeEach, describe, it } from "node:test";
import {
  COST_KINDS,
  COST_STATUSES,
  createCostRecord,
  isCostKind,
  isCostStatus,
  isHospitalityCostRecord,
  resetCostReferenceSequence,
} from "../src/public.js";

const packageRoot = join(dirname(fileURLToPath(import.meta.url)), "..");
const costControlRoot = join(packageRoot, "src", "cost-control");
const hospitalityBusiness = "hospitality-a";
const otherHospitalityBusiness = "hospitality-b";

describe("Hospitality Cost Control Boundary", () => {
  beforeEach(() => {
    resetCostReferenceSequence();
  });

  it("creates CostRecord", () => {
    const cost = createCostRecord({
      costKind: COST_KINDS.Product,
      hospitalityReference: hospitalityBusiness,
      contextReference: "context-1",
      menuItemReference: "menu-item-1",
      orderReference: "order-1",
      orderLineReference: "order-line-1",
      operationReference: "operation-1",
      valueReference: "value-1",
      currencyReference: "currency-eur",
      metadata: { note: "opaque-meta" },
    });
    assert.equal(isHospitalityCostRecord(cost), true);
    assert.equal(cost.costReference, "cost-1");
    assert.equal(cost.costStatus, "draft");
    assert.equal(cost.costKind, "cost.product");
    assert.equal(cost.hospitalityReference, hospitalityBusiness);
    assert.equal(cost.valueReference, "value-1");
    assert.equal(cost.currencyReference, "currency-eur");
    assert.equal(
      Object.prototype.hasOwnProperty.call(cost, "amount"),
      false,
    );
  });

  it("checks hospitality business isolation", () => {
    assert.throws(
      () =>
        createCostRecord({
          costKind: COST_KINDS.Menu,
          hospitalityReference: "  ",
        }),
      /hospitalityReference must not be empty when provided/,
    );

    assert.throws(
      () =>
        createCostRecord(
          {
            costKind: COST_KINDS.Order,
            hospitalityReference: otherHospitalityBusiness,
          },
          { hospitalityReference: hospitalityBusiness },
        ),
      /does not apply to this hospitality business/,
    );

    assert.throws(
      () =>
        createCostRecord({
          costKind: COST_KINDS.Operation,
          valueReference: "  ",
        }),
      /valueReference must not be empty when provided/,
    );
  });

  it("accepts only known cost kinds", () => {
    assert.equal(isCostKind("cost.product"), true);
    assert.equal(isCostKind("cost.operation"), true);
    assert.equal(isCostKind("cost.order"), true);
    assert.equal(isCostKind("cost.menu"), true);
    assert.equal(isCostKind("cost.internal"), true);
    assert.equal(isCostKind("cost.estimated"), true);
    assert.equal(isCostKind("margin"), false);
    assert.equal(isCostKind("ledger"), false);
    assert.equal(isCostKind("stock"), false);

    assert.throws(
      () =>
        createCostRecord({
          costKind: "cost.unknown" as never,
        }),
      /Unknown cost kind/,
    );

    assert.throws(
      () =>
        createCostRecord({
          costKind: "margin" as never,
        }),
      /Unknown cost kind/,
    );
  });

  it("accepts only known cost statuses", () => {
    assert.equal(isCostStatus("draft"), true);
    assert.equal(isCostStatus("active"), true);
    assert.equal(isCostStatus("calculated"), true);
    assert.equal(isCostStatus("archived"), true);
    assert.equal(isCostStatus("cancelled"), true);
    assert.equal(isCostStatus("unknown"), false);
    assert.equal(isCostStatus("paid"), false);

    const active = createCostRecord({
      costKind: COST_KINDS.Internal,
      costStatus: COST_STATUSES.Active,
    });
    assert.equal(active.costStatus, "active");

    const calculated = createCostRecord({
      costKind: COST_KINDS.Estimated,
      costStatus: COST_STATUSES.Calculated,
    });
    assert.equal(calculated.costStatus, "calculated");
  });

  it("stays apart from stock / vendors / buy-orders / bill-of-materials / ledger / till / tax logic", () => {
    const costSources = readdirSync(costControlRoot)
      .filter((name) => name.endsWith(".ts"))
      .map((name) => readFileSync(join(costControlRoot, name), "utf8"))
      .join("\n")
      .toLowerCase();

    assert.equal(costSources.includes("inventory"), false);
    assert.equal(costSources.includes("suppliers"), false);
    assert.equal(costSources.includes("purchasing"), false);
    assert.equal(costSources.includes("recipes"), false);
    assert.equal(costSources.includes("accounting"), false);
    assert.equal(costSources.includes("payments"), false);
    assert.equal(costSources.includes("taxation"), false);

    assert.equal(costSources.includes("calculatemargin"), false);
    assert.equal(costSources.includes("calculatefoodcost"), false);
    assert.equal(costSources.includes("createrecipe"), false);
    assert.equal(costSources.includes("updateinventory"), false);
    assert.equal(costSources.includes("syncsupplier"), false);
    assert.equal(costSources.includes("createpurchase"), false);
    assert.equal(costSources.includes("calculateprofit"), false);
    assert.equal(
      /\bamount\s*[?:]/.test(costSources) ||
        costSources.includes("amount:number"),
      false,
    );

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
      Object.keys(pkg.dependencies ?? {}).includes("@motanos/cost-control"),
      false,
    );
    assert.equal(
      Object.keys(pkg.dependencies ?? {}).includes("@motanos/inventory"),
      false,
    );
    assert.equal(
      Object.keys(pkg.dependencies ?? {}).includes("@motanos/recipe"),
      false,
    );
    assert.equal(
      Object.keys(pkg.dependencies ?? {}).includes("@motanos/purchasing"),
      false,
    );

    const cost = createCostRecord({
      costKind: COST_KINDS.Order,
      costStatus: COST_STATUSES.Archived,
      hospitalityReference: hospitalityBusiness,
      parentCostReference: "cost-parent-1",
    });
    assert.equal(isHospitalityCostRecord(cost), true);
    assert.equal(cost.costStatus, "archived");
    assert.equal(cost.parentCostReference, "cost-parent-1");
  });
});
