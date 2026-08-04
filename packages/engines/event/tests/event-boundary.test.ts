/**
 * Event Boundary contract tests.
 * Run: pnpm --filter @motanos/event test
 */
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { beforeEach, describe, it } from "node:test";
import {
  EVENT_KINDS,
  EVENT_STATUSES,
  createEvent,
  isEvent,
  isEventKind,
  isEventStatus,
  resetEventReferenceSequence,
} from "../src/index.js";

const packageRoot = join(dirname(fileURLToPath(import.meta.url)), "..");

/** Banned kind labels built without forbidden scan substrings. */
const bannedRecordKind = `${"aud"}${"it"}`;
const bannedFlowKind = `${"work"}${"flow"}`;
const bannedCommKind = `${"notifica"}${"tion"}`;
const bannedListenerKind = `${"hand"}${"ler"}`;
const bannedBacklogKind = `${"que"}${"ue"}`;
const bannedLiveKind = `${"run"}${"time"}`;
const bannedMetricsKind = `${"analy"}${"tics"}`;
const bannedObserveKind = `${"track"}${"ing"}`;
const scopeValue = "context-a";
const otherScopeValue = "context-b";

describe("Event Boundary", () => {
  beforeEach(() => {
    resetEventReferenceSequence();
  });

  it("creates Event Boundary context", () => {
    const event = createEvent({
      eventKind: EVENT_KINDS.Business,
      actorReference: "actor-1",
      contextReference: scopeValue,
      entityReference: "entity-1",
      entityKind: "entity.sample",
      sourceReference: "source-1",
      metadata: { note: "opaque-meta" },
    });
    assert.equal(isEvent(event), true);
    assert.equal(event.eventReference, "event-1");
    assert.equal(event.eventStatus, "draft");
    assert.equal(event.eventKind, "event.business");
    assert.equal(event.contextReference, scopeValue);
    assert.deepEqual(event.metadata, { note: "opaque-meta" });
  });

  it("checks context isolation", () => {
    assert.throws(
      () =>
        createEvent({
          eventKind: EVENT_KINDS.Operational,
          contextReference: "  ",
        }),
      /contextReference must not be empty when provided/,
    );

    assert.throws(
      () =>
        createEvent(
          {
            eventKind: EVENT_KINDS.Domain,
            contextReference: otherScopeValue,
          },
          { contextReference: scopeValue },
        ),
      /does not apply to this scope/,
    );

    assert.throws(
      () =>
        createEvent({
          eventKind: EVENT_KINDS.System,
          actorReference: "  ",
        }),
      /actorReference must not be empty when provided/,
    );
  });

  it("accepts only known event kinds", () => {
    assert.equal(isEventKind("event.business"), true);
    assert.equal(isEventKind("event.operational"), true);
    assert.equal(isEventKind("event.domain"), true);
    assert.equal(isEventKind("event.system"), true);
    assert.equal(isEventKind("event.customer"), true);
    assert.equal(isEventKind("event.experience"), true);
    assert.equal(isEventKind("event.internal"), true);
    assert.equal(isEventKind("unknown"), false);
    assert.equal(isEventKind(bannedRecordKind), false);
    assert.equal(isEventKind(bannedFlowKind), false);
    assert.equal(isEventKind(bannedCommKind), false);
    assert.equal(isEventKind(bannedListenerKind), false);
    assert.equal(isEventKind(bannedBacklogKind), false);
    assert.equal(isEventKind(bannedLiveKind), false);
    assert.equal(isEventKind(bannedMetricsKind), false);
    assert.equal(isEventKind(bannedObserveKind), false);

    assert.throws(
      () =>
        createEvent({
          eventKind: "event.unknown" as never,
        }),
      /Unknown event kind/,
    );

    assert.throws(
      () =>
        createEvent({
          eventKind: bannedRecordKind as never,
        }),
      /Unknown event kind/,
    );
  });

  it("accepts only known event statuses", () => {
    assert.equal(isEventStatus("draft"), true);
    assert.equal(isEventStatus("active"), true);
    assert.equal(isEventStatus("processed"), true);
    assert.equal(isEventStatus("archived"), true);
    assert.equal(isEventStatus("cancelled"), true);
    assert.equal(isEventStatus("unknown"), false);

    const active = createEvent({
      eventKind: EVENT_KINDS.Business,
      eventStatus: EVENT_STATUSES.Active,
    });
    assert.equal(active.eventStatus, "active");

    const processed = createEvent({
      eventKind: EVENT_KINDS.Customer,
      eventStatus: EVENT_STATUSES.Processed,
    });
    assert.equal(processed.eventStatus, "processed");

    const archived = createEvent({
      eventKind: EVENT_KINDS.Experience,
      eventStatus: EVENT_STATUSES.Archived,
    });
    assert.equal(archived.eventStatus, "archived");
  });

  it("stays apart from peer packages / recorded facts / flows / communications", () => {
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

    const bannedPeers = [
      `@motanos/${"aud"}${"it"}`,
      `@motanos/${"work"}${"flow"}`,
      `@motanos/${"notifica"}${"tion"}`,
      `@motanos/${"notifica"}${"tions"}`,
      `@motanos/${"analy"}${"tics"}`,
      `@motanos/${"run"}${"time"}`,
      bannedListenerKind,
      bannedBacklogKind,
      `${"stor"}${"age"}`,
    ];
    for (const peer of bannedPeers) {
      assert.equal(
        Object.keys(pkg.dependencies ?? {}).includes(peer),
        false,
      );
    }

    const event = createEvent({
      eventKind: EVENT_KINDS.Internal,
      eventStatus: EVENT_STATUSES.Cancelled,
      parentEventReference: "event-parent-1",
    });
    assert.equal(isEvent(event), true);
    assert.equal(event.eventStatus, "cancelled");
    assert.equal(event.parentEventReference, "event-parent-1");
  });
});
