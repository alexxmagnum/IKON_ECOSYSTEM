/**
 * Hospitality Reservation Management contract tests.
 * Run: pnpm --filter @motanos/hospitality test
 */
import assert from "node:assert/strict";
import { readFileSync, readdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { beforeEach, describe, it } from "node:test";
import {
  RESERVATION_KINDS,
  RESERVATION_STATUSES,
  createReservation,
  isHospitalityReservation,
  isReservationKind,
  isReservationStatus,
  resetReservationReferenceSequence,
} from "../src/public.js";

const packageRoot = join(dirname(fileURLToPath(import.meta.url)), "..");
const reservationsRoot = join(packageRoot, "src", "reservations");
const hospitalityBusiness = "hospitality-a";
const otherHospitalityBusiness = "hospitality-b";

describe("Hospitality Reservation Boundary", () => {
  beforeEach(() => {
    resetReservationReferenceSequence();
  });

  it("creates Reservation", () => {
    const reservation = createReservation({
      reservationKind: RESERVATION_KINDS.Dining,
      hospitalityReference: hospitalityBusiness,
      contextReference: "context-1",
      tableReference: "table-1",
      customerReference: "customer-1",
      guestReference: "guest-1",
      dateReference: "date-1",
      timeReference: "time-1",
      partySizeReference: "party-4",
      metadata: { note: "opaque-meta" },
    });
    assert.equal(isHospitalityReservation(reservation), true);
    assert.equal(reservation.reservationReference, "reservation-1");
    assert.equal(reservation.reservationStatus, "draft");
    assert.equal(reservation.reservationKind, "reservation.dining");
    assert.equal(reservation.hospitalityReference, hospitalityBusiness);
    assert.equal(reservation.tableReference, "table-1");
    assert.equal(reservation.partySizeReference, "party-4");
  });

  it("checks hospitality business isolation", () => {
    assert.throws(
      () =>
        createReservation({
          reservationKind: RESERVATION_KINDS.Bar,
          hospitalityReference: "  ",
        }),
      /hospitalityReference must not be empty when provided/,
    );

    assert.throws(
      () =>
        createReservation(
          {
            reservationKind: RESERVATION_KINDS.Private,
            hospitalityReference: otherHospitalityBusiness,
          },
          { hospitalityReference: hospitalityBusiness },
        ),
      /does not apply to this hospitality business/,
    );

    assert.throws(
      () =>
        createReservation({
          reservationKind: RESERVATION_KINDS.Event,
          tableReference: "  ",
        }),
      /tableReference must not be empty when provided/,
    );
  });

  it("accepts only known reservation kinds", () => {
    assert.equal(isReservationKind("reservation.dining"), true);
    assert.equal(isReservationKind("reservation.bar"), true);
    assert.equal(isReservationKind("reservation.private"), true);
    assert.equal(isReservationKind("reservation.event"), true);
    assert.equal(isReservationKind("reservation.club"), true);
    assert.equal(isReservationKind("reservation.internal"), true);
    assert.equal(isReservationKind("payment"), false);
    assert.equal(isReservationKind("order"), false);
    assert.equal(isReservationKind("calendar"), false);
    assert.equal(isReservationKind("staff"), false);

    assert.throws(
      () =>
        createReservation({
          reservationKind: "reservation.unknown" as never,
        }),
      /Unknown reservation kind/,
    );

    assert.throws(
      () =>
        createReservation({
          reservationKind: "calendar" as never,
        }),
      /Unknown reservation kind/,
    );
  });

  it("accepts only known reservation statuses", () => {
    assert.equal(isReservationStatus("draft"), true);
    assert.equal(isReservationStatus("pending"), true);
    assert.equal(isReservationStatus("confirmed"), true);
    assert.equal(isReservationStatus("arrived"), true);
    assert.equal(isReservationStatus("completed"), true);
    assert.equal(isReservationStatus("cancelled"), true);
    assert.equal(isReservationStatus("no_show"), true);
    assert.equal(isReservationStatus("unknown"), false);
    assert.equal(isReservationStatus("paid"), false);

    const pending = createReservation({
      reservationKind: RESERVATION_KINDS.Dining,
      reservationStatus: RESERVATION_STATUSES.Pending,
    });
    assert.equal(pending.reservationStatus, "pending");

    const confirmed = createReservation({
      reservationKind: RESERVATION_KINDS.Club,
      reservationStatus: RESERVATION_STATUSES.Confirmed,
    });
    assert.equal(confirmed.reservationStatus, "confirmed");

    const noShow = createReservation({
      reservationKind: RESERVATION_KINDS.Internal,
      reservationStatus: RESERVATION_STATUSES.NoShow,
    });
    assert.equal(noShow.reservationStatus, "no_show");
  });

  it("stays apart from calendar / availability / assignment / notification / customer / payment logic", () => {
    const reservationSources = readdirSync(reservationsRoot)
      .filter((name) => name.endsWith(".ts"))
      .map((name) => readFileSync(join(reservationsRoot, name), "utf8"))
      .join("\n");

    assert.equal(reservationSources.includes("confirmReservation"), false);
    assert.equal(reservationSources.includes("assignTable"), false);
    assert.equal(reservationSources.includes("checkAvailability"), false);
    assert.equal(reservationSources.includes("sendReminder"), false);
    assert.equal(reservationSources.includes("notifyCustomer"), false);
    assert.equal(reservationSources.includes("cancelBooking"), false);
    assert.equal(reservationSources.includes("optimizeCapacity"), false);
    assert.equal(reservationSources.includes("syncCalendar"), false);
    assert.equal(reservationSources.includes("partySize:"), false);

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
      Object.keys(pkg.dependencies ?? {}).includes("@motanos/calendar"),
      false,
    );
    assert.equal(
      Object.keys(pkg.dependencies ?? {}).includes("@motanos/notification"),
      false,
    );

    const reservation = createReservation({
      reservationKind: RESERVATION_KINDS.Event,
      reservationStatus: RESERVATION_STATUSES.Completed,
      hospitalityReference: hospitalityBusiness,
      parentReservationReference: "reservation-parent-1",
    });
    assert.equal(isHospitalityReservation(reservation), true);
    assert.equal(reservation.reservationStatus, "completed");
    assert.equal(
      reservation.parentReservationReference,
      "reservation-parent-1",
    );
  });
});
