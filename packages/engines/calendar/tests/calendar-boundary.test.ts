/**
 * Calendar Engine Boundary contract tests.
 * Run: pnpm --filter @motanos/calendar test
 */
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { beforeEach, describe, it } from "node:test";
import {
  CALENDAR_EVENT_KINDS,
  CALENDAR_EVENT_STATUSES,
  createCalendarEvent,
  isCalendarEvent,
  isCalendarEventKind,
  isCalendarEventStatus,
  resetCalendarEventReferenceSequence,
} from "../src/index.js";

const packageRoot = join(dirname(fileURLToPath(import.meta.url)), "..");

describe("Calendar Engine Boundary", () => {
  beforeEach(() => {
    resetCalendarEventReferenceSequence();
  });

  it("creates Calendar Event Boundary context", () => {
    const event = createCalendarEvent({
      tenantReference: "tenant-a",
      eventKind: CALENDAR_EVENT_KINDS.Tournament,
      nameReference: "name-1",
      descriptionReference: "desc-1",
      experienceReference: "experience-1",
      resourceReference: "resource-1",
      communityReference: "community-1",
      startReference: "start-1",
      endReference: "end-1",
    });
    assert.equal(isCalendarEvent(event), true);
    assert.equal(event.eventReference, "event-1");
    assert.equal(event.eventStatus, "draft");
    assert.equal(event.eventKind, "calendar.tournament");
    assert.equal(event.tenantReference, "tenant-a");
    assert.equal(event.experienceReference, "experience-1");
  });

  it("validates tenant isolation", () => {
    assert.throws(
      () =>
        createCalendarEvent({
          tenantReference: "  ",
          eventKind: CALENDAR_EVENT_KINDS.Event,
        }),
      /tenantReference is required/,
    );

    assert.throws(
      () =>
        createCalendarEvent(
          {
            tenantReference: "tenant-b",
            eventKind: CALENDAR_EVENT_KINDS.Session,
          },
          { tenantReference: "tenant-a" },
        ),
      /does not apply to this tenant/,
    );

    assert.throws(
      () =>
        createCalendarEvent({
          tenantReference: "tenant-a",
          eventKind: CALENDAR_EVENT_KINDS.Activity,
          nameReference: "  ",
        }),
      /nameReference must not be empty when provided/,
    );
  });

  it("accepts only known calendar event kinds", () => {
    assert.equal(isCalendarEventKind("calendar.event"), true);
    assert.equal(isCalendarEventKind("calendar.session"), true);
    assert.equal(isCalendarEventKind("calendar.activity"), true);
    assert.equal(isCalendarEventKind("calendar.tournament"), true);
    assert.equal(isCalendarEventKind("calendar.maintenance"), true);
    assert.equal(isCalendarEventKind("calendar.operational"), true);
    assert.equal(isCalendarEventKind("calendar.unknown"), false);

    assert.throws(
      () =>
        createCalendarEvent({
          tenantReference: "tenant-a",
          eventKind: "calendar.unknown" as never,
        }),
      /Unknown calendar event kind/,
    );
  });

  it("accepts only known calendar event statuses", () => {
    assert.equal(isCalendarEventStatus("draft"), true);
    assert.equal(isCalendarEventStatus("scheduled"), true);
    assert.equal(isCalendarEventStatus("active"), true);
    assert.equal(isCalendarEventStatus("completed"), true);
    assert.equal(isCalendarEventStatus("cancelled"), true);
    assert.equal(isCalendarEventStatus("archived"), true);
    assert.equal(isCalendarEventStatus("unknown"), false);

    const scheduled = createCalendarEvent({
      tenantReference: "tenant-a",
      eventKind: CALENDAR_EVENT_KINDS.Maintenance,
      eventStatus: CALENDAR_EVENT_STATUSES.Scheduled,
    });
    assert.equal(scheduled.eventStatus, "scheduled");

    const active = createCalendarEvent({
      tenantReference: "tenant-a",
      eventKind: CALENDAR_EVENT_KINDS.Operational,
      eventStatus: CALENDAR_EVENT_STATUSES.Active,
    });
    assert.equal(active.eventStatus, "active");
  });

  it("stays separated from usage / free-busy / commerce packages", () => {
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
    assert.equal(
      Object.keys(pkg.dependencies ?? {}).includes("@motanos/resource"),
      false,
    );
    assert.equal(
      Object.keys(pkg.dependencies ?? {}).includes("@motanos/experience"),
      false,
    );
    assert.equal(
      Object.keys(pkg.dependencies ?? {}).includes("@motanos/community"),
      false,
    );
    assert.equal(
      Object.keys(pkg.dependencies ?? {}).includes("@motanos/auth"),
      false,
    );

    const event = createCalendarEvent({
      tenantReference: "tenant-a",
      eventKind: CALENDAR_EVENT_KINDS.Event,
      eventStatus: CALENDAR_EVENT_STATUSES.Completed,
    });
    assert.equal(isCalendarEvent(event), true);
    assert.equal(event.eventStatus, "completed");
  });
});
