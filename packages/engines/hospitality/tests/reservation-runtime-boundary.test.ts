/**
 * Hospitality Reservation Runtime contract tests.
 * Run: pnpm --filter @motanos/hospitality test
 */
import assert from "node:assert/strict";
import { readFileSync, readdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { beforeEach, describe, it } from "node:test";
import {
  RESERVATION_RUNTIME_KINDS,
  RESERVATION_RUNTIME_STATUSES,
  createReservationRuntime,
  isHospitalityReservationRuntime,
  isReservationRuntimeKind,
  isReservationRuntimeStatus,
  resetReservationRuntimeReferenceSequence,
} from "../src/public.js";

const packageRoot = join(dirname(fileURLToPath(import.meta.url)), "..");
const reservationRuntimeRoot = join(packageRoot, "src", "reservation-runtime");
const hospitalityBusiness = "hospitality-ikon";
const otherHospitalityBusiness = "hospitality-marina";

describe("Hospitality Reservation Runtime Boundary", () => {
  beforeEach(() => {
    resetReservationRuntimeReferenceSequence();
  });

  it("creates Reservation", () => {
    const reservation = createReservationRuntime({
      reservationKind: RESERVATION_RUNTIME_KINDS.Activity,
      hospitalityReference: hospitalityBusiness,
      activityReference: "activity-1",
      scheduleReference: "schedule-1",
      bookingReference: "booking-1",
      participationReference: "participation-1",
      availabilityReference: "availability-1",
      actorReference: "actor-1",
      guestReference: "guest-1",
      contextReference: "context-1",
      metadata: { note: "opaque-meta" },
    });
    assert.equal(isHospitalityReservationRuntime(reservation), true);
    assert.equal(
      reservation.reservationReference,
      "reservation-runtime-1",
    );
    assert.equal(reservation.reservationStatus, "draft");
    assert.equal(reservation.reservationKind, "reservation.activity");
    assert.equal(reservation.hospitalityReference, hospitalityBusiness);
    assert.equal(reservation.bookingReference, "booking-1");
    assert.equal(reservation.participationReference, "participation-1");
    assert.equal(
      Object.prototype.hasOwnProperty.call(reservation, "price"),
      false,
    );
    assert.equal(
      Object.prototype.hasOwnProperty.call(reservation, "paymentReference"),
      false,
    );
    assert.equal(
      Object.prototype.hasOwnProperty.call(reservation, "tableNumber"),
      false,
    );
    assert.equal(
      Object.prototype.hasOwnProperty.call(reservation, "seatNumber"),
      false,
    );
    assert.equal(
      Object.prototype.hasOwnProperty.call(reservation, "checkInTime"),
      false,
    );
  });

  it("checks hospitality business isolation", () => {
    assert.throws(
      () =>
        createReservationRuntime({
          reservationKind: RESERVATION_RUNTIME_KINDS.Event,
          hospitalityReference: "  ",
        }),
      /hospitalityReference must not be empty when provided/,
    );

    assert.throws(
      () =>
        createReservationRuntime(
          {
            reservationKind: RESERVATION_RUNTIME_KINDS.Session,
            hospitalityReference: otherHospitalityBusiness,
          },
          { hospitalityReference: hospitalityBusiness },
        ),
      /does not apply to this hospitality business/,
    );

    assert.throws(
      () =>
        createReservationRuntime({
          reservationKind: RESERVATION_RUNTIME_KINDS.Internal,
          bookingReference: "  ",
        }),
      /bookingReference must not be empty when provided/,
    );
  });

  it("accepts only known reservation kinds", () => {
    assert.equal(isReservationRuntimeKind("reservation.activity"), true);
    assert.equal(isReservationRuntimeKind("reservation.event"), true);
    assert.equal(isReservationRuntimeKind("reservation.session"), true);
    assert.equal(isReservationRuntimeKind("reservation.internal"), true);
    assert.equal(isReservationRuntimeKind("reservation.dining"), false);
    assert.equal(isReservationRuntimeKind("ticket"), false);
    assert.equal(isReservationRuntimeKind("hold"), false);

    assert.throws(
      () =>
        createReservationRuntime({
          reservationKind: "reservation.unknown" as never,
        }),
      /Unknown reservation-runtime kind/,
    );

    assert.throws(
      () =>
        createReservationRuntime({
          reservationKind: "ticket" as never,
        }),
      /Unknown reservation-runtime kind/,
    );
  });

  it("accepts only known reservation statuses", () => {
    assert.equal(isReservationRuntimeStatus("draft"), true);
    assert.equal(isReservationRuntimeStatus("requested"), true);
    assert.equal(isReservationRuntimeStatus("confirmed"), true);
    assert.equal(isReservationRuntimeStatus("active"), true);
    assert.equal(isReservationRuntimeStatus("completed"), true);
    assert.equal(isReservationRuntimeStatus("cancelled"), true);
    assert.equal(isReservationRuntimeStatus("expired"), true);
    assert.equal(isReservationRuntimeStatus("archived"), true);
    assert.equal(isReservationRuntimeStatus("unknown"), false);
    assert.equal(isReservationRuntimeStatus("arrived"), false);
    assert.equal(isReservationRuntimeStatus("no_show"), false);

    const requested = createReservationRuntime({
      reservationKind: RESERVATION_RUNTIME_KINDS.Session,
      reservationStatus: RESERVATION_RUNTIME_STATUSES.Requested,
    });
    assert.equal(requested.reservationStatus, "requested");

    const confirmed = createReservationRuntime({
      reservationKind: RESERVATION_RUNTIME_KINDS.Event,
      reservationStatus: RESERVATION_RUNTIME_STATUSES.Confirmed,
    });
    assert.equal(confirmed.reservationStatus, "confirmed");
  });

  it("stays apart from till / room-bind / ticket / door-scan / alert / score logic", () => {
    const reservationSources = readdirSync(reservationRuntimeRoot)
      .filter((name) => name.endsWith(".ts"))
      .map((name) => readFileSync(join(reservationRuntimeRoot, name), "utf8"))
      .join("\n")
      .toLowerCase();

    assert.equal(reservationSources.includes("payment logic"), false);
    assert.equal(reservationSources.includes("table assignment"), false);
    assert.equal(reservationSources.includes("order logic"), false);
    assert.equal(reservationSources.includes("check-in logic"), false);
    assert.equal(reservationSources.includes("notification logic"), false);
    assert.equal(reservationSources.includes("gamification logic"), false);

    assert.equal(reservationSources.includes("confirmreservation"), false);
    assert.equal(reservationSources.includes("cancelreservation"), false);
    assert.equal(reservationSources.includes("assigntable"), false);
    assert.equal(reservationSources.includes("processpayment"), false);
    assert.equal(reservationSources.includes("checkinguest"), false);
    assert.equal(reservationSources.includes("completevisit"), false);

    assert.equal(reservationSources.includes("paymentreference"), false);
    assert.equal(reservationSources.includes("tablenumber"), false);
    assert.equal(reservationSources.includes("seatnumber"), false);
    assert.equal(reservationSources.includes("checkintime"), false);

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
      Object.keys(pkg.dependencies ?? {}).includes("@motanos/booking"),
      false,
    );
    assert.equal(
      Object.keys(pkg.dependencies ?? {}).includes("@motanos/reservation"),
      false,
    );
    assert.equal(
      Object.keys(pkg.dependencies ?? {}).includes("@motanos/ticketing"),
      false,
    );

    const reservation = createReservationRuntime({
      reservationKind: RESERVATION_RUNTIME_KINDS.Internal,
      reservationStatus: RESERVATION_RUNTIME_STATUSES.Archived,
      hospitalityReference: hospitalityBusiness,
      parentReservationReference: "reservation-runtime-parent-1",
    });
    assert.equal(isHospitalityReservationRuntime(reservation), true);
    assert.equal(reservation.reservationStatus, "archived");
    assert.equal(
      reservation.parentReservationReference,
      "reservation-runtime-parent-1",
    );
  });
});
