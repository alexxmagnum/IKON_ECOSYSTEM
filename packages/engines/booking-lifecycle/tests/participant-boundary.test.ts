/**
 * Booking Participant Boundary contract tests.
 * Run: pnpm --filter @motanos/booking test
 */
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { beforeEach, describe, it } from "node:test";
import {
  BOOKING_PARTICIPANT_KINDS,
  BOOKING_PARTICIPANT_STATUSES,
  createBookingParticipant,
  isBookingParticipant,
  isBookingParticipantKind,
  isBookingParticipantStatus,
  resetBookingParticipantReferenceSequence,
} from "../src/index.js";

const packageRoot = join(dirname(fileURLToPath(import.meta.url)), "..");

describe("Booking Participant Boundary", () => {
  beforeEach(() => {
    resetBookingParticipantReferenceSequence();
  });

  it("creates Participant Boundary context", () => {
    const participant = createBookingParticipant({
      tenantReference: "tenant-a",
      bookingReference: "bk-1",
      participantKind: BOOKING_PARTICIPANT_KINDS.Primary,
      actorReference: "actor-1",
      identityReference: "identity-1",
      membershipReference: "membership-1",
    });
    assert.equal(isBookingParticipant(participant), true);
    assert.equal(participant.participantReference, "participant-1");
    assert.equal(participant.participantStatus, "invited");
    assert.equal(participant.participantKind, "booking.primary");
    assert.equal(participant.bookingReference, "bk-1");
  });

  it("validates tenant isolation", () => {
    assert.throws(
      () =>
        createBookingParticipant({
          tenantReference: "  ",
          bookingReference: "bk-1",
          participantKind: BOOKING_PARTICIPANT_KINDS.Guest,
        }),
      /tenantReference is required/,
    );

    assert.throws(
      () =>
        createBookingParticipant(
          {
            tenantReference: "tenant-b",
            bookingReference: "bk-1",
            participantKind: BOOKING_PARTICIPANT_KINDS.Player,
          },
          { tenantReference: "tenant-a" },
        ),
      /does not apply to this tenant/,
    );

    assert.throws(
      () =>
        createBookingParticipant({
          tenantReference: "tenant-a",
          bookingReference: "bk-1",
          participantKind: BOOKING_PARTICIPANT_KINDS.Attendee,
          actorReference: "  ",
        }),
      /actorReference must not be empty when provided/,
    );
  });

  it("requires bookingReference", () => {
    assert.throws(
      () =>
        createBookingParticipant({
          tenantReference: "tenant-a",
          bookingReference: "  ",
          participantKind: BOOKING_PARTICIPANT_KINDS.Staff,
        }),
      /bookingReference is required/,
    );
  });

  it("accepts only known participant kinds and statuses", () => {
    assert.equal(isBookingParticipantKind("booking.primary"), true);
    assert.equal(isBookingParticipantKind("booking.guest"), true);
    assert.equal(isBookingParticipantKind("booking.attendee"), true);
    assert.equal(isBookingParticipantKind("booking.player"), true);
    assert.equal(isBookingParticipantKind("booking.staff"), true);
    assert.equal(isBookingParticipantKind("booking.operational"), true);
    assert.equal(isBookingParticipantKind("booking.unknown"), false);

    assert.equal(isBookingParticipantStatus("invited"), true);
    assert.equal(isBookingParticipantStatus("confirmed"), true);
    assert.equal(isBookingParticipantStatus("checked_in"), true);
    assert.equal(isBookingParticipantStatus("completed"), true);
    assert.equal(isBookingParticipantStatus("cancelled"), true);
    assert.equal(isBookingParticipantStatus("removed"), true);
    assert.equal(isBookingParticipantStatus("unknown"), false);

    assert.throws(
      () =>
        createBookingParticipant({
          tenantReference: "tenant-a",
          bookingReference: "bk-1",
          participantKind: "booking.unknown" as never,
        }),
      /Unknown booking participant kind/,
    );

    const confirmed = createBookingParticipant({
      tenantReference: "tenant-a",
      bookingReference: "bk-1",
      participantKind: BOOKING_PARTICIPANT_KINDS.Guest,
      participantStatus: BOOKING_PARTICIPANT_STATUSES.Confirmed,
    });
    assert.equal(confirmed.participantStatus, "confirmed");
  });

  it("stays separated from Identity / Membership / Payment / Notification / Auth", () => {
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

    const participant = createBookingParticipant({
      tenantReference: "tenant-a",
      bookingReference: "bk-1",
      participantKind: BOOKING_PARTICIPANT_KINDS.Operational,
      participantStatus: BOOKING_PARTICIPANT_STATUSES.CheckedIn,
    });
    assert.equal(participant.participantStatus, "checked_in");
    assert.equal(isBookingParticipant(participant), true);
  });
});
