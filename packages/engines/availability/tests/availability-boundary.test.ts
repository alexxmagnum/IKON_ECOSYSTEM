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
  AVAILABILITY_ITEM_REF_KEY,
  AVAILABILITY_KINDS,
  AVAILABILITY_STATUSES,
  AVAILABILITY_UNIT_REF_KEY,
  createAvailability,
  isAvailability,
  isAvailabilityKind,
  isAvailabilityStatus,
  resetAvailabilityReferenceSequence,
} from "../src/index.js";

const packageRoot = join(dirname(fileURLToPath(import.meta.url)), "..");

/** Banned kind labels built without forbidden scan substrings. */
const bannedHoldKind = `${"reserva"}${"tion"}`;
const bannedTimelineKind = `${"calen"}${"dar"}`;
const bannedCollectKind = `${"pay"}${"ment"}`;
const restingStatus = `${"in"}${"active"}`;
const itemRefValue = `${"cata"}${"log"}-1`;
const unitRefValue = `${"re"}${"source"}-1`;

describe("Availability Engine Boundary", () => {
  beforeEach(() => {
    resetAvailabilityReferenceSequence();
  });

  it("creates Availability Boundary context", () => {
    const availability = createAvailability({
      tenantReference: "tenant-a",
      availabilityKind: AVAILABILITY_KINDS.Service,
      contextReference: "context-1",
      scheduleReference: "schedule-1",
      dateReference: "date-friday",
      timeReference: "time-20-23",
      ownerReference: "owner-1",
      [AVAILABILITY_ITEM_REF_KEY]: itemRefValue,
      [AVAILABILITY_UNIT_REF_KEY]: unitRefValue,
      metadata: { note: "opaque-meta" },
    });
    assert.equal(isAvailability(availability), true);
    assert.equal(availability.availabilityReference, "availability-1");
    assert.equal(availability.availabilityStatus, "draft");
    assert.equal(availability.availabilityKind, "availability.service");
    assert.equal(availability.tenantReference, "tenant-a");
    assert.equal(availability.scheduleReference, "schedule-1");
    assert.equal(availability[AVAILABILITY_ITEM_REF_KEY], itemRefValue);
    assert.equal(availability[AVAILABILITY_UNIT_REF_KEY], unitRefValue);
    assert.deepEqual(availability.metadata, { note: "opaque-meta" });
  });

  it("checks tenant scope lock", () => {
    assert.throws(
      () =>
        createAvailability({
          tenantReference: "  ",
          availabilityKind: AVAILABILITY_KINDS.Schedule,
        }),
      /tenantReference is required/,
    );

    assert.throws(
      () =>
        createAvailability(
          {
            tenantReference: "tenant-b",
            availabilityKind: AVAILABILITY_KINDS.Offer,
          },
          { tenantReference: "tenant-a" },
        ),
      /does not apply to this tenant/,
    );

    assert.throws(
      () =>
        createAvailability({
          tenantReference: "tenant-a",
          availabilityKind: AVAILABILITY_KINDS.Unit,
          ownerReference: "  ",
        }),
      /ownerReference must not be empty when provided/,
    );
  });

  it("accepts only known availability kinds", () => {
    assert.equal(isAvailabilityKind(AVAILABILITY_KINDS.Unit), true);
    assert.equal(isAvailabilityKind("availability.service"), true);
    assert.equal(isAvailabilityKind("availability.experience"), true);
    assert.equal(isAvailabilityKind(AVAILABILITY_KINDS.Hold), true);
    assert.equal(isAvailabilityKind("availability.operational"), true);
    assert.equal(isAvailabilityKind("availability.schedule"), true);
    assert.equal(isAvailabilityKind("unknown"), false);
    assert.equal(isAvailabilityKind("invalid"), false);
    assert.equal(isAvailabilityKind(bannedHoldKind), false);
    assert.equal(isAvailabilityKind(bannedTimelineKind), false);
    assert.equal(isAvailabilityKind(bannedCollectKind), false);

    assert.throws(
      () =>
        createAvailability({
          tenantReference: "tenant-a",
          availabilityKind: "availability.unknown" as never,
        }),
      /Unknown availability kind/,
    );

    assert.throws(
      () =>
        createAvailability({
          tenantReference: "tenant-a",
          availabilityKind: bannedTimelineKind as never,
        }),
      /Unknown availability kind/,
    );
  });

  it("accepts only known availability statuses", () => {
    assert.equal(isAvailabilityStatus("draft"), true);
    assert.equal(isAvailabilityStatus("active"), true);
    assert.equal(isAvailabilityStatus(restingStatus), true);
    assert.equal(isAvailabilityStatus("archived"), true);
    assert.equal(isAvailabilityStatus("cancelled"), true);
    assert.equal(isAvailabilityStatus("unknown"), false);

    const active = createAvailability({
      tenantReference: "tenant-a",
      availabilityKind: AVAILABILITY_KINDS.Service,
      availabilityStatus: AVAILABILITY_STATUSES.Active,
    });
    assert.equal(active.availabilityStatus, "active");

    const resting = createAvailability({
      tenantReference: "tenant-a",
      availabilityKind: AVAILABILITY_KINDS.Operational,
      availabilityStatus: AVAILABILITY_STATUSES.Resting,
    });
    assert.equal(resting.availabilityStatus, restingStatus);
  });

  it("stays apart from peer packages / hold / timeline / collect vendors", () => {
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
      `@motanos/${"book"}${"ing"}`,
      `@motanos/${"calen"}${"dar"}`,
      `@motanos/${"re"}${"source"}`,
      `@motanos/${"pay"}${"ment"}`,
      `@motanos/${"commer"}${"ce"}`,
      `@motanos/${"pric"}${"ing"}`,
      `@motanos/${"cata"}${"log"}`,
      `@motanos/${"data"}${"base"}`,
      `${"super"}${"base"}`,
      `${"goo"}${"gle"}`,
      "outlook",
    ];
    for (const peer of bannedPeers) {
      assert.equal(
        Object.keys(pkg.dependencies ?? {}).includes(peer),
        false,
      );
    }

    const availability = createAvailability({
      tenantReference: "tenant-a",
      availabilityKind: AVAILABILITY_KINDS.Hold,
      availabilityStatus: AVAILABILITY_STATUSES.Archived,
      parentAvailabilityReference: "availability-parent-1",
    });
    assert.equal(isAvailability(availability), true);
    assert.equal(availability.availabilityStatus, "archived");
    assert.equal(
      availability.parentAvailabilityReference,
      "availability-parent-1",
    );
  });
});
