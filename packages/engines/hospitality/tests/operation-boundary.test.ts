/**
 * Hospitality Service Operations contract tests.
 * Run: pnpm --filter @motanos/hospitality test
 */
import assert from "node:assert/strict";
import { readFileSync, readdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { beforeEach, describe, it } from "node:test";
import {
  OPERATION_KINDS,
  OPERATION_STATUSES,
  createOperation,
  isHospitalityOperation,
  isOperationKind,
  isOperationStatus,
  resetOperationReferenceSequence,
} from "../src/public.js";

const packageRoot = join(dirname(fileURLToPath(import.meta.url)), "..");
const operationsRoot = join(packageRoot, "src", "operations");
const hospitalityBusiness = "hospitality-a";
const otherHospitalityBusiness = "hospitality-b";

describe("Hospitality Service Operations Boundary", () => {
  beforeEach(() => {
    resetOperationReferenceSequence();
  });

  it("creates Operation", () => {
    const operation = createOperation({
      operationKind: OPERATION_KINDS.Kitchen,
      hospitalityReference: hospitalityBusiness,
      contextReference: "context-1",
      orderReference: "order-1",
      orderLineReference: "order-line-1",
      staffReference: "staff-1",
      areaReference: "area-kitchen",
      metadata: { note: "opaque-meta" },
    });
    assert.equal(isHospitalityOperation(operation), true);
    assert.equal(operation.operationReference, "operation-1");
    assert.equal(operation.operationStatus, "draft");
    assert.equal(operation.operationKind, "operation.kitchen");
    assert.equal(operation.hospitalityReference, hospitalityBusiness);
    assert.equal(operation.orderReference, "order-1");
    assert.equal(operation.staffReference, "staff-1");
  });

  it("checks hospitality business isolation", () => {
    assert.throws(
      () =>
        createOperation({
          operationKind: OPERATION_KINDS.Bar,
          hospitalityReference: "  ",
        }),
      /hospitalityReference must not be empty when provided/,
    );

    assert.throws(
      () =>
        createOperation(
          {
            operationKind: OPERATION_KINDS.Service,
            hospitalityReference: otherHospitalityBusiness,
          },
          { hospitalityReference: hospitalityBusiness },
        ),
      /does not apply to this hospitality business/,
    );

    assert.throws(
      () =>
        createOperation({
          operationKind: OPERATION_KINDS.Takeaway,
          orderReference: "  ",
        }),
      /orderReference must not be empty when provided/,
    );
  });

  it("accepts only known operation kinds", () => {
    assert.equal(isOperationKind("operation.kitchen"), true);
    assert.equal(isOperationKind("operation.bar"), true);
    assert.equal(isOperationKind("operation.service"), true);
    assert.equal(isOperationKind("operation.takeaway"), true);
    assert.equal(isOperationKind("operation.delivery"), true);
    assert.equal(isOperationKind("operation.internal"), true);
    assert.equal(isOperationKind("workflow"), false);
    assert.equal(isOperationKind("ticket"), false);
    assert.equal(isOperationKind("queue"), false);

    assert.throws(
      () =>
        createOperation({
          operationKind: "operation.unknown" as never,
        }),
      /Unknown operation kind/,
    );

    assert.throws(
      () =>
        createOperation({
          operationKind: "workflow" as never,
        }),
      /Unknown operation kind/,
    );
  });

  it("accepts only known operation statuses", () => {
    assert.equal(isOperationStatus("draft"), true);
    assert.equal(isOperationStatus("queued"), true);
    assert.equal(isOperationStatus("active"), true);
    assert.equal(isOperationStatus("completed"), true);
    assert.equal(isOperationStatus("cancelled"), true);
    assert.equal(isOperationStatus("archived"), true);
    assert.equal(isOperationStatus("unknown"), false);
    assert.equal(isOperationStatus("preparing"), false);

    const queued = createOperation({
      operationKind: OPERATION_KINDS.Delivery,
      operationStatus: OPERATION_STATUSES.Queued,
    });
    assert.equal(queued.operationStatus, "queued");

    const active = createOperation({
      operationKind: OPERATION_KINDS.Internal,
      operationStatus: OPERATION_STATUSES.Active,
    });
    assert.equal(active.operationStatus, "active");
  });

  it("stays apart from stock / bill-of-materials / tariff / ticket / till / roster / wage logic", () => {
    const operationSources = readdirSync(operationsRoot)
      .filter((name) => name.endsWith(".ts"))
      .map((name) => readFileSync(join(operationsRoot, name), "utf8"))
      .join("\n")
      .toLowerCase();

    assert.equal(operationSources.includes("inventory"), false);
    assert.equal(operationSources.includes("recipe"), false);
    assert.equal(operationSources.includes("pricing"), false);
    assert.equal(operationSources.includes("printing"), false);
    assert.equal(operationSources.includes("tpv"), false);
    assert.equal(operationSources.includes("scheduling"), false);
    assert.equal(operationSources.includes("payroll"), false);

    assert.equal(operationSources.includes("startpreparation"), false);
    assert.equal(operationSources.includes("completepreparation"), false);
    assert.equal(operationSources.includes("assignstaff"), false);
    assert.equal(operationSources.includes("printticket"), false);
    assert.equal(operationSources.includes("sendtokitchen"), false);
    assert.equal(operationSources.includes("updateinventory"), false);
    assert.equal(operationSources.includes("calculateduration"), false);
    assert.equal(operationSources.includes("prioritizeorder"), false);

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
      Object.keys(pkg.dependencies ?? {}).includes("@motanos/kitchen"),
      false,
    );
    assert.equal(
      Object.keys(pkg.dependencies ?? {}).includes("@motanos/bar"),
      false,
    );
    assert.equal(
      Object.keys(pkg.dependencies ?? {}).includes("@motanos/service"),
      false,
    );
    assert.equal(
      Object.keys(pkg.dependencies ?? {}).includes("@motanos/operations"),
      false,
    );

    const operation = createOperation({
      operationKind: OPERATION_KINDS.Service,
      operationStatus: OPERATION_STATUSES.Completed,
      hospitalityReference: hospitalityBusiness,
      parentOperationReference: "operation-parent-1",
    });
    assert.equal(isHospitalityOperation(operation), true);
    assert.equal(operation.operationStatus, "completed");
    assert.equal(operation.parentOperationReference, "operation-parent-1");
  });
});
