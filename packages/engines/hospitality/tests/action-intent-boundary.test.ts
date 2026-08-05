/**
 * Hospitality Engagement Action Intent contract tests.
 * Run: pnpm --filter @motanos/hospitality test
 */
import assert from "node:assert/strict";
import { readFileSync, readdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { beforeEach, describe, it } from "node:test";
import {
  ENGAGEMENT_ACTION_INTENT_KINDS,
  ENGAGEMENT_ACTION_INTENT_STATUSES,
  createEngagementActionIntent,
  isEngagementActionIntentKind,
  isEngagementActionIntentStatus,
  isHospitalityEngagementActionIntent,
  resetEngagementActionIntentReferenceSequence,
} from "../src/public.js";

const packageRoot = join(dirname(fileURLToPath(import.meta.url)), "..");
const actionIntentRoot = join(packageRoot, "src", "action-intent");
const hospitalityBusiness = "hospitality-ikon";
const otherHospitalityBusiness = "hospitality-marina";

describe("Hospitality Engagement Action Intent Boundary", () => {
  beforeEach(() => {
    resetEngagementActionIntentReferenceSequence();
  });

  it("creates ActionIntent", () => {
    const intent = createEngagementActionIntent({
      intentKind: ENGAGEMENT_ACTION_INTENT_KINDS.Activity,
      hospitalityReference: hospitalityBusiness,
      approvalReference: "approval-1",
      proposalReference: "proposal-1",
      decisionContextReference: "decision-context-1",
      activityReference: "activity-1",
      experienceReference: "experience-1",
      communityReference: "community-1",
      memberReference: "member-1",
      contextReference: "context-1",
      creatorReference: "creator-1",
      metadata: { note: "opaque-meta" },
    });
    assert.equal(isHospitalityEngagementActionIntent(intent), true);
    assert.equal(intent.intentReference, "engagement-action-intent-1");
    assert.equal(intent.intentStatus, "draft");
    assert.equal(intent.intentKind, "intent.activity");
    assert.equal(intent.hospitalityReference, hospitalityBusiness);
    assert.equal(
      Object.prototype.hasOwnProperty.call(intent, "execution"),
      false,
    );
    assert.equal(
      Object.prototype.hasOwnProperty.call(intent, "workflow"),
      false,
    );
    assert.equal(
      Object.prototype.hasOwnProperty.call(intent, "automation"),
      false,
    );
    assert.equal(
      Object.prototype.hasOwnProperty.call(intent, "apiCall"),
      false,
    );
    assert.equal(
      Object.prototype.hasOwnProperty.call(intent, "task"),
      false,
    );
    assert.equal(
      Object.prototype.hasOwnProperty.call(intent, "completedAction"),
      false,
    );
    assert.equal(
      Object.prototype.hasOwnProperty.call(intent, "aiModel"),
      false,
    );
    assert.equal(
      Object.prototype.hasOwnProperty.call(intent, "prompt"),
      false,
    );
    assert.equal(
      Object.prototype.hasOwnProperty.call(intent, "decision"),
      false,
    );
  });

  it("checks hospitality business isolation", () => {
    const ikon = createEngagementActionIntent({
      intentKind: ENGAGEMENT_ACTION_INTENT_KINDS.Community,
      hospitalityReference: hospitalityBusiness,
      communityReference: "community-ikon",
    });
    const marina = createEngagementActionIntent({
      intentKind: ENGAGEMENT_ACTION_INTENT_KINDS.Community,
      hospitalityReference: otherHospitalityBusiness,
      communityReference: "community-marina",
    });

    assert.equal(ikon.hospitalityReference, hospitalityBusiness);
    assert.equal(marina.hospitalityReference, otherHospitalityBusiness);
    assert.notEqual(ikon.hospitalityReference, marina.hospitalityReference);
    assert.notEqual(ikon.intentReference, marina.intentReference);
    assert.notEqual(ikon.communityReference, marina.communityReference);

    assert.throws(
      () =>
        createEngagementActionIntent({
          intentKind: ENGAGEMENT_ACTION_INTENT_KINDS.Business,
          hospitalityReference: "  ",
        }),
      /hospitalityReference must not be empty when provided/,
    );

    assert.throws(
      () =>
        createEngagementActionIntent(
          {
            intentKind: ENGAGEMENT_ACTION_INTENT_KINDS.Experience,
            hospitalityReference: otherHospitalityBusiness,
          },
          { hospitalityReference: hospitalityBusiness },
        ),
      /does not apply to this hospitality business/,
    );
  });

  it("accepts only known action-intent kinds", () => {
    assert.equal(isEngagementActionIntentKind("intent.activity"), true);
    assert.equal(isEngagementActionIntentKind("intent.community"), true);
    assert.equal(isEngagementActionIntentKind("intent.business"), true);
    assert.equal(isEngagementActionIntentKind("intent.experience"), true);
    assert.equal(isEngagementActionIntentKind("intent.member"), true);
    assert.equal(isEngagementActionIntentKind("intent.engagement"), true);
    assert.equal(isEngagementActionIntentKind("intent.internal"), true);
    assert.equal(isEngagementActionIntentKind("task.run"), false);
    assert.equal(isEngagementActionIntentKind("workflow.step"), false);

    const kinds = [
      ENGAGEMENT_ACTION_INTENT_KINDS.Activity,
      ENGAGEMENT_ACTION_INTENT_KINDS.Community,
      ENGAGEMENT_ACTION_INTENT_KINDS.Business,
      ENGAGEMENT_ACTION_INTENT_KINDS.Experience,
      ENGAGEMENT_ACTION_INTENT_KINDS.Member,
      ENGAGEMENT_ACTION_INTENT_KINDS.Engagement,
      ENGAGEMENT_ACTION_INTENT_KINDS.Internal,
    ] as const;

    for (const kind of kinds) {
      const intent = createEngagementActionIntent({
        intentKind: kind,
        hospitalityReference: hospitalityBusiness,
      });
      assert.equal(intent.intentKind, kind);
    }

    assert.throws(
      () =>
        createEngagementActionIntent({
          intentKind: "intent.unknown" as never,
        }),
      /Unknown engagement-action-intent kind/,
    );
  });

  it("accepts only known action-intent statuses", () => {
    assert.equal(isEngagementActionIntentStatus("draft"), true);
    assert.equal(isEngagementActionIntentStatus("created"), true);
    assert.equal(isEngagementActionIntentStatus("approved"), true);
    assert.equal(isEngagementActionIntentStatus("prepared"), true);
    assert.equal(isEngagementActionIntentStatus("scheduled"), true);
    assert.equal(isEngagementActionIntentStatus("completed"), true);
    assert.equal(isEngagementActionIntentStatus("cancelled"), true);
    assert.equal(isEngagementActionIntentStatus("expired"), true);
    assert.equal(isEngagementActionIntentStatus("archived"), true);
    assert.equal(isEngagementActionIntentStatus("unknown"), false);
    assert.equal(isEngagementActionIntentStatus("running"), false);

    const created = createEngagementActionIntent({
      intentKind: ENGAGEMENT_ACTION_INTENT_KINDS.Activity,
      intentStatus: ENGAGEMENT_ACTION_INTENT_STATUSES.Created,
    });
    assert.equal(created.intentStatus, "created");

    const prepared = createEngagementActionIntent({
      intentKind: ENGAGEMENT_ACTION_INTENT_KINDS.Community,
      intentStatus: ENGAGEMENT_ACTION_INTENT_STATUSES.Prepared,
    });
    assert.equal(prepared.intentStatus, "prepared");

    const scheduled = createEngagementActionIntent({
      intentKind: ENGAGEMENT_ACTION_INTENT_KINDS.Business,
      intentStatus: ENGAGEMENT_ACTION_INTENT_STATUSES.Scheduled,
    });
    assert.equal(scheduled.intentStatus, "scheduled");

    const completed = createEngagementActionIntent({
      intentKind: ENGAGEMENT_ACTION_INTENT_KINDS.Experience,
      intentStatus: ENGAGEMENT_ACTION_INTENT_STATUSES.Completed,
    });
    assert.equal(completed.intentStatus, "completed");
  });

  it("stays apart from execution / automation / workflow / external calls / AI / task runner", () => {
    const intentSources = readdirSync(actionIntentRoot)
      .filter((name) => name.endsWith(".ts"))
      .map((name) => readFileSync(join(actionIntentRoot, name), "utf8"))
      .join("\n")
      .toLowerCase();

    assert.equal(intentSources.includes("execution logic"), false);
    assert.equal(intentSources.includes("automation"), false);
    assert.equal(intentSources.includes("workflow"), false);
    assert.equal(intentSources.includes("external calls"), false);
    assert.equal(intentSources.includes("ai logic"), false);
    assert.equal(intentSources.includes("task runner"), false);

    assert.equal(intentSources.includes("executeaction"), false);
    assert.equal(intentSources.includes("runworkflow"), false);
    assert.equal(intentSources.includes("triggerautomation"), false);
    assert.equal(intentSources.includes("createactivity"), false);
    assert.equal(intentSources.includes("sendnotification"), false);

    assert.equal(intentSources.includes("execution?:"), false);
    assert.equal(intentSources.includes("workflow?:"), false);
    assert.equal(intentSources.includes("automation?:"), false);
    assert.equal(intentSources.includes("apicall?:"), false);
    assert.equal(intentSources.includes("task?:"), false);
    assert.equal(intentSources.includes("completedaction?:"), false);
    assert.equal(intentSources.includes("aimodel?:"), false);
    assert.equal(intentSources.includes("prompt?:"), false);
    assert.equal(intentSources.includes("decision?:"), false);

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
      Object.keys(pkg.dependencies ?? {}).includes("@motanos/action"),
      false,
    );
    assert.equal(
      Object.keys(pkg.dependencies ?? {}).includes("@motanos/workflow"),
      false,
    );
    assert.equal(
      Object.keys(pkg.dependencies ?? {}).includes("@motanos/automation"),
      false,
    );
    assert.equal(
      Object.keys(pkg.dependencies ?? {}).includes("@motanos/task"),
      false,
    );
    assert.equal(
      Object.keys(pkg.dependencies ?? {}).includes("@motanos/copilot"),
      false,
    );
    assert.equal(
      Object.keys(pkg.dependencies ?? {}).includes("@motanos/ai"),
      false,
    );

    const intent = createEngagementActionIntent({
      intentKind: ENGAGEMENT_ACTION_INTENT_KINDS.Internal,
      intentStatus: ENGAGEMENT_ACTION_INTENT_STATUSES.Archived,
      hospitalityReference: hospitalityBusiness,
      parentIntentReference: "engagement-action-intent-parent-1",
    });
    assert.equal(isHospitalityEngagementActionIntent(intent), true);
    assert.equal(intent.intentStatus, "archived");
    assert.equal(
      intent.parentIntentReference,
      "engagement-action-intent-parent-1",
    );
  });
});
