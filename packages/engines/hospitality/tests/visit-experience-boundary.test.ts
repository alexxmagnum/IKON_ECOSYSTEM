/**
 * Hospitality Visit Experience contract tests.
 * Run: pnpm --filter @motanos/hospitality test
 */
import assert from "node:assert/strict";
import { readFileSync, readdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { beforeEach, describe, it } from "node:test";
import {
  VISIT_KINDS,
  VISIT_STATUSES,
  createVisitExperience,
  isHospitalityVisitExperience,
  isVisitKind,
  isVisitStatus,
  resetVisitReferenceSequence,
} from "../src/public.js";

const packageRoot = join(dirname(fileURLToPath(import.meta.url)), "..");
const visitExperienceRoot = join(packageRoot, "src", "visit-experience");
const hospitalityBusiness = "hospitality-ikon";
const otherHospitalityBusiness = "hospitality-marina";

describe("Hospitality Visit Experience Boundary", () => {
  beforeEach(() => {
    resetVisitReferenceSequence();
  });

  it("creates VisitExperience", () => {
    const visit = createVisitExperience({
      visitKind: VISIT_KINDS.Activity,
      hospitalityReference: hospitalityBusiness,
      reservationReference: "reservation-runtime-1",
      bookingReference: "booking-1",
      activityReference: "activity-1",
      scheduleReference: "schedule-1",
      participationReference: "participation-1",
      actorReference: "actor-1",
      locationReference: "location-1",
      contextReference: "context-1",
      metadata: { note: "opaque-meta" },
    });
    assert.equal(isHospitalityVisitExperience(visit), true);
    assert.equal(visit.visitReference, "visit-1");
    assert.equal(visit.visitStatus, "draft");
    assert.equal(visit.visitKind, "visit.activity");
    assert.equal(visit.hospitalityReference, hospitalityBusiness);
    assert.equal(visit.reservationReference, "reservation-runtime-1");
    assert.equal(visit.locationReference, "location-1");
    assert.equal(
      Object.prototype.hasOwnProperty.call(visit, "tableReference"),
      false,
    );
    assert.equal(
      Object.prototype.hasOwnProperty.call(visit, "orderReference"),
      false,
    );
    assert.equal(
      Object.prototype.hasOwnProperty.call(visit, "paymentReference"),
      false,
    );
  });

  it("checks hospitality business isolation", () => {
    assert.throws(
      () =>
        createVisitExperience({
          visitKind: VISIT_KINDS.Event,
          hospitalityReference: "  ",
        }),
      /hospitalityReference must not be empty when provided/,
    );

    assert.throws(
      () =>
        createVisitExperience(
          {
            visitKind: VISIT_KINDS.Session,
            hospitalityReference: otherHospitalityBusiness,
          },
          { hospitalityReference: hospitalityBusiness },
        ),
      /does not apply to this hospitality business/,
    );

    assert.throws(
      () =>
        createVisitExperience({
          visitKind: VISIT_KINDS.Internal,
          reservationReference: "  ",
        }),
      /reservationReference must not be empty when provided/,
    );
  });

  it("accepts only known visit kinds", () => {
    assert.equal(isVisitKind("visit.activity"), true);
    assert.equal(isVisitKind("visit.event"), true);
    assert.equal(isVisitKind("visit.session"), true);
    assert.equal(isVisitKind("visit.general"), true);
    assert.equal(isVisitKind("visit.internal"), true);
    assert.equal(isVisitKind("session"), false);
    assert.equal(isVisitKind("ticket"), false);
    assert.equal(isVisitKind("hold"), false);

    assert.throws(
      () =>
        createVisitExperience({
          visitKind: "visit.unknown" as never,
        }),
      /Unknown visit kind/,
    );

    assert.throws(
      () =>
        createVisitExperience({
          visitKind: "ticket" as never,
        }),
      /Unknown visit kind/,
    );
  });

  it("accepts only known visit statuses", () => {
    assert.equal(isVisitStatus("draft"), true);
    assert.equal(isVisitStatus("expected"), true);
    assert.equal(isVisitStatus("arrived"), true);
    assert.equal(isVisitStatus("active"), true);
    assert.equal(isVisitStatus("completed"), true);
    assert.equal(isVisitStatus("cancelled"), true);
    assert.equal(isVisitStatus("expired"), true);
    assert.equal(isVisitStatus("archived"), true);
    assert.equal(isVisitStatus("unknown"), false);
    assert.equal(isVisitStatus("requested"), false);

    const expected = createVisitExperience({
      visitKind: VISIT_KINDS.General,
      visitStatus: VISIT_STATUSES.Expected,
    });
    assert.equal(expected.visitStatus, "expected");

    const arrived = createVisitExperience({
      visitKind: VISIT_KINDS.Event,
      visitStatus: VISIT_STATUSES.Arrived,
    });
    assert.equal(arrived.visitStatus, "arrived");
  });

  it("stays apart from till / ticket / room-bind / prep / alert / score logic", () => {
    const visitSources = readdirSync(visitExperienceRoot)
      .filter((name) => name.endsWith(".ts"))
      .map((name) => readFileSync(join(visitExperienceRoot, name), "utf8"))
      .join("\n")
      .toLowerCase();

    assert.equal(visitSources.includes("payment logic"), false);
    assert.equal(visitSources.includes("order logic"), false);
    assert.equal(visitSources.includes("table assignment"), false);
    assert.equal(visitSources.includes("kitchen logic"), false);
    assert.equal(visitSources.includes("notification logic"), false);
    assert.equal(visitSources.includes("gamification logic"), false);

    assert.equal(visitSources.includes("startvisit"), false);
    assert.equal(visitSources.includes("endvisit"), false);
    assert.equal(visitSources.includes("assigntable"), false);
    assert.equal(visitSources.includes("createorder"), false);
    assert.equal(visitSources.includes("processpayment"), false);
    assert.equal(visitSources.includes("generatereward"), false);

    assert.equal(visitSources.includes("tablereference"), false);
    assert.equal(visitSources.includes("orderreference"), false);
    assert.equal(visitSources.includes("paymentreference"), false);

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
      Object.keys(pkg.dependencies ?? {}).includes("@motanos/visit"),
      false,
    );
    assert.equal(
      Object.keys(pkg.dependencies ?? {}).includes("@motanos/experience"),
      false,
    );
    assert.equal(
      Object.keys(pkg.dependencies ?? {}).includes(
        "@motanos/customer-session",
      ),
      false,
    );

    const visit = createVisitExperience({
      visitKind: VISIT_KINDS.Internal,
      visitStatus: VISIT_STATUSES.Archived,
      hospitalityReference: hospitalityBusiness,
      parentVisitReference: "visit-parent-1",
    });
    assert.equal(isHospitalityVisitExperience(visit), true);
    assert.equal(visit.visitStatus, "archived");
    assert.equal(visit.parentVisitReference, "visit-parent-1");
  });
});
