/**
 * Hospitality Engagement Execution Constraint contract tests.
 * Run: pnpm --filter @motanos/hospitality test
 */
import assert from "node:assert/strict";
import { readFileSync, readdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { beforeEach, describe, it } from "node:test";
import {
  ENGAGEMENT_EXECUTION_CONSTRAINT_KINDS,
  ENGAGEMENT_EXECUTION_CONSTRAINT_STATUSES,
  createEngagementExecutionConstraint,
  isEngagementExecutionConstraintKind,
  isEngagementExecutionConstraintStatus,
  isHospitalityEngagementExecutionConstraint,
  resetEngagementExecutionConstraintReferenceSequence,
} from "../src/public.js";

const packageRoot = join(dirname(fileURLToPath(import.meta.url)), "..");
const executionConstraintRoot = join(
  packageRoot,
  "src",
  "execution-constraint",
);
const hospitalityBusiness = "hospitality-ikon";
const otherHospitalityBusiness = "hospitality-marina";

describe("Hospitality Engagement Execution Constraint Boundary", () => {
  beforeEach(() => {
    resetEngagementExecutionConstraintReferenceSequence();
  });

  it("creates ExecutionConstraint", () => {
    const constraint = createEngagementExecutionConstraint({
      executionConstraintKind: ENGAGEMENT_EXECUTION_CONSTRAINT_KINDS.Activity,
      hospitalityReference: hospitalityBusiness,
      executionContextReference: "execution-context-1",
      executionIntentReference: "execution-intent-1",
      boundaryReference: "boundary-1",
      actionIntentReference: "action-intent-1",
      memberReference: "member-1",
      communityReference: "community-1",
      experienceReference: "experience-1",
      metadata: { note: "opaque-meta" },
    });
    assert.equal(
      isHospitalityEngagementExecutionConstraint(constraint),
      true,
    );
    assert.equal(
      constraint.executionConstraintReference,
      "engagement-execution-constraint-1",
    );
    assert.equal(constraint.executionConstraintStatus, "draft");
    assert.equal(
      constraint.executionConstraintKind,
      "execution-constraint.activity",
    );
    assert.equal(constraint.hospitalityReference, hospitalityBusiness);
    assert.equal(
      Object.prototype.hasOwnProperty.call(constraint, "validationResult"),
      false,
    );
    assert.equal(
      Object.prototype.hasOwnProperty.call(constraint, "enforcement"),
      false,
    );
    assert.equal(
      Object.prototype.hasOwnProperty.call(constraint, "blocking"),
      false,
    );
    assert.equal(
      Object.prototype.hasOwnProperty.call(constraint, "ruleEngine"),
      false,
    );
    assert.equal(
      Object.prototype.hasOwnProperty.call(constraint, "workflow"),
      false,
    );
    assert.equal(
      Object.prototype.hasOwnProperty.call(constraint, "automation"),
      false,
    );
    assert.equal(
      Object.prototype.hasOwnProperty.call(constraint, "jobReference"),
      false,
    );
    assert.equal(
      Object.prototype.hasOwnProperty.call(constraint, "apiCall"),
      false,
    );
    assert.equal(
      Object.prototype.hasOwnProperty.call(constraint, "externalService"),
      false,
    );
    assert.equal(
      Object.prototype.hasOwnProperty.call(constraint, "aiModel"),
      false,
    );
    assert.equal(
      Object.prototype.hasOwnProperty.call(constraint, "prompt"),
      false,
    );
  });

  it("checks hospitality business isolation", () => {
    const ikon = createEngagementExecutionConstraint({
      executionConstraintKind: ENGAGEMENT_EXECUTION_CONSTRAINT_KINDS.Community,
      hospitalityReference: hospitalityBusiness,
      communityReference: "community-ikon",
    });
    const marina = createEngagementExecutionConstraint({
      executionConstraintKind: ENGAGEMENT_EXECUTION_CONSTRAINT_KINDS.Community,
      hospitalityReference: otherHospitalityBusiness,
      communityReference: "community-marina",
    });

    assert.equal(ikon.hospitalityReference, hospitalityBusiness);
    assert.equal(marina.hospitalityReference, otherHospitalityBusiness);
    assert.notEqual(ikon.hospitalityReference, marina.hospitalityReference);
    assert.notEqual(
      ikon.executionConstraintReference,
      marina.executionConstraintReference,
    );
    assert.notEqual(ikon.communityReference, marina.communityReference);

    assert.throws(
      () =>
        createEngagementExecutionConstraint({
          executionConstraintKind:
            ENGAGEMENT_EXECUTION_CONSTRAINT_KINDS.Business,
          hospitalityReference: "  ",
        }),
      /hospitalityReference must not be empty when provided/,
    );

    assert.throws(
      () =>
        createEngagementExecutionConstraint(
          {
            executionConstraintKind:
              ENGAGEMENT_EXECUTION_CONSTRAINT_KINDS.Experience,
            hospitalityReference: otherHospitalityBusiness,
          },
          { hospitalityReference: hospitalityBusiness },
        ),
      /does not apply to this hospitality business/,
    );
  });

  it("accepts only known execution-constraint kinds", () => {
    assert.equal(
      isEngagementExecutionConstraintKind("execution-constraint.activity"),
      true,
    );
    assert.equal(
      isEngagementExecutionConstraintKind("execution-constraint.community"),
      true,
    );
    assert.equal(
      isEngagementExecutionConstraintKind("execution-constraint.business"),
      true,
    );
    assert.equal(
      isEngagementExecutionConstraintKind("execution-constraint.experience"),
      true,
    );
    assert.equal(
      isEngagementExecutionConstraintKind("execution-constraint.member"),
      true,
    );
    assert.equal(
      isEngagementExecutionConstraintKind("execution-constraint.engagement"),
      true,
    );
    assert.equal(
      isEngagementExecutionConstraintKind("execution-constraint.internal"),
      true,
    );
    assert.equal(isEngagementExecutionConstraintKind("rule.run"), false);
    assert.equal(isEngagementExecutionConstraintKind("policy.block"), false);

    const kinds = [
      ENGAGEMENT_EXECUTION_CONSTRAINT_KINDS.Activity,
      ENGAGEMENT_EXECUTION_CONSTRAINT_KINDS.Community,
      ENGAGEMENT_EXECUTION_CONSTRAINT_KINDS.Business,
      ENGAGEMENT_EXECUTION_CONSTRAINT_KINDS.Experience,
      ENGAGEMENT_EXECUTION_CONSTRAINT_KINDS.Member,
      ENGAGEMENT_EXECUTION_CONSTRAINT_KINDS.Engagement,
      ENGAGEMENT_EXECUTION_CONSTRAINT_KINDS.Internal,
    ] as const;

    for (const kind of kinds) {
      const constraint = createEngagementExecutionConstraint({
        executionConstraintKind: kind,
        hospitalityReference: hospitalityBusiness,
      });
      assert.equal(constraint.executionConstraintKind, kind);
    }

    assert.throws(
      () =>
        createEngagementExecutionConstraint({
          executionConstraintKind: "execution-constraint.unknown" as never,
        }),
      /Unknown engagement-execution-constraint kind/,
    );
  });

  it("accepts only known execution-constraint statuses", () => {
    assert.equal(isEngagementExecutionConstraintStatus("draft"), true);
    assert.equal(isEngagementExecutionConstraintStatus("defined"), true);
    assert.equal(isEngagementExecutionConstraintStatus("available"), true);
    assert.equal(isEngagementExecutionConstraintStatus("active"), true);
    assert.equal(isEngagementExecutionConstraintStatus("inactive"), true);
    assert.equal(isEngagementExecutionConstraintStatus("expired"), true);
    assert.equal(isEngagementExecutionConstraintStatus("cancelled"), true);
    assert.equal(isEngagementExecutionConstraintStatus("archived"), true);
    assert.equal(isEngagementExecutionConstraintStatus("unknown"), false);
    assert.equal(isEngagementExecutionConstraintStatus("enforced"), false);

    const defined = createEngagementExecutionConstraint({
      executionConstraintKind: ENGAGEMENT_EXECUTION_CONSTRAINT_KINDS.Activity,
      executionConstraintStatus:
        ENGAGEMENT_EXECUTION_CONSTRAINT_STATUSES.Defined,
    });
    assert.equal(defined.executionConstraintStatus, "defined");

    const available = createEngagementExecutionConstraint({
      executionConstraintKind: ENGAGEMENT_EXECUTION_CONSTRAINT_KINDS.Community,
      executionConstraintStatus:
        ENGAGEMENT_EXECUTION_CONSTRAINT_STATUSES.Available,
    });
    assert.equal(available.executionConstraintStatus, "available");

    const active = createEngagementExecutionConstraint({
      executionConstraintKind: ENGAGEMENT_EXECUTION_CONSTRAINT_KINDS.Business,
      executionConstraintStatus: ENGAGEMENT_EXECUTION_CONSTRAINT_STATUSES.Active,
    });
    assert.equal(active.executionConstraintStatus, "active");

    const inactive = createEngagementExecutionConstraint({
      executionConstraintKind: ENGAGEMENT_EXECUTION_CONSTRAINT_KINDS.Experience,
      executionConstraintStatus:
        ENGAGEMENT_EXECUTION_CONSTRAINT_STATUSES.Inactive,
    });
    assert.equal(inactive.executionConstraintStatus, "inactive");
  });

  it("stays apart from execution logic / enforcement logic / workflow / automation / AI", () => {
    const constraintSources = readdirSync(executionConstraintRoot)
      .filter((name) => name.endsWith(".ts"))
      .map((name) => readFileSync(join(executionConstraintRoot, name), "utf8"))
      .join("\n")
      .toLowerCase();

    assert.equal(constraintSources.includes("execution logic"), false);
    assert.equal(constraintSources.includes("enforcement logic"), false);
    assert.equal(constraintSources.includes("workflow"), false);
    assert.equal(constraintSources.includes("automation"), false);
    assert.equal(constraintSources.includes("ai logic"), false);

    assert.equal(constraintSources.includes("validate("), false);
    assert.equal(constraintSources.includes("enforce("), false);
    assert.equal(constraintSources.includes("apply("), false);
    assert.equal(constraintSources.includes("block("), false);
    assert.equal(constraintSources.includes("execute("), false);

    assert.equal(constraintSources.includes("validationresult?:"), false);
    assert.equal(constraintSources.includes("enforcement?:"), false);
    assert.equal(constraintSources.includes("blocking?:"), false);
    assert.equal(constraintSources.includes("ruleengine?:"), false);
    assert.equal(constraintSources.includes("workflow?:"), false);
    assert.equal(constraintSources.includes("automation?:"), false);
    assert.equal(constraintSources.includes("jobreference?:"), false);
    assert.equal(constraintSources.includes("apicall?:"), false);
    assert.equal(constraintSources.includes("externalservice?:"), false);
    assert.equal(constraintSources.includes("aimodel?:"), false);
    assert.equal(constraintSources.includes("prompt?:"), false);

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
      Object.keys(pkg.dependencies ?? {}).includes("@motanos/policy"),
      false,
    );
    assert.equal(
      Object.keys(pkg.dependencies ?? {}).includes("@motanos/rules-engine"),
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

    const constraint = createEngagementExecutionConstraint({
      executionConstraintKind: ENGAGEMENT_EXECUTION_CONSTRAINT_KINDS.Internal,
      executionConstraintStatus:
        ENGAGEMENT_EXECUTION_CONSTRAINT_STATUSES.Archived,
      hospitalityReference: hospitalityBusiness,
      parentConstraintReference: "engagement-execution-constraint-parent-1",
    });
    assert.equal(
      isHospitalityEngagementExecutionConstraint(constraint),
      true,
    );
    assert.equal(constraint.executionConstraintStatus, "archived");
    assert.equal(
      constraint.parentConstraintReference,
      "engagement-execution-constraint-parent-1",
    );
  });
});
