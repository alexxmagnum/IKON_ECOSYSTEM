/**
 * Hospitality Activities contract tests.
 * Run: pnpm --filter @motanos/hospitality test
 */
import assert from "node:assert/strict";
import { readFileSync, readdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { beforeEach, describe, it } from "node:test";
import {
  ACTIVITY_KINDS,
  ACTIVITY_STATUSES,
  createActivity,
  isActivityKind,
  isActivityStatus,
  isHospitalityActivity,
  resetActivityReferenceSequence,
} from "../src/public.js";

const packageRoot = join(dirname(fileURLToPath(import.meta.url)), "..");
const activitiesRoot = join(packageRoot, "src", "activities");
const hospitalityBusiness = "hospitality-ikon";
const otherHospitalityBusiness = "hospitality-marina";

describe("Hospitality Activities Boundary", () => {
  beforeEach(() => {
    resetActivityReferenceSequence();
  });

  it("creates Activity", () => {
    const activity = createActivity({
      activityKind: ACTIVITY_KINDS.Business,
      hospitalityReference: hospitalityBusiness,
      communityReference: "community-1",
      contextReference: "context-1",
      creatorReference: "creator-1",
      proposalReference: "proposal-1",
      locationReference: "location-1",
      reservationReference: "reservation-1",
      metadata: { note: "opaque-meta" },
    });
    assert.equal(isHospitalityActivity(activity), true);
    assert.equal(activity.activityReference, "activity-1");
    assert.equal(activity.activityStatus, "draft");
    assert.equal(activity.activityKind, "activity.business");
    assert.equal(activity.hospitalityReference, hospitalityBusiness);
    assert.equal(activity.communityReference, "community-1");
    assert.equal(activity.creatorReference, "creator-1");
  });

  it("checks hospitality business isolation", () => {
    assert.throws(
      () =>
        createActivity({
          activityKind: ACTIVITY_KINDS.Sport,
          hospitalityReference: "  ",
        }),
      /hospitalityReference must not be empty when provided/,
    );

    assert.throws(
      () =>
        createActivity(
          {
            activityKind: ACTIVITY_KINDS.Community,
            hospitalityReference: otherHospitalityBusiness,
          },
          { hospitalityReference: hospitalityBusiness },
        ),
      /does not apply to this hospitality business/,
    );

    assert.throws(
      () =>
        createActivity({
          activityKind: ACTIVITY_KINDS.Social,
          communityReference: "  ",
        }),
      /communityReference must not be empty when provided/,
    );
  });

  it("accepts only known activity kinds", () => {
    assert.equal(isActivityKind("activity.business"), true);
    assert.equal(isActivityKind("activity.community"), true);
    assert.equal(isActivityKind("activity.event"), true);
    assert.equal(isActivityKind("activity.sport"), true);
    assert.equal(isActivityKind("activity.social"), true);
    assert.equal(isActivityKind("activity.internal"), true);
    assert.equal(isActivityKind("tournament"), false);
    assert.equal(isActivityKind("workshop"), false);
    assert.equal(isActivityKind("meetup"), false);

    assert.throws(
      () =>
        createActivity({
          activityKind: "activity.unknown" as never,
        }),
      /Unknown activity kind/,
    );

    assert.throws(
      () =>
        createActivity({
          activityKind: "tournament" as never,
        }),
      /Unknown activity kind/,
    );
  });

  it("accepts only known activity statuses", () => {
    assert.equal(isActivityStatus("draft"), true);
    assert.equal(isActivityStatus("proposed"), true);
    assert.equal(isActivityStatus("review"), true);
    assert.equal(isActivityStatus("approved"), true);
    assert.equal(isActivityStatus("published"), true);
    assert.equal(isActivityStatus("cancelled"), true);
    assert.equal(isActivityStatus("archived"), true);
    assert.equal(isActivityStatus("unknown"), false);
    assert.equal(isActivityStatus("rejected"), false);

    const proposed = createActivity({
      activityKind: ACTIVITY_KINDS.Community,
      activityStatus: ACTIVITY_STATUSES.Proposed,
    });
    assert.equal(proposed.activityStatus, "proposed");

    const published = createActivity({
      activityKind: ACTIVITY_KINDS.Event,
      activityStatus: ACTIVITY_STATUSES.Published,
    });
    assert.equal(published.activityStatus, "published");
  });

  it("stays apart from schedule / seat-hold / till / alert / badge / score logic", () => {
    const activitySources = readdirSync(activitiesRoot)
      .filter((name) => name.endsWith(".ts"))
      .map((name) => readFileSync(join(activitiesRoot, name), "utf8"))
      .join("\n")
      .toLowerCase();

    assert.equal(activitySources.includes("calendar runtime"), false);
    assert.equal(activitySources.includes("booking logic"), false);
    assert.equal(activitySources.includes("payment logic"), false);
    assert.equal(activitySources.includes("notification logic"), false);
    assert.equal(activitySources.includes("gamification"), false);
    assert.equal(activitySources.includes("reward"), false);

    assert.equal(activitySources.includes("approveactivity"), false);
    assert.equal(activitySources.includes("publishactivity"), false);
    assert.equal(activitySources.includes("joinactivity"), false);
    assert.equal(activitySources.includes("reserveactivity"), false);
    assert.equal(activitySources.includes("payactivity"), false);

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
      Object.keys(pkg.dependencies ?? {}).includes("@motanos/activity"),
      false,
    );
    assert.equal(
      Object.keys(pkg.dependencies ?? {}).includes("@motanos/event"),
      false,
    );
    assert.equal(
      Object.keys(pkg.dependencies ?? {}).includes("@motanos/calendar"),
      false,
    );

    const activity = createActivity({
      activityKind: ACTIVITY_KINDS.Internal,
      activityStatus: ACTIVITY_STATUSES.Archived,
      hospitalityReference: hospitalityBusiness,
      parentActivityReference: "activity-parent-1",
    });
    assert.equal(isHospitalityActivity(activity), true);
    assert.equal(activity.activityStatus, "archived");
    assert.equal(activity.parentActivityReference, "activity-parent-1");
  });
});
