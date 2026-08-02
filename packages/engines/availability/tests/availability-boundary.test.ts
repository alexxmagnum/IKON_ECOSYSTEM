/**
 * Availability Engine Boundary contract tests.
 * Run: pnpm --filter @motanos/availability test
 */
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { beforeEach, describe, it } from "node:test";
import {
  AVAILABILITY_KINDS,
  AVAILABILITY_STATUSES,
  createAvailability,
  isAvailability,
  isAvailabilityKind,
  isAvailabilityStatus,
  resetAvailabilityReferenceSequence,
} from "../src/index.js";

const packageRoot = join(dirname(fileURLToPath(import.meta.url)), "..");

describe("Availability Engine Boundary", () => {
  beforeEach(() => {
    resetAvailabilityReferenceSequence();
  });

  it("creates Availability Boundary context", () => {
    const availability = createAvailability({
      tenantReference: "tenant-a",
      availabilityKind: AVAILABILITY_KINDS.Schedule,
      resourceReference: "resource-1",
      experienceReference: "experience-1",
      scheduleReference: "schedule-1",
      ownerReference: "owner-1",
    });
    assert.equal(isAvailability(availability), true);
    assert.equal(availability.availabilityReference, "availability-1");
    assert.equal(availability.availabilityStatus, "draft");
    assert.equal(availability.availabilityKind, "availability.schedule");
    assert.equal(availability.tenantReference, "tenant-a");
    assert.equal(availability.resourceReference, "resource-1");
  });

  it("validates tenant isolation", () => {
    assert.throws(
      () =>
        createAvailability({
          tenantReference: "  ",
          availabilityKind: AVAILABILITY_KINDS.Window,
        }),
      /tenantReference is required/,
    );

    assert.throws(
      () =>
        createAvailability(
          {
            tenantReference: "tenant-b",
            availabilityKind: AVAILABILITY_KINDS.Capacity,
          },
          { tenantReference: "tenant-a" },
        ),
      /does not apply to this tenant/,
    );

    assert.throws(
      () =>
        createAvailability({
          tenantReference: "tenant-a",
          availabilityKind: AVAILABILITY_KINDS.Operational,
          resourceReference: "  ",
        }),
      /resourceReference must not be empty when provided/,
    );
  });

  it("accepts only known availability kinds", () => {
    assert.equal(isAvailabilityKind("availability.schedule"), true);
    assert.equal(isAvailabilityKind("availability.window"), true);
    assert.equal(isAvailabilityKind("availability.capacity"), true);
    assert.equal(isAvailabilityKind("availability.operational"), true);
    assert.equal(isAvailabilityKind("availability.unknown"), false);

    assert.throws(
      () =>
        createAvailability({
          tenantReference: "tenant-a",
          availabilityKind: "availability.unknown" as never,
        }),
      /Unknown availability kind/,
    );
  });

  it("accepts only known availability statuses", () => {
    assert.equal(isAvailabilityStatus("draft"), true);
    assert.equal(isAvailabilityStatus("active"), true);
    assert.equal(isAvailabilityStatus("paused"), true);
    assert.equal(isAvailabilityStatus("expired"), true);
    assert.equal(isAvailabilityStatus("archived"), true);
    assert.equal(isAvailabilityStatus("cancelled"), true);
    assert.equal(isAvailabilityStatus("unknown"), false);

    const active = createAvailability({
      tenantReference: "tenant-a",
      availabilityKind: AVAILABILITY_KINDS.Window,
      availabilityStatus: AVAILABILITY_STATUSES.Active,
    });
    assert.equal(active.availabilityStatus, "active");

    const paused = createAvailability({
      tenantReference: "tenant-a",
      availabilityKind: AVAILABILITY_KINDS.Capacity,
      availabilityStatus: AVAILABILITY_STATUSES.Paused,
    });
    assert.equal(paused.availabilityStatus, "paused");
  });

  it("stays separated from usage / timeline / commerce packages", () => {
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
      Object.keys(pkg.dependencies ?? {}).includes("@motanos/resource"),
      false,
    );
    assert.equal(
      Object.keys(pkg.dependencies ?? {}).includes("@motanos/experience"),
      false,
    );
    assert.equal(
      Object.keys(pkg.dependencies ?? {}).includes("@motanos/auth"),
      false,
    );

    const availability = createAvailability({
      tenantReference: "tenant-a",
      availabilityKind: AVAILABILITY_KINDS.Operational,
      availabilityStatus: AVAILABILITY_STATUSES.Archived,
    });
    assert.equal(isAvailability(availability), true);
    assert.equal(availability.availabilityStatus, "archived");
  });
});
