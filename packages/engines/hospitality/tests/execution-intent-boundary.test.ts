/**
 * Hospitality Engagement Execution Intent contract tests.
 * Run: pnpm --filter @motanos/hospitality test
 */
import assert from "node:assert/strict";
import { readFileSync, readdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { beforeEach, describe, it } from "node:test";
import {
  ENGAGEMENT_EXECUTION_INTENT_KINDS,
  ENGAGEMENT_EXECUTION_INTENT_STATUSES,
  createEngagementExecutionIntent,
  isEngagementExecutionIntentKind,
  isEngagementExecutionIntentStatus,
  isHospitalityEngagementExecutionIntent,
  resetEngagementExecutionIntentReferenceSequence,
} from "../src/public.js";

const packageRoot = join(dirname(fileURLToPath(import.meta.url)), "..");
const executionIntentRoot = join(packageRoot, "src", "execution-intent");
const hospitalityBusiness = "hospitality-ikon";
const otherHospitalityBusiness = "hospitality-marina";

describe("Hospitality Engagement Execution Intent Boundary", () => {
  beforeEach(() => {
    resetEngagementExecutionIntentReferenceSequence();
  });

  it("creates ExecutionIntent", () => {
    const intent = createEngagementExecutionIntent({
      executionIntentKind: ENGAGEMENT_EXECUTION_INTENT_KINDS.Activity,
      hospitalityReference: hospitalityBusiness,
      boundaryReference: "boundary-1",
      actionIntentReference: "action-intent-1",
      approvalReference: "approval-1",
      proposalReference: "proposal-1",
      contextReference: "context-1",
      executorReference: "executor-1",
      metadata: { note: "opaque-meta" },
    });
    assert.equal(isHospitalityEngagementExecutionIntent(intent), true);
    assert.equal(
      intent.executionIntentReference,
      "engagement-execution-intent-1",
    );
    assert.equal(intent.executionIntentStatus, "draft");
    assert.equal(intent.executionIntentKind, "execution-intent.activity");
    assert.equal(intent.hospitalityReference, hospitalityBusiness);
    assert.equal(
      Object.prototype.hasOwnProperty.call(intent, "executionResult"),
      false,
    );
    assert.equal(
      Object.prototype.hasOwnProperty.call(intent, "jobReference"),
      false,
    );
    assert.equal(
      Object.prototype.hasOwnProperty.call(intent, "workflowReference"),
      false,
    );
    assert.equal(
      Object.prototype.hasOwnProperty.call(intent, "automationReference"),
      false,
    );
    assert.equal(
      Object.prototype.hasOwnProperty.call(intent, "apiCall"),
      false,
    );
    assert.equal(
      Object.prototype.hasOwnProperty.call(intent, "externalService"),
      false,
    );
    assert.equal(
      Object.prototype.hasOwnProperty.call(intent, "taskReference"),
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
  });

  it("checks hospitality business isolation", () => {
    const ikon = createEngagementExecutionIntent({
      executionIntentKind: ENGAGEMENT_EXECUTION_INTENT_KINDS.Community,
      hospitalityReference: hospitalityBusiness,
      boundaryReference: "boundary-ikon",
    });
    const marina = createEngagementExecutionIntent({
      executionIntentKind: ENGAGEMENT_EXECUTION_INTENT_KINDS.Community,
      hospitalityReference: otherHospitalityBusiness,
      boundaryReference: "boundary-marina",
    });

    assert.equal(ikon.hospitalityReference, hospitalityBusiness);
    assert.equal(marina.hospitalityReference, otherHospitalityBusiness);
    assert.notEqual(ikon.hospitalityReference, marina.hospitalityReference);
    assert.notEqual(
      ikon.executionIntentReference,
      marina.executionIntentReference,
    );
    assert.notEqual(ikon.boundaryReference, marina.boundaryReference);

    assert.throws(
      () =>
        createEngagementExecutionIntent({
          executionIntentKind: ENGAGEMENT_EXECUTION_INTENT_KINDS.Business,
          hospitalityReference: "  ",
        }),
      /hospitalityReference must not be empty when provided/,
    );

    assert.throws(
      () =>
        createEngagementExecutionIntent(
          {
            executionIntentKind: ENGAGEMENT_EXECUTION_INTENT_KINDS.Experience,
            hospitalityReference: otherHospitalityBusiness,
          },
          { hospitalityReference: hospitalityBusiness },
        ),
      /does not apply to this hospitality business/,
    );
  });

  it("accepts only known execution-intent kinds", () => {
    assert.equal(
      isEngagementExecutionIntentKind("execution-intent.activity"),
      true,
    );
    assert.equal(
      isEngagementExecutionIntentKind("execution-intent.community"),
      true,
    );
    assert.equal(
      isEngagementExecutionIntentKind("execution-intent.business"),
      true,
    );
    assert.equal(
      isEngagementExecutionIntentKind("execution-intent.experience"),
      true,
    );
    assert.equal(
      isEngagementExecutionIntentKind("execution-intent.member"),
      true,
    );
    assert.equal(
      isEngagementExecutionIntentKind("execution-intent.engagement"),
      true,
    );
    assert.equal(
      isEngagementExecutionIntentKind("execution-intent.internal"),
      true,
    );
    assert.equal(isEngagementExecutionIntentKind("job.run"), false);
    assert.equal(isEngagementExecutionIntentKind("workflow.step"), false);

    const kinds = [
      ENGAGEMENT_EXECUTION_INTENT_KINDS.Activity,
      ENGAGEMENT_EXECUTION_INTENT_KINDS.Community,
      ENGAGEMENT_EXECUTION_INTENT_KINDS.Business,
      ENGAGEMENT_EXECUTION_INTENT_KINDS.Experience,
      ENGAGEMENT_EXECUTION_INTENT_KINDS.Member,
      ENGAGEMENT_EXECUTION_INTENT_KINDS.Engagement,
      ENGAGEMENT_EXECUTION_INTENT_KINDS.Internal,
    ] as const;

    for (const kind of kinds) {
      const intent = createEngagementExecutionIntent({
        executionIntentKind: kind,
        hospitalityReference: hospitalityBusiness,
      });
      assert.equal(intent.executionIntentKind, kind);
    }

    assert.throws(
      () =>
        createEngagementExecutionIntent({
          executionIntentKind: "execution-intent.unknown" as never,
        }),
      /Unknown engagement-execution-intent kind/,
    );
  });

  it("accepts only known execution-intent statuses", () => {
    assert.equal(isEngagementExecutionIntentStatus("draft"), true);
    assert.equal(isEngagementExecutionIntentStatus("prepared"), true);
    assert.equal(isEngagementExecutionIntentStatus("ready"), true);
    assert.equal(isEngagementExecutionIntentStatus("pending"), true);
    assert.equal(isEngagementExecutionIntentStatus("started"), true);
    assert.equal(isEngagementExecutionIntentStatus("completed"), true);
    assert.equal(isEngagementExecutionIntentStatus("cancelled"), true);
    assert.equal(isEngagementExecutionIntentStatus("expired"), true);
    assert.equal(isEngagementExecutionIntentStatus("archived"), true);
    assert.equal(isEngagementExecutionIntentStatus("unknown"), false);
    assert.equal(isEngagementExecutionIntentStatus("running"), false);

    const prepared = createEngagementExecutionIntent({
      executionIntentKind: ENGAGEMENT_EXECUTION_INTENT_KINDS.Activity,
      executionIntentStatus: ENGAGEMENT_EXECUTION_INTENT_STATUSES.Prepared,
    });
    assert.equal(prepared.executionIntentStatus, "prepared");

    const ready = createEngagementExecutionIntent({
      executionIntentKind: ENGAGEMENT_EXECUTION_INTENT_KINDS.Community,
      executionIntentStatus: ENGAGEMENT_EXECUTION_INTENT_STATUSES.Ready,
    });
    assert.equal(ready.executionIntentStatus, "ready");

    const pending = createEngagementExecutionIntent({
      executionIntentKind: ENGAGEMENT_EXECUTION_INTENT_KINDS.Business,
      executionIntentStatus: ENGAGEMENT_EXECUTION_INTENT_STATUSES.Pending,
    });
    assert.equal(pending.executionIntentStatus, "pending");

    const started = createEngagementExecutionIntent({
      executionIntentKind: ENGAGEMENT_EXECUTION_INTENT_KINDS.Experience,
      executionIntentStatus: ENGAGEMENT_EXECUTION_INTENT_STATUSES.Started,
    });
    assert.equal(started.executionIntentStatus, "started");
  });

  it("stays apart from execution logic / workflow / automation / external calls / AI", () => {
    const intentSources = readdirSync(executionIntentRoot)
      .filter((name) => name.endsWith(".ts"))
      .map((name) => readFileSync(join(executionIntentRoot, name), "utf8"))
      .join("\n")
      .toLowerCase();

    assert.equal(intentSources.includes("execution logic"), false);
    assert.equal(intentSources.includes("workflow"), false);
    assert.equal(intentSources.includes("automation"), false);
    assert.equal(intentSources.includes("external calls"), false);
    assert.equal(intentSources.includes("ai logic"), false);

    assert.equal(intentSources.includes("execute("), false);
    assert.equal(intentSources.includes("startexecution"), false);
    assert.equal(intentSources.includes("dispatch("), false);
    assert.equal(intentSources.includes("runworkflow"), false);
    assert.equal(intentSources.includes("trigger("), false);

    assert.equal(intentSources.includes("executionresult?:"), false);
    assert.equal(intentSources.includes("jobreference?:"), false);
    assert.equal(intentSources.includes("workflowreference?:"), false);
    assert.equal(intentSources.includes("automationreference?:"), false);
    assert.equal(intentSources.includes("apicall?:"), false);
    assert.equal(intentSources.includes("externalservice?:"), false);
    assert.equal(intentSources.includes("taskreference?:"), false);
    assert.equal(intentSources.includes("aimodel?:"), false);
    assert.equal(intentSources.includes("prompt?:"), false);

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
      Object.keys(pkg.dependencies ?? {}).includes(
        "@motanos/execution-engine",
      ),
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
      Object.keys(pkg.dependencies ?? {}).includes("@motanos/jobs"),
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

    const intent = createEngagementExecutionIntent({
      executionIntentKind: ENGAGEMENT_EXECUTION_INTENT_KINDS.Internal,
      executionIntentStatus: ENGAGEMENT_EXECUTION_INTENT_STATUSES.Archived,
      hospitalityReference: hospitalityBusiness,
      parentExecutionIntentReference: "engagement-execution-intent-parent-1",
    });
    assert.equal(isHospitalityEngagementExecutionIntent(intent), true);
    assert.equal(intent.executionIntentStatus, "archived");
    assert.equal(
      intent.parentExecutionIntentReference,
      "engagement-execution-intent-parent-1",
    );
  });
});
