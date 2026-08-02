/**
 * Booking Resource Boundary contract tests.
 * Run: pnpm --filter @motanos/booking test
 */
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { beforeEach, describe, it } from "node:test";
import {
  BOOKING_RESOURCE_KINDS,
  createBookingResource,
  isBookingResource,
  isBookingResourceKind,
  isBookingResourcePort,
  resetBookingResourceReferenceSequence,
  resourceBelongsToTenant,
  type BookingResourcePort,
} from "../src/index.js";

const packageRoot = join(dirname(fileURLToPath(import.meta.url)), "..");

describe("Booking Resource Boundary", () => {
  beforeEach(() => {
    resetBookingResourceReferenceSequence();
  });

  it("creates a valid resource contract", () => {
    const resource = createBookingResource({
      tenantReference: "tenant-a",
      resourceKind: BOOKING_RESOURCE_KINDS.Table,
      resourceName: "Table 12",
      metadata: { correlationId: "corr-1" },
    });

    assert.deepEqual(resource, {
      resourceReference: "resource-1",
      tenantReference: "tenant-a",
      resourceKind: "booking.table",
      resourceName: "Table 12",
      metadata: { correlationId: "corr-1" },
    });
    assert.equal(isBookingResource(resource), true);
  });

  it("accepts only known resource kinds", () => {
    assert.equal(isBookingResourceKind("booking.table"), true);
    assert.equal(isBookingResourceKind("booking.court"), true);
    assert.equal(isBookingResourceKind("booking.room"), true);
    assert.equal(isBookingResourceKind("booking.seat"), true);
    assert.equal(isBookingResourceKind("booking.equipment"), true);
    assert.equal(isBookingResourceKind("booking.unknown"), false);

    const court = createBookingResource({
      tenantReference: "tenant-a",
      resourceKind: BOOKING_RESOURCE_KINDS.Court,
    });
    assert.equal(court.resourceKind, "booking.court");

    assert.throws(
      () =>
        createBookingResource({
          tenantReference: "tenant-a",
          resourceKind: "booking.unknown" as never,
        }),
      /Unknown booking resource kind/,
    );
  });

  it("requires tenantReference", () => {
    assert.throws(
      () =>
        createBookingResource({
          tenantReference: "  ",
          resourceKind: BOOKING_RESOURCE_KINDS.Room,
        }),
      /tenantReference is required/,
    );
  });

  it("isolates resources by tenantReference", () => {
    const resource = createBookingResource({
      tenantReference: "tenant-a",
      resourceKind: BOOKING_RESOURCE_KINDS.Seat,
      resourceReference: "seat-1",
    });
    assert.equal(resourceBelongsToTenant(resource, "tenant-a"), true);
    assert.equal(resourceBelongsToTenant(resource, "tenant-b"), false);
    assert.equal(resourceBelongsToTenant(resource, "  "), false);
  });

  it("has no external inventory provider dependencies", () => {
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

    const port: BookingResourcePort = {
      async getResource() {
        return null;
      },
    };
    assert.equal(isBookingResourcePort(port), true);
  });
});
