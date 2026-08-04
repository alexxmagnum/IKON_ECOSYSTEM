/**
 * Hospitality Participation contract tests.
 * Run: pnpm --filter @motanos/hospitality test
 */
import assert from "node:assert/strict";
import { readFileSync, readdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { beforeEach, describe, it } from "node:test";
import {
  PARTICIPATION_KINDS,
  PARTICIPATION_STATUSES,
  createParticipation,
  isHospitalityParticipation,
  isParticipationKind,
  isParticipationStatus,
  resetParticipationReferenceSequence,
} from "../src/public.js";

const packageRoot = join(dirname(fileURLToPath(import.meta.url)), "..");
const participationRoot = join(packageRoot, "src", "participation");
const hospitalityBusiness = "hospitality-ikon";
const otherHospitalityBusiness = "hospitality-marina";

describe("Hospitality Participation Boundary", () => {
  beforeEach(() => {
    resetParticipationReferenceSequence();
  });

  it("creates Participation", () => {
    const participation = createParticipation({
      participationKind: PARTICIPATION_KINDS.Member,
      hospitalityReference: hospitalityBusiness,
      communityReference: "community-1",
      activityReference: "activity-1",
      actorReference: "actor-1",
      memberReference: "member-1",
      reservationReference: "reservation-1",
      metadata: { note: "opaque-meta" },
    });
    assert.equal(isHospitalityParticipation(participation), true);
    assert.equal(participation.participationReference, "participation-1");
    assert.equal(participation.participationStatus, "draft");
    assert.equal(participation.participationKind, "participation.member");
    assert.equal(participation.hospitalityReference, hospitalityBusiness);
    assert.equal(participation.activityReference, "activity-1");
    assert.equal(participation.memberReference, "member-1");
  });

  it("checks hospitality business isolation", () => {
    assert.throws(
      () =>
        createParticipation({
          participationKind: PARTICIPATION_KINDS.Guest,
          hospitalityReference: "  ",
        }),
      /hospitalityReference must not be empty when provided/,
    );

    assert.throws(
      () =>
        createParticipation(
          {
            participationKind: PARTICIPATION_KINDS.Community,
            hospitalityReference: otherHospitalityBusiness,
          },
          { hospitalityReference: hospitalityBusiness },
        ),
      /does not apply to this hospitality business/,
    );

    assert.throws(
      () =>
        createParticipation({
          participationKind: PARTICIPATION_KINDS.Business,
          activityReference: "  ",
        }),
      /activityReference must not be empty when provided/,
    );
  });

  it("accepts only known participation kinds", () => {
    assert.equal(isParticipationKind("participation.member"), true);
    assert.equal(isParticipationKind("participation.guest"), true);
    assert.equal(isParticipationKind("participation.community"), true);
    assert.equal(isParticipationKind("participation.business"), true);
    assert.equal(isParticipationKind("participation.internal"), true);
    assert.equal(isParticipationKind("ticket"), false);
    assert.equal(isParticipationKind("seat"), false);
    assert.equal(isParticipationKind("rsvp"), false);

    assert.throws(
      () =>
        createParticipation({
          participationKind: "participation.unknown" as never,
        }),
      /Unknown participation kind/,
    );

    assert.throws(
      () =>
        createParticipation({
          participationKind: "ticket" as never,
        }),
      /Unknown participation kind/,
    );
  });

  it("accepts only known participation statuses", () => {
    assert.equal(isParticipationStatus("draft"), true);
    assert.equal(isParticipationStatus("interested"), true);
    assert.equal(isParticipationStatus("requested"), true);
    assert.equal(isParticipationStatus("confirmed"), true);
    assert.equal(isParticipationStatus("cancelled"), true);
    assert.equal(isParticipationStatus("completed"), true);
    assert.equal(isParticipationStatus("archived"), true);
    assert.equal(isParticipationStatus("unknown"), false);
    assert.equal(isParticipationStatus("checked_in"), false);

    const interested = createParticipation({
      participationKind: PARTICIPATION_KINDS.Guest,
      participationStatus: PARTICIPATION_STATUSES.Interested,
    });
    assert.equal(interested.participationStatus, "interested");

    const confirmed = createParticipation({
      participationKind: PARTICIPATION_KINDS.Business,
      participationStatus: PARTICIPATION_STATUSES.Confirmed,
    });
    assert.equal(confirmed.participationStatus, "confirmed");
  });

  it("stays apart from seat-hold / till / door-scan / badge / score / alert logic", () => {
    const participationSources = readdirSync(participationRoot)
      .filter((name) => name.endsWith(".ts"))
      .map((name) => readFileSync(join(participationRoot, name), "utf8"))
      .join("\n")
      .toLowerCase();

    assert.equal(participationSources.includes("booking logic"), false);
    assert.equal(participationSources.includes("payment logic"), false);
    assert.equal(participationSources.includes("attendance tracking"), false);
    assert.equal(participationSources.includes("gamification"), false);
    assert.equal(participationSources.includes("reward"), false);
    assert.equal(participationSources.includes("notification logic"), false);

    assert.equal(participationSources.includes("joinactivity"), false);
    assert.equal(participationSources.includes("leaveactivity"), false);
    assert.equal(participationSources.includes("confirmparticipation"), false);
    assert.equal(participationSources.includes("reserveplace"), false);
    assert.equal(participationSources.includes("checkin"), false);
    assert.equal(participationSources.includes("cancelbooking"), false);

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
      Object.keys(pkg.dependencies ?? {}).includes("@motanos/participation"),
      false,
    );
    assert.equal(
      Object.keys(pkg.dependencies ?? {}).includes("@motanos/booking"),
      false,
    );
    assert.equal(
      Object.keys(pkg.dependencies ?? {}).includes("@motanos/ticketing"),
      false,
    );

    const participation = createParticipation({
      participationKind: PARTICIPATION_KINDS.Internal,
      participationStatus: PARTICIPATION_STATUSES.Archived,
      hospitalityReference: hospitalityBusiness,
      parentParticipationReference: "participation-parent-1",
    });
    assert.equal(isHospitalityParticipation(participation), true);
    assert.equal(participation.participationStatus, "archived");
    assert.equal(
      participation.parentParticipationReference,
      "participation-parent-1",
    );
  });
});
