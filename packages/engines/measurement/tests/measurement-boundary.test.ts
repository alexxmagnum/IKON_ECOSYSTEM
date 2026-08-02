/**
 * Measurement Engine Boundary contract tests.
 * Run: pnpm --filter @motanos/measurement test
 */
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { beforeEach, describe, it } from "node:test";
import {
  MEASUREMENT_KINDS,
  MEASUREMENT_STATUSES,
  createMeasurement,
  isMeasurement,
  isMeasurementKind,
  isMeasurementStatus,
  resetMeasurementReferenceSequence,
} from "../src/index.js";

const packageRoot = join(dirname(fileURLToPath(import.meta.url)), "..");

describe("Measurement Engine Boundary", () => {
  beforeEach(() => {
    resetMeasurementReferenceSequence();
  });

  it("creates Measurement Boundary context", () => {
    const measurement = createMeasurement({
      tenantReference: "tenant-a",
      measurementKind: MEASUREMENT_KINDS.Operational,
      entityReference: "table-1",
      entityKind: "table",
      contextReference: "context-smart-tables",
      valueReference: "value-occupancy",
      unitReference: "unit-percent",
    });
    assert.equal(isMeasurement(measurement), true);
    assert.equal(measurement.measurementReference, "measurement-1");
    assert.equal(measurement.measurementStatus, "draft");
    assert.equal(measurement.measurementKind, "measurement.operational");
    assert.equal(measurement.tenantReference, "tenant-a");
    assert.equal(measurement.valueReference, "value-occupancy");
  });

  it("checks tenant isolation", () => {
    assert.throws(
      () =>
        createMeasurement({
          tenantReference: "  ",
          measurementKind: MEASUREMENT_KINDS.Performance,
        }),
      /tenantReference is required/,
    );

    assert.throws(
      () =>
        createMeasurement(
          {
            tenantReference: "tenant-b",
            measurementKind: MEASUREMENT_KINDS.Capacity,
          },
          { tenantReference: "tenant-a" },
        ),
      /does not apply to this tenant/,
    );

    assert.throws(
      () =>
        createMeasurement({
          tenantReference: "tenant-a",
          measurementKind: MEASUREMENT_KINDS.Usage,
          valueReference: "  ",
        }),
      /valueReference must not be empty when provided/,
    );
  });

  it("accepts only known measurement kinds", () => {
    assert.equal(isMeasurementKind("measurement.operational"), true);
    assert.equal(isMeasurementKind("measurement.performance"), true);
    assert.equal(isMeasurementKind("measurement.capacity"), true);
    assert.equal(isMeasurementKind("measurement.financial"), true);
    assert.equal(isMeasurementKind("measurement.usage"), true);
    assert.equal(isMeasurementKind("measurement.quality"), true);
    assert.equal(isMeasurementKind("measurement.unknown"), false);

    assert.throws(
      () =>
        createMeasurement({
          tenantReference: "tenant-a",
          measurementKind: "measurement.unknown" as never,
        }),
      /Unknown measurement kind/,
    );
  });

  it("accepts only known measurement statuses", () => {
    assert.equal(isMeasurementStatus("draft"), true);
    assert.equal(isMeasurementStatus("active"), true);
    assert.equal(isMeasurementStatus("inactive"), true);
    assert.equal(isMeasurementStatus("archived"), true);
    assert.equal(isMeasurementStatus("cancelled"), true);
    assert.equal(isMeasurementStatus("unknown"), false);

    const active = createMeasurement({
      tenantReference: "tenant-a",
      measurementKind: MEASUREMENT_KINDS.Financial,
      measurementStatus: MEASUREMENT_STATUSES.Active,
    });
    assert.equal(active.measurementStatus, "active");

    const inactive = createMeasurement({
      tenantReference: "tenant-a",
      measurementKind: MEASUREMENT_KINDS.Quality,
      measurementStatus: MEASUREMENT_STATUSES.Inactive,
    });
    assert.equal(inactive.measurementStatus, "inactive");
  });

  it("stays apart from peer packages / signal vendors", () => {
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
      Object.keys(pkg.dependencies ?? {}).includes("@motanos/resource"),
      false,
    );
    assert.equal(
      Object.keys(pkg.dependencies ?? {}).includes("@motanos/experience"),
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

    const measurement = createMeasurement({
      tenantReference: "tenant-a",
      measurementKind: MEASUREMENT_KINDS.Usage,
      measurementStatus: MEASUREMENT_STATUSES.Archived,
      sourceReference: "source-1",
    });
    assert.equal(isMeasurement(measurement), true);
    assert.equal(measurement.measurementStatus, "archived");
    assert.equal(measurement.sourceReference, "source-1");
  });
});
