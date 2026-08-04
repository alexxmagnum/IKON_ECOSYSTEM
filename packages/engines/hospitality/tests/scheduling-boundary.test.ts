/**
 * Hospitality Activity Scheduling contract tests.
 * Run: pnpm --filter @motanos/hospitality test
 */
import assert from "node:assert/strict";
import { readFileSync, readdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { beforeEach, describe, it } from "node:test";
import {
  SCHEDULE_KINDS,
  SCHEDULE_STATUSES,
  createActivitySchedule,
  isHospitalityActivitySchedule,
  isScheduleKind,
  isScheduleStatus,
  resetActivityScheduleReferenceSequence,
} from "../src/public.js";

const packageRoot = join(dirname(fileURLToPath(import.meta.url)), "..");
const schedulingRoot = join(packageRoot, "src", "scheduling");
const hospitalityBusiness = "hospitality-ikon";
const otherHospitalityBusiness = "hospitality-marina";

describe("Hospitality Activity Scheduling Boundary", () => {
  beforeEach(() => {
    resetActivityScheduleReferenceSequence();
  });

  it("creates ActivitySchedule", () => {
    const schedule = createActivitySchedule({
      scheduleKind: SCHEDULE_KINDS.Activity,
      hospitalityReference: hospitalityBusiness,
      activityReference: "activity-1",
      contextReference: "context-1",
      locationReference: "location-1",
      startReference: "moment-start-1",
      endReference: "moment-end-1",
      timezoneReference: "zone-europe-madrid",
      metadata: { note: "opaque-meta" },
    });
    assert.equal(isHospitalityActivitySchedule(schedule), true);
    assert.equal(schedule.scheduleReference, "schedule-1");
    assert.equal(schedule.scheduleStatus, "draft");
    assert.equal(schedule.scheduleKind, "schedule.activity");
    assert.equal(schedule.hospitalityReference, hospitalityBusiness);
    assert.equal(schedule.activityReference, "activity-1");
    assert.equal(schedule.startReference, "moment-start-1");
    assert.equal(
      Object.prototype.hasOwnProperty.call(schedule, "startDate"),
      false,
    );
  });

  it("checks hospitality business isolation", () => {
    assert.throws(
      () =>
        createActivitySchedule({
          scheduleKind: SCHEDULE_KINDS.Event,
          hospitalityReference: "  ",
        }),
      /hospitalityReference must not be empty when provided/,
    );

    assert.throws(
      () =>
        createActivitySchedule(
          {
            scheduleKind: SCHEDULE_KINDS.Recurring,
            hospitalityReference: otherHospitalityBusiness,
          },
          { hospitalityReference: hospitalityBusiness },
        ),
      /does not apply to this hospitality business/,
    );

    assert.throws(
      () =>
        createActivitySchedule({
          scheduleKind: SCHEDULE_KINDS.Internal,
          startReference: "  ",
        }),
      /startReference must not be empty when provided/,
    );
  });

  it("accepts only known schedule kinds", () => {
    assert.equal(isScheduleKind("schedule.activity"), true);
    assert.equal(isScheduleKind("schedule.event"), true);
    assert.equal(isScheduleKind("schedule.recurring"), true);
    assert.equal(isScheduleKind("schedule.internal"), true);
    assert.equal(isScheduleKind("agenda"), false);
    assert.equal(isScheduleKind("slot"), false);
    assert.equal(isScheduleKind("booking"), false);

    assert.throws(
      () =>
        createActivitySchedule({
          scheduleKind: "schedule.unknown" as never,
        }),
      /Unknown schedule kind/,
    );

    assert.throws(
      () =>
        createActivitySchedule({
          scheduleKind: "agenda" as never,
        }),
      /Unknown schedule kind/,
    );
  });

  it("accepts only known schedule statuses", () => {
    assert.equal(isScheduleStatus("draft"), true);
    assert.equal(isScheduleStatus("planned"), true);
    assert.equal(isScheduleStatus("published"), true);
    assert.equal(isScheduleStatus("active"), true);
    assert.equal(isScheduleStatus("completed"), true);
    assert.equal(isScheduleStatus("cancelled"), true);
    assert.equal(isScheduleStatus("archived"), true);
    assert.equal(isScheduleStatus("unknown"), false);
    assert.equal(isScheduleStatus("sold_out"), false);

    const planned = createActivitySchedule({
      scheduleKind: SCHEDULE_KINDS.Event,
      scheduleStatus: SCHEDULE_STATUSES.Planned,
    });
    assert.equal(planned.scheduleStatus, "planned");

    const published = createActivitySchedule({
      scheduleKind: SCHEDULE_KINDS.Recurring,
      scheduleStatus: SCHEDULE_STATUSES.Published,
    });
    assert.equal(published.scheduleStatus, "published");
  });

  it("stays apart from seat-hold / seats / till / alert / external agenda / score logic", () => {
    const scheduleSources = readdirSync(schedulingRoot)
      .filter((name) => name.endsWith(".ts"))
      .map((name) => readFileSync(join(schedulingRoot, name), "utf8"))
      .join("\n")
      .toLowerCase();

    assert.equal(scheduleSources.includes("booking logic"), false);
    assert.equal(scheduleSources.includes("capacity logic"), false);
    assert.equal(scheduleSources.includes("payment logic"), false);
    assert.equal(scheduleSources.includes("notification logic"), false);
    assert.equal(scheduleSources.includes("calendar provider"), false);
    assert.equal(scheduleSources.includes("gamification"), false);

    assert.equal(scheduleSources.includes("publishschedule"), false);
    assert.equal(scheduleSources.includes("cancelschedule"), false);
    assert.equal(scheduleSources.includes("reserveschedule"), false);
    assert.equal(scheduleSources.includes("checkavailability"), false);
    assert.equal(scheduleSources.includes("assigncapacity"), false);

    assert.equal(/\bdate\b/.test(scheduleSources), false);
    assert.equal(scheduleSources.includes("timestamp"), false);

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
      Object.keys(pkg.dependencies ?? {}).includes("@motanos/calendar"),
      false,
    );
    assert.equal(
      Object.keys(pkg.dependencies ?? {}).includes("@motanos/scheduler"),
      false,
    );
    assert.equal(
      Object.keys(pkg.dependencies ?? {}).includes("@motanos/booking"),
      false,
    );

    const schedule = createActivitySchedule({
      scheduleKind: SCHEDULE_KINDS.Internal,
      scheduleStatus: SCHEDULE_STATUSES.Archived,
      hospitalityReference: hospitalityBusiness,
      parentScheduleReference: "schedule-parent-1",
    });
    assert.equal(isHospitalityActivitySchedule(schedule), true);
    assert.equal(schedule.scheduleStatus, "archived");
    assert.equal(schedule.parentScheduleReference, "schedule-parent-1");
  });
});
