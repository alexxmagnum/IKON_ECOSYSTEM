/**
 * Hospitality Activity Availability contract tests.
 * Run: pnpm --filter @motanos/hospitality test
 */
import assert from "node:assert/strict";
import { readFileSync, readdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { beforeEach, describe, it } from "node:test";
import {
  AVAILABILITY_KINDS,
  AVAILABILITY_STATUSES,
  createActivityAvailability,
  isAvailabilityKind,
  isAvailabilityStatus,
  isHospitalityActivityAvailability,
  resetActivityAvailabilityReferenceSequence,
} from "../src/public.js";

const packageRoot = join(dirname(fileURLToPath(import.meta.url)), "..");
const availabilityRoot = join(packageRoot, "src", "availability");
const hospitalityBusiness = "hospitality-ikon";
const otherHospitalityBusiness = "hospitality-marina";

describe("Hospitality Activity Availability Boundary", () => {
  beforeEach(() => {
    resetActivityAvailabilityReferenceSequence();
  });

  it("creates ActivityAvailability", () => {
    const availability = createActivityAvailability({
      availabilityKind: AVAILABILITY_KINDS.Activity,
      hospitalityReference: hospitalityBusiness,
      activityReference: "activity-1",
      scheduleReference: "schedule-1",
      capacityReference: "capacity-1",
      contextReference: "context-1",
      stateReference: "state-open-1",
      windowReference: "window-1",
      metadata: { note: "opaque-meta" },
    });
    assert.equal(isHospitalityActivityAvailability(availability), true);
    assert.equal(availability.availabilityReference, "availability-1");
    assert.equal(availability.availabilityStatus, "draft");
    assert.equal(availability.availabilityKind, "availability.activity");
    assert.equal(availability.hospitalityReference, hospitalityBusiness);
    assert.equal(availability.capacityReference, "capacity-1");
    assert.equal(
      Object.prototype.hasOwnProperty.call(availability, "availableSlots"),
      false,
    );
    assert.equal(
      Object.prototype.hasOwnProperty.call(availability, "remaining"),
      false,
    );
    assert.equal(
      Object.prototype.hasOwnProperty.call(availability, "count"),
      false,
    );
  });

  it("checks hospitality business isolation", () => {
    assert.throws(
      () =>
        createActivityAvailability({
          availabilityKind: AVAILABILITY_KINDS.Session,
          hospitalityReference: "  ",
        }),
      /hospitalityReference must not be empty when provided/,
    );

    assert.throws(
      () =>
        createActivityAvailability(
          {
            availabilityKind: AVAILABILITY_KINDS.Event,
            hospitalityReference: otherHospitalityBusiness,
          },
          { hospitalityReference: hospitalityBusiness },
        ),
      /does not apply to this hospitality business/,
    );

    assert.throws(
      () =>
        createActivityAvailability({
          availabilityKind: AVAILABILITY_KINDS.Internal,
          capacityReference: "  ",
        }),
      /capacityReference must not be empty when provided/,
    );
  });

  it("accepts only known availability kinds", () => {
    assert.equal(isAvailabilityKind("availability.activity"), true);
    assert.equal(isAvailabilityKind("availability.session"), true);
    assert.equal(isAvailabilityKind("availability.event"), true);
    assert.equal(isAvailabilityKind("availability.internal"), true);
    assert.equal(isAvailabilityKind("slot"), false);
    assert.equal(isAvailabilityKind("calendar"), false);
    assert.equal(isAvailabilityKind("booking"), false);

    assert.throws(
      () =>
        createActivityAvailability({
          availabilityKind: "availability.unknown" as never,
        }),
      /Unknown availability kind/,
    );

    assert.throws(
      () =>
        createActivityAvailability({
          availabilityKind: "slot" as never,
        }),
      /Unknown availability kind/,
    );
  });

  it("accepts only known availability statuses", () => {
    assert.equal(isAvailabilityStatus("draft"), true);
    assert.equal(isAvailabilityStatus("available"), true);
    assert.equal(isAvailabilityStatus("limited"), true);
    assert.equal(isAvailabilityStatus("unavailable"), true);
    assert.equal(isAvailabilityStatus("closed"), true);
    assert.equal(isAvailabilityStatus("inactive"), true);
    assert.equal(isAvailabilityStatus("archived"), true);
    assert.equal(isAvailabilityStatus("cancelled"), true);
    assert.equal(isAvailabilityStatus("unknown"), false);
    assert.equal(isAvailabilityStatus("sold_out"), false);

    const available = createActivityAvailability({
      availabilityKind: AVAILABILITY_KINDS.Session,
      availabilityStatus: AVAILABILITY_STATUSES.Available,
    });
    assert.equal(available.availabilityStatus, "available");

    const limited = createActivityAvailability({
      availabilityKind: AVAILABILITY_KINDS.Event,
      availabilityStatus: AVAILABILITY_STATUSES.Limited,
    });
    assert.equal(limited.availabilityStatus, "limited");
  });

  it("stays apart from seat-hold / till / waitlist / limit-mutation / alert / score logic", () => {
    const availabilitySources = readdirSync(availabilityRoot)
      .filter((name) => name.endsWith(".ts"))
      .map((name) => readFileSync(join(availabilityRoot, name), "utf8"))
      .join("\n")
      .toLowerCase();

    assert.equal(availabilitySources.includes("booking logic"), false);
    assert.equal(availabilitySources.includes("reservation logic"), false);
    assert.equal(availabilitySources.includes("payment logic"), false);
    assert.equal(availabilitySources.includes("capacity mutation"), false);
    assert.equal(availabilitySources.includes("participant assignment"), false);
    assert.equal(availabilitySources.includes("notification logic"), false);
    assert.equal(availabilitySources.includes("gamification"), false);

    assert.equal(availabilitySources.includes("checkavailability"), false);
    assert.equal(availabilitySources.includes("reserveavailability"), false);
    assert.equal(availabilitySources.includes("consumeavailability"), false);
    assert.equal(availabilitySources.includes("releaseavailability"), false);
    assert.equal(availabilitySources.includes("joinwaitlist"), false);

    assert.equal(availabilitySources.includes("availableslots"), false);
    assert.equal(availabilitySources.includes("remaining"), false);
    assert.equal(/\bcount\b/.test(availabilitySources), false);

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
      Object.keys(pkg.dependencies ?? {}).includes("@motanos/availability"),
      false,
    );
    assert.equal(
      Object.keys(pkg.dependencies ?? {}).includes("@motanos/calendar"),
      false,
    );
    assert.equal(
      Object.keys(pkg.dependencies ?? {}).includes("@motanos/booking"),
      false,
    );

    const availability = createActivityAvailability({
      availabilityKind: AVAILABILITY_KINDS.Internal,
      availabilityStatus: AVAILABILITY_STATUSES.Archived,
      hospitalityReference: hospitalityBusiness,
      parentAvailabilityReference: "availability-parent-1",
    });
    assert.equal(isHospitalityActivityAvailability(availability), true);
    assert.equal(availability.availabilityStatus, "archived");
    assert.equal(
      availability.parentAvailabilityReference,
      "availability-parent-1",
    );
  });
});
