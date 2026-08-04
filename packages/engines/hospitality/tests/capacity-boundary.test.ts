/**
 * Hospitality Activity Capacity contract tests.
 * Run: pnpm --filter @motanos/hospitality test
 */
import assert from "node:assert/strict";
import { readFileSync, readdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { beforeEach, describe, it } from "node:test";
import {
  CAPACITY_KINDS,
  CAPACITY_STATUSES,
  createActivityCapacity,
  isCapacityKind,
  isCapacityStatus,
  isHospitalityActivityCapacity,
  resetActivityCapacityReferenceSequence,
} from "../src/public.js";

const packageRoot = join(dirname(fileURLToPath(import.meta.url)), "..");
const capacityRoot = join(packageRoot, "src", "capacity");
const hospitalityBusiness = "hospitality-ikon";
const otherHospitalityBusiness = "hospitality-marina";

describe("Hospitality Activity Capacity Boundary", () => {
  beforeEach(() => {
    resetActivityCapacityReferenceSequence();
  });

  it("creates ActivityCapacity", () => {
    const capacity = createActivityCapacity({
      capacityKind: CAPACITY_KINDS.Activity,
      hospitalityReference: hospitalityBusiness,
      activityReference: "activity-1",
      scheduleReference: "schedule-1",
      contextReference: "context-1",
      limitReference: "magnitude-limit-30",
      minimumReference: "magnitude-min-2",
      metadata: { note: "opaque-meta" },
    });
    assert.equal(isHospitalityActivityCapacity(capacity), true);
    assert.equal(capacity.capacityReference, "capacity-1");
    assert.equal(capacity.capacityStatus, "draft");
    assert.equal(capacity.capacityKind, "capacity.activity");
    assert.equal(capacity.hospitalityReference, hospitalityBusiness);
    assert.equal(capacity.limitReference, "magnitude-limit-30");
    assert.equal(
      Object.prototype.hasOwnProperty.call(capacity, "maxParticipants"),
      false,
    );
    assert.equal(
      Object.prototype.hasOwnProperty.call(capacity, "minParticipants"),
      false,
    );
  });

  it("checks hospitality business isolation", () => {
    assert.throws(
      () =>
        createActivityCapacity({
          capacityKind: CAPACITY_KINDS.Event,
          hospitalityReference: "  ",
        }),
      /hospitalityReference must not be empty when provided/,
    );

    assert.throws(
      () =>
        createActivityCapacity(
          {
            capacityKind: CAPACITY_KINDS.Session,
            hospitalityReference: otherHospitalityBusiness,
          },
          { hospitalityReference: hospitalityBusiness },
        ),
      /does not apply to this hospitality business/,
    );

    assert.throws(
      () =>
        createActivityCapacity({
          capacityKind: CAPACITY_KINDS.Internal,
          limitReference: "  ",
        }),
      /limitReference must not be empty when provided/,
    );
  });

  it("accepts only known capacity kinds", () => {
    assert.equal(isCapacityKind("capacity.activity"), true);
    assert.equal(isCapacityKind("capacity.event"), true);
    assert.equal(isCapacityKind("capacity.session"), true);
    assert.equal(isCapacityKind("capacity.internal"), true);
    assert.equal(isCapacityKind("stock"), false);
    assert.equal(isCapacityKind("slot"), false);
    assert.equal(isCapacityKind("waitlist"), false);

    assert.throws(
      () =>
        createActivityCapacity({
          capacityKind: "capacity.unknown" as never,
        }),
      /Unknown capacity kind/,
    );

    assert.throws(
      () =>
        createActivityCapacity({
          capacityKind: "stock" as never,
        }),
      /Unknown capacity kind/,
    );
  });

  it("accepts only known capacity statuses", () => {
    assert.equal(isCapacityStatus("draft"), true);
    assert.equal(isCapacityStatus("configured"), true);
    assert.equal(isCapacityStatus("available"), true);
    assert.equal(isCapacityStatus("full"), true);
    assert.equal(isCapacityStatus("inactive"), true);
    assert.equal(isCapacityStatus("archived"), true);
    assert.equal(isCapacityStatus("cancelled"), true);
    assert.equal(isCapacityStatus("unknown"), false);
    assert.equal(isCapacityStatus("overbooked"), false);

    const configured = createActivityCapacity({
      capacityKind: CAPACITY_KINDS.Event,
      capacityStatus: CAPACITY_STATUSES.Configured,
    });
    assert.equal(configured.capacityStatus, "configured");

    const available = createActivityCapacity({
      capacityKind: CAPACITY_KINDS.Session,
      capacityStatus: CAPACITY_STATUSES.Available,
    });
    assert.equal(available.capacityStatus, "available");
  });

  it("stays apart from seat-hold / till / waitlist / door-scan / alert / score logic", () => {
    const capacitySources = readdirSync(capacityRoot)
      .filter((name) => name.endsWith(".ts"))
      .map((name) => readFileSync(join(capacityRoot, name), "utf8"))
      .join("\n")
      .toLowerCase();

    assert.equal(capacitySources.includes("booking logic"), false);
    assert.equal(capacitySources.includes("payment logic"), false);
    assert.equal(capacitySources.includes("reservation logic"), false);
    assert.equal(capacitySources.includes("participant assignment"), false);
    assert.equal(capacitySources.includes("notification logic"), false);
    assert.equal(capacitySources.includes("gamification"), false);

    assert.equal(capacitySources.includes("checkavailability"), false);
    assert.equal(capacitySources.includes("reservecapacity"), false);
    assert.equal(capacitySources.includes("releasecapacity"), false);
    assert.equal(capacitySources.includes("joinwaitlist"), false);
    assert.equal(capacitySources.includes("assignplace"), false);

    assert.equal(capacitySources.includes("maxparticipants"), false);
    assert.equal(capacitySources.includes("minparticipants"), false);

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
      Object.keys(pkg.dependencies ?? {}).includes("@motanos/capacity"),
      false,
    );
    assert.equal(
      Object.keys(pkg.dependencies ?? {}).includes("@motanos/availability"),
      false,
    );
    assert.equal(
      Object.keys(pkg.dependencies ?? {}).includes("@motanos/inventory"),
      false,
    );

    const capacity = createActivityCapacity({
      capacityKind: CAPACITY_KINDS.Internal,
      capacityStatus: CAPACITY_STATUSES.Archived,
      hospitalityReference: hospitalityBusiness,
      parentCapacityReference: "capacity-parent-1",
    });
    assert.equal(isHospitalityActivityCapacity(capacity), true);
    assert.equal(capacity.capacityStatus, "archived");
    assert.equal(capacity.parentCapacityReference, "capacity-parent-1");
  });
});
