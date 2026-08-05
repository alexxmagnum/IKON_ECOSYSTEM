/**
 * Hospitality Engagement Execution Context contract tests.
 * Run: pnpm --filter @motanos/hospitality test
 */
import assert from "node:assert/strict";
import { readFileSync, readdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { beforeEach, describe, it } from "node:test";
import {
  ENGAGEMENT_EXECUTION_CONTEXT_KINDS,
  ENGAGEMENT_EXECUTION_CONTEXT_STATUSES,
  createEngagementExecutionContext,
  isEngagementExecutionContextKind,
  isEngagementExecutionContextStatus,
  isHospitalityEngagementExecutionContext,
  resetEngagementExecutionContextReferenceSequence,
} from "../src/public.js";

const packageRoot = join(dirname(fileURLToPath(import.meta.url)), "..");
const executionContextRoot = join(packageRoot, "src", "execution-context");
const hospitalityBusiness = "hospitality-ikon";
const otherHospitalityBusiness = "hospitality-marina";

describe("Hospitality Engagement Execution Context Boundary", () => {
  beforeEach(() => {
    resetEngagementExecutionContextReferenceSequence();
  });

  it("creates ExecutionContext", () => {
    const context = createEngagementExecutionContext({
      executionContextKind: ENGAGEMENT_EXECUTION_CONTEXT_KINDS.Activity,
      hospitalityReference: hospitalityBusiness,
      executionIntentReference: "execution-intent-1",
      boundaryReference: "boundary-1",
      actionIntentReference: "action-intent-1",
      approvalReference: "approval-1",
      proposalReference: "proposal-1",
      locationReference: "location-1",
      memberReference: "member-1",
      communityReference: "community-1",
      experienceReference: "experience-1",
      metadata: { note: "opaque-meta" },
    });
    assert.equal(isHospitalityEngagementExecutionContext(context), true);
    assert.equal(
      context.executionContextReference,
      "engagement-execution-context-1",
    );
    assert.equal(context.executionContextStatus, "draft");
    assert.equal(context.executionContextKind, "execution-context.activity");
    assert.equal(context.hospitalityReference, hospitalityBusiness);
    assert.equal(
      Object.prototype.hasOwnProperty.call(context, "executionResult"),
      false,
    );
    assert.equal(
      Object.prototype.hasOwnProperty.call(context, "executionPayload"),
      false,
    );
    assert.equal(
      Object.prototype.hasOwnProperty.call(context, "workflowReference"),
      false,
    );
    assert.equal(
      Object.prototype.hasOwnProperty.call(context, "automationReference"),
      false,
    );
    assert.equal(
      Object.prototype.hasOwnProperty.call(context, "jobReference"),
      false,
    );
    assert.equal(
      Object.prototype.hasOwnProperty.call(context, "apiCall"),
      false,
    );
    assert.equal(
      Object.prototype.hasOwnProperty.call(context, "externalService"),
      false,
    );
    assert.equal(
      Object.prototype.hasOwnProperty.call(context, "aiModel"),
      false,
    );
    assert.equal(
      Object.prototype.hasOwnProperty.call(context, "prompt"),
      false,
    );
  });

  it("checks hospitality business isolation", () => {
    const ikon = createEngagementExecutionContext({
      executionContextKind: ENGAGEMENT_EXECUTION_CONTEXT_KINDS.Community,
      hospitalityReference: hospitalityBusiness,
      communityReference: "community-ikon",
    });
    const marina = createEngagementExecutionContext({
      executionContextKind: ENGAGEMENT_EXECUTION_CONTEXT_KINDS.Community,
      hospitalityReference: otherHospitalityBusiness,
      communityReference: "community-marina",
    });

    assert.equal(ikon.hospitalityReference, hospitalityBusiness);
    assert.equal(marina.hospitalityReference, otherHospitalityBusiness);
    assert.notEqual(ikon.hospitalityReference, marina.hospitalityReference);
    assert.notEqual(
      ikon.executionContextReference,
      marina.executionContextReference,
    );
    assert.notEqual(ikon.communityReference, marina.communityReference);

    assert.throws(
      () =>
        createEngagementExecutionContext({
          executionContextKind: ENGAGEMENT_EXECUTION_CONTEXT_KINDS.Business,
          hospitalityReference: "  ",
        }),
      /hospitalityReference must not be empty when provided/,
    );

    assert.throws(
      () =>
        createEngagementExecutionContext(
          {
            executionContextKind: ENGAGEMENT_EXECUTION_CONTEXT_KINDS.Experience,
            hospitalityReference: otherHospitalityBusiness,
          },
          { hospitalityReference: hospitalityBusiness },
        ),
      /does not apply to this hospitality business/,
    );
  });

  it("accepts only known execution-context kinds", () => {
    assert.equal(
      isEngagementExecutionContextKind("execution-context.activity"),
      true,
    );
    assert.equal(
      isEngagementExecutionContextKind("execution-context.community"),
      true,
    );
    assert.equal(
      isEngagementExecutionContextKind("execution-context.business"),
      true,
    );
    assert.equal(
      isEngagementExecutionContextKind("execution-context.experience"),
      true,
    );
    assert.equal(
      isEngagementExecutionContextKind("execution-context.member"),
      true,
    );
    assert.equal(
      isEngagementExecutionContextKind("execution-context.engagement"),
      true,
    );
    assert.equal(
      isEngagementExecutionContextKind("execution-context.internal"),
      true,
    );
    assert.equal(isEngagementExecutionContextKind("job.run"), false);
    assert.equal(isEngagementExecutionContextKind("workflow.step"), false);

    const kinds = [
      ENGAGEMENT_EXECUTION_CONTEXT_KINDS.Activity,
      ENGAGEMENT_EXECUTION_CONTEXT_KINDS.Community,
      ENGAGEMENT_EXECUTION_CONTEXT_KINDS.Business,
      ENGAGEMENT_EXECUTION_CONTEXT_KINDS.Experience,
      ENGAGEMENT_EXECUTION_CONTEXT_KINDS.Member,
      ENGAGEMENT_EXECUTION_CONTEXT_KINDS.Engagement,
      ENGAGEMENT_EXECUTION_CONTEXT_KINDS.Internal,
    ] as const;

    for (const kind of kinds) {
      const context = createEngagementExecutionContext({
        executionContextKind: kind,
        hospitalityReference: hospitalityBusiness,
      });
      assert.equal(context.executionContextKind, kind);
    }

    assert.throws(
      () =>
        createEngagementExecutionContext({
          executionContextKind: "execution-context.unknown" as never,
        }),
      /Unknown engagement-execution-context kind/,
    );
  });

  it("accepts only known execution-context statuses", () => {
    assert.equal(isEngagementExecutionContextStatus("draft"), true);
    assert.equal(isEngagementExecutionContextStatus("prepared"), true);
    assert.equal(isEngagementExecutionContextStatus("available"), true);
    assert.equal(isEngagementExecutionContextStatus("active"), true);
    assert.equal(isEngagementExecutionContextStatus("completed"), true);
    assert.equal(isEngagementExecutionContextStatus("expired"), true);
    assert.equal(isEngagementExecutionContextStatus("cancelled"), true);
    assert.equal(isEngagementExecutionContextStatus("archived"), true);
    assert.equal(isEngagementExecutionContextStatus("unknown"), false);
    assert.equal(isEngagementExecutionContextStatus("running"), false);

    const prepared = createEngagementExecutionContext({
      executionContextKind: ENGAGEMENT_EXECUTION_CONTEXT_KINDS.Activity,
      executionContextStatus: ENGAGEMENT_EXECUTION_CONTEXT_STATUSES.Prepared,
    });
    assert.equal(prepared.executionContextStatus, "prepared");

    const available = createEngagementExecutionContext({
      executionContextKind: ENGAGEMENT_EXECUTION_CONTEXT_KINDS.Community,
      executionContextStatus: ENGAGEMENT_EXECUTION_CONTEXT_STATUSES.Available,
    });
    assert.equal(available.executionContextStatus, "available");

    const active = createEngagementExecutionContext({
      executionContextKind: ENGAGEMENT_EXECUTION_CONTEXT_KINDS.Business,
      executionContextStatus: ENGAGEMENT_EXECUTION_CONTEXT_STATUSES.Active,
    });
    assert.equal(active.executionContextStatus, "active");

    const completed = createEngagementExecutionContext({
      executionContextKind: ENGAGEMENT_EXECUTION_CONTEXT_KINDS.Experience,
      executionContextStatus: ENGAGEMENT_EXECUTION_CONTEXT_STATUSES.Completed,
    });
    assert.equal(completed.executionContextStatus, "completed");
  });

  it("stays apart from execution logic / workflow / automation / external calls / AI", () => {
    const contextSources = readdirSync(executionContextRoot)
      .filter((name) => name.endsWith(".ts"))
      .map((name) => readFileSync(join(executionContextRoot, name), "utf8"))
      .join("\n")
      .toLowerCase();

    assert.equal(contextSources.includes("execution logic"), false);
    assert.equal(contextSources.includes("workflow"), false);
    assert.equal(contextSources.includes("automation"), false);
    assert.equal(contextSources.includes("external calls"), false);
    assert.equal(contextSources.includes("ai logic"), false);

    assert.equal(contextSources.includes("execute("), false);
    assert.equal(contextSources.includes("run("), false);
    assert.equal(contextSources.includes("trigger("), false);
    assert.equal(contextSources.includes("dispatch("), false);
    assert.equal(contextSources.includes("schedule("), false);

    assert.equal(contextSources.includes("executionresult?:"), false);
    assert.equal(contextSources.includes("executionpayload?:"), false);
    assert.equal(contextSources.includes("workflowreference?:"), false);
    assert.equal(contextSources.includes("automationreference?:"), false);
    assert.equal(contextSources.includes("jobreference?:"), false);
    assert.equal(contextSources.includes("apicall?:"), false);
    assert.equal(contextSources.includes("externalservice?:"), false);
    assert.equal(contextSources.includes("aimodel?:"), false);
    assert.equal(contextSources.includes("prompt?:"), false);

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

    const context = createEngagementExecutionContext({
      executionContextKind: ENGAGEMENT_EXECUTION_CONTEXT_KINDS.Internal,
      executionContextStatus: ENGAGEMENT_EXECUTION_CONTEXT_STATUSES.Archived,
      hospitalityReference: hospitalityBusiness,
      parentExecutionContextReference:
        "engagement-execution-context-parent-1",
    });
    assert.equal(isHospitalityEngagementExecutionContext(context), true);
    assert.equal(context.executionContextStatus, "archived");
    assert.equal(
      context.parentExecutionContextReference,
      "engagement-execution-context-parent-1",
    );
  });
});
