/**
 * Hospitality Engagement Rules contract tests.
 * Run: pnpm --filter @motanos/hospitality test
 */
import assert from "node:assert/strict";
import { readFileSync, readdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { beforeEach, describe, it } from "node:test";
import {
  ENGAGEMENT_RULE_KINDS,
  ENGAGEMENT_RULE_STATUSES,
  createEngagementRule,
  isEngagementRuleKind,
  isEngagementRuleStatus,
  isHospitalityEngagementRule,
  resetEngagementRuleReferenceSequence,
} from "../src/public.js";

const packageRoot = join(dirname(fileURLToPath(import.meta.url)), "..");
const engagementRulesRoot = join(packageRoot, "src", "engagement-rules");
const hospitalityBusiness = "hospitality-ikon";
const otherHospitalityBusiness = "hospitality-marina";

describe("Hospitality Engagement Rules Boundary", () => {
  beforeEach(() => {
    resetEngagementRuleReferenceSequence();
  });

  it("creates EngagementRule", () => {
    const rule = createEngagementRule({
      ruleKind: ENGAGEMENT_RULE_KINDS.Engagement,
      hospitalityReference: hospitalityBusiness,
      engagementReference: "engagement-1",
      suggestionReference: "suggestion-1",
      activityReference: "activity-1",
      contextReference: "context-1",
      memberReference: "member-1",
      triggerReference: "trigger-1",
      policyReference: "policy-1",
      metadata: { note: "opaque-meta" },
    });
    assert.equal(isHospitalityEngagementRule(rule), true);
    assert.equal(rule.ruleReference, "engagement-rule-1");
    assert.equal(rule.ruleStatus, "draft");
    assert.equal(rule.ruleKind, "rule.engagement");
    assert.equal(rule.hospitalityReference, hospitalityBusiness);
    assert.equal(
      Object.prototype.hasOwnProperty.call(rule, "aiPrompt"),
      false,
    );
    assert.equal(
      Object.prototype.hasOwnProperty.call(rule, "execution"),
      false,
    );
    assert.equal(
      Object.prototype.hasOwnProperty.call(rule, "workflow"),
      false,
    );
    assert.equal(
      Object.prototype.hasOwnProperty.call(rule, "points"),
      false,
    );
  });

  it("checks hospitality business isolation", () => {
    const ikon = createEngagementRule({
      ruleKind: ENGAGEMENT_RULE_KINDS.Activity,
      hospitalityReference: hospitalityBusiness,
      activityReference: "activity-ikon",
    });
    const marina = createEngagementRule({
      ruleKind: ENGAGEMENT_RULE_KINDS.Activity,
      hospitalityReference: otherHospitalityBusiness,
      activityReference: "activity-marina",
    });

    assert.equal(ikon.hospitalityReference, hospitalityBusiness);
    assert.equal(marina.hospitalityReference, otherHospitalityBusiness);
    assert.notEqual(ikon.hospitalityReference, marina.hospitalityReference);
    assert.notEqual(ikon.ruleReference, marina.ruleReference);
    assert.notEqual(ikon.activityReference, marina.activityReference);

    assert.throws(
      () =>
        createEngagementRule({
          ruleKind: ENGAGEMENT_RULE_KINDS.Community,
          hospitalityReference: "  ",
        }),
      /hospitalityReference must not be empty when provided/,
    );

    assert.throws(
      () =>
        createEngagementRule(
          {
            ruleKind: ENGAGEMENT_RULE_KINDS.Member,
            hospitalityReference: otherHospitalityBusiness,
          },
          { hospitalityReference: hospitalityBusiness },
        ),
      /does not apply to this hospitality business/,
    );
  });

  it("accepts only known engagement-rule kinds", () => {
    assert.equal(isEngagementRuleKind("rule.engagement"), true);
    assert.equal(isEngagementRuleKind("rule.activity"), true);
    assert.equal(isEngagementRuleKind("rule.community"), true);
    assert.equal(isEngagementRuleKind("rule.member"), true);
    assert.equal(isEngagementRuleKind("rule.business"), true);
    assert.equal(isEngagementRuleKind("rule.internal"), true);
    assert.equal(isEngagementRuleKind("automation.run"), false);
    assert.equal(isEngagementRuleKind("copilot.decide"), false);

    const kinds = [
      ENGAGEMENT_RULE_KINDS.Engagement,
      ENGAGEMENT_RULE_KINDS.Activity,
      ENGAGEMENT_RULE_KINDS.Community,
      ENGAGEMENT_RULE_KINDS.Member,
      ENGAGEMENT_RULE_KINDS.Business,
      ENGAGEMENT_RULE_KINDS.Internal,
    ] as const;

    for (const kind of kinds) {
      const rule = createEngagementRule({
        ruleKind: kind,
        hospitalityReference: hospitalityBusiness,
      });
      assert.equal(rule.ruleKind, kind);
    }

    assert.throws(
      () =>
        createEngagementRule({
          ruleKind: "rule.unknown" as never,
        }),
      /Unknown engagement-rule kind/,
    );
  });

  it("accepts only known engagement-rule statuses", () => {
    assert.equal(isEngagementRuleStatus("draft"), true);
    assert.equal(isEngagementRuleStatus("configured"), true);
    assert.equal(isEngagementRuleStatus("active"), true);
    assert.equal(isEngagementRuleStatus("paused"), true);
    assert.equal(isEngagementRuleStatus("disabled"), true);
    assert.equal(isEngagementRuleStatus("archived"), true);
    assert.equal(isEngagementRuleStatus("cancelled"), true);
    assert.equal(isEngagementRuleStatus("unknown"), false);
    assert.equal(isEngagementRuleStatus("running"), false);

    const configured = createEngagementRule({
      ruleKind: ENGAGEMENT_RULE_KINDS.Business,
      ruleStatus: ENGAGEMENT_RULE_STATUSES.Configured,
    });
    assert.equal(configured.ruleStatus, "configured");

    const active = createEngagementRule({
      ruleKind: ENGAGEMENT_RULE_KINDS.Engagement,
      ruleStatus: ENGAGEMENT_RULE_STATUSES.Active,
    });
    assert.equal(active.ruleStatus, "active");

    const paused = createEngagementRule({
      ruleKind: ENGAGEMENT_RULE_KINDS.Member,
      ruleStatus: ENGAGEMENT_RULE_STATUSES.Paused,
    });
    assert.equal(paused.ruleStatus, "paused");

    const disabled = createEngagementRule({
      ruleKind: ENGAGEMENT_RULE_KINDS.Community,
      ruleStatus: ENGAGEMENT_RULE_STATUSES.Disabled,
    });
    assert.equal(disabled.ruleStatus, "disabled");
  });

  it("stays apart from AI / execution / automation / rewards / gamification / points", () => {
    const ruleSources = readdirSync(engagementRulesRoot)
      .filter((name) => name.endsWith(".ts"))
      .map((name) => readFileSync(join(engagementRulesRoot, name), "utf8"))
      .join("\n")
      .toLowerCase();

    assert.equal(ruleSources.includes("ai logic"), false);
    assert.equal(ruleSources.includes("execution logic"), false);
    assert.equal(ruleSources.includes("automation"), false);
    assert.equal(ruleSources.includes("rewards"), false);
    assert.equal(ruleSources.includes("gamification"), false);
    assert.equal(ruleSources.includes("points"), false);

    assert.equal(ruleSources.includes("updaterule"), false);
    assert.equal(ruleSources.includes("executerule"), false);
    assert.equal(ruleSources.includes("triggeraction"), false);
    assert.equal(ruleSources.includes("generatesuggestion"), false);
    assert.equal(ruleSources.includes("runautomation"), false);

    assert.equal(ruleSources.includes("aiprompt"), false);
    assert.equal(ruleSources.includes("automationaction"), false);
    assert.equal(ruleSources.includes("score:"), false);
    assert.equal(ruleSources.includes("level:"), false);

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
      Object.keys(pkg.dependencies ?? {}).includes("@motanos/rules"),
      false,
    );
    assert.equal(
      Object.keys(pkg.dependencies ?? {}).includes("@motanos/automation"),
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

    const rule = createEngagementRule({
      ruleKind: ENGAGEMENT_RULE_KINDS.Internal,
      ruleStatus: ENGAGEMENT_RULE_STATUSES.Archived,
      hospitalityReference: hospitalityBusiness,
      policyReference: "policy-archived-1",
    });
    assert.equal(isHospitalityEngagementRule(rule), true);
    assert.equal(rule.ruleStatus, "archived");
    assert.equal(rule.policyReference, "policy-archived-1");
  });
});
