/**
 * Booking Exception Boundary contract tests.
 * Run: pnpm --filter @motanos/booking test
 */
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { beforeEach, describe, it } from "node:test";
import {
  BOOKING_EXCEPTION_KINDS,
  BOOKING_EXCEPTION_KIND_VALUES,
  BOOKING_EXCEPTION_STATUSES,
  createBookingException,
  isBookingException,
  isBookingExceptionKind,
  isBookingExceptionStatus,
  resetBookingExceptionReferenceSequence,
} from "../src/index.js";

const packageRoot = join(dirname(fileURLToPath(import.meta.url)), "..");

describe("Booking Exception Boundary", () => {
  beforeEach(() => {
    resetBookingExceptionReferenceSequence();
  });

  it("creates Exception Boundary context", () => {
    const exception = createBookingException({
      tenantReference: "tenant-a",
      exceptionKind: BOOKING_EXCEPTION_KINDS.Conflict,
      bookingReference: "bk-1",
      actorReference: "actor-1",
      reasonReference: "reason-1",
    });
    assert.equal(isBookingException(exception), true);
    assert.equal(exception.exceptionReference, "exception-1");
    assert.equal(exception.exceptionStatus, "pending");
    assert.equal(exception.exceptionKind, "booking.conflict");
    assert.equal(exception.reasonReference, "reason-1");
  });

  it("validates tenant isolation", () => {
    assert.throws(
      () =>
        createBookingException({
          tenantReference: "  ",
          exceptionKind: BOOKING_EXCEPTION_KINDS.OverrideRequired,
        }),
      /tenantReference is required/,
    );

    assert.throws(
      () =>
        createBookingException(
          {
            tenantReference: "tenant-b",
            exceptionKind: BOOKING_EXCEPTION_KINDS.ManualIntervention,
          },
          { tenantReference: "tenant-a" },
        ),
      /does not apply to this tenant/,
    );
  });

  it("validates required opaque references", () => {
    assert.throws(
      () =>
        createBookingException({
          tenantReference: "tenant-a",
          exceptionKind: BOOKING_EXCEPTION_KINDS.BusinessException,
          exceptionReference: "  ",
        }),
      /exceptionReference must not be empty when provided/,
    );

    assert.throws(
      () =>
        createBookingException({
          tenantReference: "tenant-a",
          exceptionKind: BOOKING_EXCEPTION_KINDS.OperationalException,
          reasonReference: "  ",
        }),
      /reasonReference must not be empty when provided/,
    );
  });

  it("accepts only known exception kinds and statuses", () => {
    assert.equal(isBookingExceptionKind("booking.conflict"), true);
    assert.equal(isBookingExceptionKind("booking.override_required"), true);
    assert.equal(isBookingExceptionKind("booking.manual_intervention"), true);
    assert.equal(isBookingExceptionKind("booking.business_exception"), true);
    assert.equal(isBookingExceptionKind("booking.operational_exception"), true);
    assert.equal(isBookingExceptionKind("booking.infrastructure_failure"), false);
    assert.equal(isBookingExceptionKind("booking.unknown"), false);

    assert.equal(isBookingExceptionStatus("pending"), true);
    assert.equal(isBookingExceptionStatus("resolved"), true);
    assert.equal(isBookingExceptionStatus("dismissed"), true);
    assert.equal(isBookingExceptionStatus("expired"), true);
    assert.equal(isBookingExceptionStatus("cancelled"), true);
    assert.equal(isBookingExceptionStatus("unknown"), false);

    assert.throws(
      () =>
        createBookingException({
          tenantReference: "tenant-a",
          exceptionKind: "booking.unknown" as never,
        }),
      /Unknown booking exception kind/,
    );

    const resolved = createBookingException({
      tenantReference: "tenant-a",
      exceptionKind: BOOKING_EXCEPTION_KINDS.Conflict,
      exceptionStatus: BOOKING_EXCEPTION_STATUSES.Resolved,
    });
    assert.equal(resolved.exceptionStatus, "resolved");

    const operational = createBookingException({
      tenantReference: "tenant-a",
      exceptionKind: BOOKING_EXCEPTION_KINDS.OperationalException,
    });
    assert.equal(operational.exceptionKind, "booking.operational_exception");
  });

  it("stays separated from Authorization / Approval / Domain Error providers", () => {
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

    const exception = createBookingException({
      tenantReference: "tenant-a",
      exceptionKind: BOOKING_EXCEPTION_KINDS.BusinessException,
      exceptionStatus: BOOKING_EXCEPTION_STATUSES.Dismissed,
    });
    assert.equal(exception.exceptionStatus, "dismissed");
    assert.equal(isBookingException(exception), true);
  });

  it("should not model infrastructure failures as booking exceptions", () => {
    const infrastructureKinds = [
      "payment.provider_failure",
      "integration.provider_failure",
      "runtime.persistence_failure",
      "api.upstream_failure",
      "booking.infrastructure_failure",
    ] as const;

    for (const kind of infrastructureKinds) {
      assert.equal(
        isBookingExceptionKind(kind),
        false,
        `${kind} must not be a booking exception kind`,
      );
      assert.throws(
        () =>
          createBookingException({
            tenantReference: "tenant-a",
            exceptionKind: kind as never,
          }),
        /Unknown booking exception kind/,
      );
    }

    assert.deepEqual([...BOOKING_EXCEPTION_KIND_VALUES].sort(), [
      "booking.business_exception",
      "booking.conflict",
      "booking.manual_intervention",
      "booking.operational_exception",
      "booking.override_required",
    ]);
  });
});
