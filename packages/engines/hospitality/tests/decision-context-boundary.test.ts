/**
 * Hospitality Engagement Decision Context contract tests.
 * Run: pnpm --filter @motanos/hospitality test
 */
import assert from "node:assert/strict";
import { readFileSync, readdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { beforeEach, describe, it } from "node:test";
import {
  ENGAGEMENT_DECISION_CONTEXT_KINDS,
  ENGAGEMENT_DECISION_CONTEXT_STATUSES,
  createEngagementDecisionContext,
  isEngagementDecisionContextKind,
  isEngagementDecisionContextStatus,
  isHospitalityEngagementDecisionContext,
  resetEngagementDecisionContextReferenceSequence,
} from "../src/public.js";

const packageRoot = join(dirname(fileURLToPath(import.meta.url)), "..");
const decisionContextRoot = join(packageRoot, "src", "decision-context");
const hospitalityBusiness = "hospitality-ikon";
const otherHospitalityBusiness = "hospitality-marina";

describe("Hospitality Engagement Decision Context Boundary", () => {
  beforeEach(() => {
    resetEngagementDecisionContextReferenceSequence();
  });

  it("creates DecisionContext", () => {
    const decisionContext = createEngagementDecisionContext({
      decisionContextKind: ENGAGEMENT_DECISION_CONTEXT_KINDS.Community,
      hospitalityReference: hospitalityBusiness,
      engagementReference: "engagement-1",
      signalReference: "signal-1",
      ruleReference: "rule-1",
      suggestionReference: "suggestion-1",
      activityReference: "activity-1",
      memberReference: "member-1",
      communityReference: "community-1",
      contextReference: "context-1",
      metadata: { note: "opaque-meta" },
    });
    assert.equal(
      isHospitalityEngagementDecisionContext(decisionContext),
      true,
    );
    assert.equal(
      decisionContext.decisionContextReference,
      "engagement-decision-context-1",
    );
    assert.equal(decisionContext.decisionContextStatus, "draft");
    assert.equal(
      decisionContext.decisionContextKind,
      "decision-context.community",
    );
    assert.equal(decisionContext.hospitalityReference, hospitalityBusiness);
    assert.equal(
      Object.prototype.hasOwnProperty.call(decisionContext, "decision"),
      false,
    );
    assert.equal(
      Object.prototype.hasOwnProperty.call(decisionContext, "decisionResult"),
      false,
    );
    assert.equal(
      Object.prototype.hasOwnProperty.call(decisionContext, "recommendation"),
      false,
    );
    assert.equal(
      Object.prototype.hasOwnProperty.call(decisionContext, "confidence"),
      false,
    );
    assert.equal(
      Object.prototype.hasOwnProperty.call(decisionContext, "score"),
      false,
    );
    assert.equal(
      Object.prototype.hasOwnProperty.call(decisionContext, "aiModel"),
      false,
    );
    assert.equal(
      Object.prototype.hasOwnProperty.call(decisionContext, "prompt"),
      false,
    );
    assert.equal(
      Object.prototype.hasOwnProperty.call(decisionContext, "execution"),
      false,
    );
    assert.equal(
      Object.prototype.hasOwnProperty.call(decisionContext, "action"),
      false,
    );
  });

  it("checks hospitality business isolation", () => {
    const ikon = createEngagementDecisionContext({
      decisionContextKind: ENGAGEMENT_DECISION_CONTEXT_KINDS.Activity,
      hospitalityReference: hospitalityBusiness,
      activityReference: "activity-ikon",
    });
    const marina = createEngagementDecisionContext({
      decisionContextKind: ENGAGEMENT_DECISION_CONTEXT_KINDS.Activity,
      hospitalityReference: otherHospitalityBusiness,
      activityReference: "activity-marina",
    });

    assert.equal(ikon.hospitalityReference, hospitalityBusiness);
    assert.equal(marina.hospitalityReference, otherHospitalityBusiness);
    assert.notEqual(ikon.hospitalityReference, marina.hospitalityReference);
    assert.notEqual(
      ikon.decisionContextReference,
      marina.decisionContextReference,
    );
    assert.notEqual(ikon.activityReference, marina.activityReference);

    assert.throws(
      () =>
        createEngagementDecisionContext({
          decisionContextKind: ENGAGEMENT_DECISION_CONTEXT_KINDS.Member,
          hospitalityReference: "  ",
        }),
      /hospitalityReference must not be empty when provided/,
    );

    assert.throws(
      () =>
        createEngagementDecisionContext(
          {
            decisionContextKind: ENGAGEMENT_DECISION_CONTEXT_KINDS.Business,
            hospitalityReference: otherHospitalityBusiness,
          },
          { hospitalityReference: hospitalityBusiness },
        ),
      /does not apply to this hospitality business/,
    );
  });

  it("accepts only known decision-context kinds", () => {
    assert.equal(
      isEngagementDecisionContextKind("decision-context.engagement"),
      true,
    );
    assert.equal(
      isEngagementDecisionContextKind("decision-context.activity"),
      true,
    );
    assert.equal(
      isEngagementDecisionContextKind("decision-context.community"),
      true,
    );
    assert.equal(
      isEngagementDecisionContextKind("decision-context.member"),
      true,
    );
    assert.equal(
      isEngagementDecisionContextKind("decision-context.business"),
      true,
    );
    assert.equal(
      isEngagementDecisionContextKind("decision-context.experience"),
      true,
    );
    assert.equal(
      isEngagementDecisionContextKind("decision-context.internal"),
      true,
    );
    assert.equal(isEngagementDecisionContextKind("decision.engine"), false);
    assert.equal(isEngagementDecisionContextKind("copilot.decide"), false);

    const kinds = [
      ENGAGEMENT_DECISION_CONTEXT_KINDS.Engagement,
      ENGAGEMENT_DECISION_CONTEXT_KINDS.Activity,
      ENGAGEMENT_DECISION_CONTEXT_KINDS.Community,
      ENGAGEMENT_DECISION_CONTEXT_KINDS.Member,
      ENGAGEMENT_DECISION_CONTEXT_KINDS.Business,
      ENGAGEMENT_DECISION_CONTEXT_KINDS.Experience,
      ENGAGEMENT_DECISION_CONTEXT_KINDS.Internal,
    ] as const;

    for (const kind of kinds) {
      const decisionContext = createEngagementDecisionContext({
        decisionContextKind: kind,
        hospitalityReference: hospitalityBusiness,
      });
      assert.equal(decisionContext.decisionContextKind, kind);
    }

    assert.throws(
      () =>
        createEngagementDecisionContext({
          decisionContextKind: "decision-context.unknown" as never,
        }),
      /Unknown engagement-decision-context kind/,
    );
  });

  it("accepts only known decision-context statuses", () => {
    assert.equal(isEngagementDecisionContextStatus("draft"), true);
    assert.equal(isEngagementDecisionContextStatus("assembled"), true);
    assert.equal(isEngagementDecisionContextStatus("available"), true);
    assert.equal(isEngagementDecisionContextStatus("evaluated"), true);
    assert.equal(isEngagementDecisionContextStatus("inactive"), true);
    assert.equal(isEngagementDecisionContextStatus("archived"), true);
    assert.equal(isEngagementDecisionContextStatus("cancelled"), true);
    assert.equal(isEngagementDecisionContextStatus("unknown"), false);
    assert.equal(isEngagementDecisionContextStatus("decided"), false);

    const assembled = createEngagementDecisionContext({
      decisionContextKind: ENGAGEMENT_DECISION_CONTEXT_KINDS.Engagement,
      decisionContextStatus: ENGAGEMENT_DECISION_CONTEXT_STATUSES.Assembled,
    });
    assert.equal(assembled.decisionContextStatus, "assembled");

    const available = createEngagementDecisionContext({
      decisionContextKind: ENGAGEMENT_DECISION_CONTEXT_KINDS.Activity,
      decisionContextStatus: ENGAGEMENT_DECISION_CONTEXT_STATUSES.Available,
    });
    assert.equal(available.decisionContextStatus, "available");

    const evaluated = createEngagementDecisionContext({
      decisionContextKind: ENGAGEMENT_DECISION_CONTEXT_KINDS.Community,
      decisionContextStatus: ENGAGEMENT_DECISION_CONTEXT_STATUSES.Evaluated,
    });
    assert.equal(evaluated.decisionContextStatus, "evaluated");

    const inactive = createEngagementDecisionContext({
      decisionContextKind: ENGAGEMENT_DECISION_CONTEXT_KINDS.Experience,
      decisionContextStatus: ENGAGEMENT_DECISION_CONTEXT_STATUSES.Inactive,
    });
    assert.equal(inactive.decisionContextStatus, "inactive");
  });

  it("stays apart from AI / decision execution / recommendation / automation / workflow / action", () => {
    const decisionContextSources = readdirSync(decisionContextRoot)
      .filter((name) => name.endsWith(".ts"))
      .map((name) => readFileSync(join(decisionContextRoot, name), "utf8"))
      .join("\n")
      .toLowerCase();

    assert.equal(decisionContextSources.includes("ai logic"), false);
    assert.equal(decisionContextSources.includes("decision execution"), false);
    assert.equal(decisionContextSources.includes("recommendation"), false);
    assert.equal(decisionContextSources.includes("automation"), false);
    assert.equal(decisionContextSources.includes("workflow"), false);
    assert.equal(decisionContextSources.includes("action"), false);

    assert.equal(decisionContextSources.includes("evaluatedecisioncontext"), false);
    assert.equal(decisionContextSources.includes("generatedecision"), false);
    assert.equal(decisionContextSources.includes("executedecision"), false);
    assert.equal(decisionContextSources.includes("triggeraction"), false);
    assert.equal(decisionContextSources.includes("recommendaction"), false);

    assert.equal(decisionContextSources.includes("decision?:"), false);
    assert.equal(decisionContextSources.includes("decisionresult?:"), false);
    assert.equal(decisionContextSources.includes("confidence?:"), false);
    assert.equal(decisionContextSources.includes("score?:"), false);
    assert.equal(decisionContextSources.includes("aimodel?:"), false);
    assert.equal(decisionContextSources.includes("prompt?:"), false);
    assert.equal(decisionContextSources.includes("execution?:"), false);
    assert.equal(decisionContextSources.includes("action?:"), false);

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
      Object.keys(pkg.dependencies ?? {}).includes("@motanos/decision-engine"),
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
    assert.equal(
      Object.keys(pkg.dependencies ?? {}).includes("@motanos/intelligence"),
      false,
    );

    const decisionContext = createEngagementDecisionContext({
      decisionContextKind: ENGAGEMENT_DECISION_CONTEXT_KINDS.Internal,
      decisionContextStatus: ENGAGEMENT_DECISION_CONTEXT_STATUSES.Archived,
      hospitalityReference: hospitalityBusiness,
      parentDecisionContextReference: "engagement-decision-context-parent-1",
    });
    assert.equal(
      isHospitalityEngagementDecisionContext(decisionContext),
      true,
    );
    assert.equal(decisionContext.decisionContextStatus, "archived");
    assert.equal(
      decisionContext.parentDecisionContextReference,
      "engagement-decision-context-parent-1",
    );
  });
});
