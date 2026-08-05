/**
 * Hospitality Engagement Execution Capability contract tests.
 * Run: pnpm --filter @motanos/hospitality test
 */
import assert from "node:assert/strict";
import { readFileSync, readdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { beforeEach, describe, it } from "node:test";
import {
  ENGAGEMENT_EXECUTION_CAPABILITY_KINDS,
  ENGAGEMENT_EXECUTION_CAPABILITY_STATUSES,
  createEngagementExecutionCapability,
  isEngagementExecutionCapabilityKind,
  isEngagementExecutionCapabilityStatus,
  isHospitalityEngagementExecutionCapability,
  resetEngagementExecutionCapabilityReferenceSequence,
} from "../src/public.js";

const packageRoot = join(dirname(fileURLToPath(import.meta.url)), "..");
const executionCapabilityRoot = join(
  packageRoot,
  "src",
  "execution-capability",
);
const hospitalityBusiness = "hospitality-ikon";
const otherHospitalityBusiness = "hospitality-marina";

describe("Hospitality Engagement Execution Capability Boundary", () => {
  beforeEach(() => {
    resetEngagementExecutionCapabilityReferenceSequence();
  });

  it("creates ExecutionCapability", () => {
    const capability = createEngagementExecutionCapability({
      executionCapabilityKind: ENGAGEMENT_EXECUTION_CAPABILITY_KINDS.Activity,
      hospitalityReference: hospitalityBusiness,
      executionContextReference: "execution-context-1",
      executionIntentReference: "execution-intent-1",
      constraintReference: "constraint-1",
      boundaryReference: "boundary-1",
      actionIntentReference: "action-intent-1",
      memberReference: "member-1",
      communityReference: "community-1",
      experienceReference: "experience-1",
      providerReference: "provider-1",
      metadata: { note: "opaque-meta" },
    });
    assert.equal(
      isHospitalityEngagementExecutionCapability(capability),
      true,
    );
    assert.equal(
      capability.executionCapabilityReference,
      "engagement-execution-capability-1",
    );
    assert.equal(capability.executionCapabilityStatus, "draft");
    assert.equal(
      capability.executionCapabilityKind,
      "execution-capability.activity",
    );
    assert.equal(capability.hospitalityReference, hospitalityBusiness);
    assert.equal(
      Object.prototype.hasOwnProperty.call(capability, "executionResult"),
      false,
    );
    assert.equal(
      Object.prototype.hasOwnProperty.call(capability, "executionHandler"),
      false,
    );
    assert.equal(
      Object.prototype.hasOwnProperty.call(capability, "workflow"),
      false,
    );
    assert.equal(
      Object.prototype.hasOwnProperty.call(capability, "automation"),
      false,
    );
    assert.equal(
      Object.prototype.hasOwnProperty.call(capability, "integrationCall"),
      false,
    );
    assert.equal(
      Object.prototype.hasOwnProperty.call(capability, "apiEndpoint"),
      false,
    );
    assert.equal(
      Object.prototype.hasOwnProperty.call(capability, "serviceCall"),
      false,
    );
    assert.equal(
      Object.prototype.hasOwnProperty.call(capability, "aiModel"),
      false,
    );
    assert.equal(
      Object.prototype.hasOwnProperty.call(capability, "prompt"),
      false,
    );
  });

  it("checks hospitality business isolation", () => {
    const ikon = createEngagementExecutionCapability({
      executionCapabilityKind: ENGAGEMENT_EXECUTION_CAPABILITY_KINDS.Community,
      hospitalityReference: hospitalityBusiness,
      communityReference: "community-ikon",
    });
    const marina = createEngagementExecutionCapability({
      executionCapabilityKind: ENGAGEMENT_EXECUTION_CAPABILITY_KINDS.Community,
      hospitalityReference: otherHospitalityBusiness,
      communityReference: "community-marina",
    });

    assert.equal(ikon.hospitalityReference, hospitalityBusiness);
    assert.equal(marina.hospitalityReference, otherHospitalityBusiness);
    assert.notEqual(ikon.hospitalityReference, marina.hospitalityReference);
    assert.notEqual(
      ikon.executionCapabilityReference,
      marina.executionCapabilityReference,
    );
    assert.notEqual(ikon.communityReference, marina.communityReference);

    assert.throws(
      () =>
        createEngagementExecutionCapability({
          executionCapabilityKind:
            ENGAGEMENT_EXECUTION_CAPABILITY_KINDS.Business,
          hospitalityReference: "  ",
        }),
      /hospitalityReference must not be empty when provided/,
    );

    assert.throws(
      () =>
        createEngagementExecutionCapability(
          {
            executionCapabilityKind:
              ENGAGEMENT_EXECUTION_CAPABILITY_KINDS.Experience,
            hospitalityReference: otherHospitalityBusiness,
          },
          { hospitalityReference: hospitalityBusiness },
        ),
      /does not apply to this hospitality business/,
    );
  });

  it("accepts only known execution-capability kinds", () => {
    assert.equal(
      isEngagementExecutionCapabilityKind("execution-capability.activity"),
      true,
    );
    assert.equal(
      isEngagementExecutionCapabilityKind("execution-capability.community"),
      true,
    );
    assert.equal(
      isEngagementExecutionCapabilityKind("execution-capability.business"),
      true,
    );
    assert.equal(
      isEngagementExecutionCapabilityKind("execution-capability.experience"),
      true,
    );
    assert.equal(
      isEngagementExecutionCapabilityKind("execution-capability.member"),
      true,
    );
    assert.equal(
      isEngagementExecutionCapabilityKind("execution-capability.engagement"),
      true,
    );
    assert.equal(
      isEngagementExecutionCapabilityKind("execution-capability.internal"),
      true,
    );
    assert.equal(isEngagementExecutionCapabilityKind("connector.run"), false);
    assert.equal(isEngagementExecutionCapabilityKind("service.invoke"), false);

    const kinds = [
      ENGAGEMENT_EXECUTION_CAPABILITY_KINDS.Activity,
      ENGAGEMENT_EXECUTION_CAPABILITY_KINDS.Community,
      ENGAGEMENT_EXECUTION_CAPABILITY_KINDS.Business,
      ENGAGEMENT_EXECUTION_CAPABILITY_KINDS.Experience,
      ENGAGEMENT_EXECUTION_CAPABILITY_KINDS.Member,
      ENGAGEMENT_EXECUTION_CAPABILITY_KINDS.Engagement,
      ENGAGEMENT_EXECUTION_CAPABILITY_KINDS.Internal,
    ] as const;

    for (const kind of kinds) {
      const capability = createEngagementExecutionCapability({
        executionCapabilityKind: kind,
        hospitalityReference: hospitalityBusiness,
      });
      assert.equal(capability.executionCapabilityKind, kind);
    }

    assert.throws(
      () =>
        createEngagementExecutionCapability({
          executionCapabilityKind: "execution-capability.unknown" as never,
        }),
      /Unknown engagement-execution-capability kind/,
    );
  });

  it("accepts only known execution-capability statuses", () => {
    assert.equal(isEngagementExecutionCapabilityStatus("draft"), true);
    assert.equal(isEngagementExecutionCapabilityStatus("registered"), true);
    assert.equal(isEngagementExecutionCapabilityStatus("available"), true);
    assert.equal(isEngagementExecutionCapabilityStatus("active"), true);
    assert.equal(isEngagementExecutionCapabilityStatus("inactive"), true);
    assert.equal(isEngagementExecutionCapabilityStatus("expired"), true);
    assert.equal(isEngagementExecutionCapabilityStatus("cancelled"), true);
    assert.equal(isEngagementExecutionCapabilityStatus("archived"), true);
    assert.equal(isEngagementExecutionCapabilityStatus("unknown"), false);
    assert.equal(isEngagementExecutionCapabilityStatus("running"), false);

    const registered = createEngagementExecutionCapability({
      executionCapabilityKind: ENGAGEMENT_EXECUTION_CAPABILITY_KINDS.Activity,
      executionCapabilityStatus:
        ENGAGEMENT_EXECUTION_CAPABILITY_STATUSES.Registered,
    });
    assert.equal(registered.executionCapabilityStatus, "registered");

    const available = createEngagementExecutionCapability({
      executionCapabilityKind: ENGAGEMENT_EXECUTION_CAPABILITY_KINDS.Community,
      executionCapabilityStatus:
        ENGAGEMENT_EXECUTION_CAPABILITY_STATUSES.Available,
    });
    assert.equal(available.executionCapabilityStatus, "available");

    const active = createEngagementExecutionCapability({
      executionCapabilityKind: ENGAGEMENT_EXECUTION_CAPABILITY_KINDS.Business,
      executionCapabilityStatus: ENGAGEMENT_EXECUTION_CAPABILITY_STATUSES.Active,
    });
    assert.equal(active.executionCapabilityStatus, "active");

    const inactive = createEngagementExecutionCapability({
      executionCapabilityKind: ENGAGEMENT_EXECUTION_CAPABILITY_KINDS.Experience,
      executionCapabilityStatus:
        ENGAGEMENT_EXECUTION_CAPABILITY_STATUSES.Inactive,
    });
    assert.equal(inactive.executionCapabilityStatus, "inactive");
  });

  it("stays apart from execution logic / integration calls / workflow / automation / AI", () => {
    const capabilitySources = readdirSync(executionCapabilityRoot)
      .filter((name) => name.endsWith(".ts"))
      .map((name) =>
        readFileSync(join(executionCapabilityRoot, name), "utf8"),
      )
      .join("\n")
      .toLowerCase();

    assert.equal(capabilitySources.includes("execution logic"), false);
    assert.equal(capabilitySources.includes("integration calls"), false);
    assert.equal(capabilitySources.includes("workflow"), false);
    assert.equal(capabilitySources.includes("automation"), false);
    assert.equal(capabilitySources.includes("ai logic"), false);

    assert.equal(capabilitySources.includes("execute("), false);
    assert.equal(capabilitySources.includes("invoke("), false);
    assert.equal(capabilitySources.includes("dispatch("), false);
    assert.equal(capabilitySources.includes("connect("), false);
    assert.equal(capabilitySources.includes("run("), false);

    assert.equal(capabilitySources.includes("executionresult?:"), false);
    assert.equal(capabilitySources.includes("executionhandler?:"), false);
    assert.equal(capabilitySources.includes("workflow?:"), false);
    assert.equal(capabilitySources.includes("automation?:"), false);
    assert.equal(capabilitySources.includes("integrationcall?:"), false);
    assert.equal(capabilitySources.includes("apiendpoint?:"), false);
    assert.equal(capabilitySources.includes("servicecall?:"), false);
    assert.equal(capabilitySources.includes("aimodel?:"), false);
    assert.equal(capabilitySources.includes("prompt?:"), false);

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
      Object.keys(pkg.dependencies ?? {}).includes("@motanos/integration"),
      false,
    );
    assert.equal(
      Object.keys(pkg.dependencies ?? {}).includes("@motanos/connectors"),
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

    const capability = createEngagementExecutionCapability({
      executionCapabilityKind: ENGAGEMENT_EXECUTION_CAPABILITY_KINDS.Internal,
      executionCapabilityStatus:
        ENGAGEMENT_EXECUTION_CAPABILITY_STATUSES.Archived,
      hospitalityReference: hospitalityBusiness,
      parentCapabilityReference: "engagement-execution-capability-parent-1",
    });
    assert.equal(
      isHospitalityEngagementExecutionCapability(capability),
      true,
    );
    assert.equal(capability.executionCapabilityStatus, "archived");
    assert.equal(
      capability.parentCapabilityReference,
      "engagement-execution-capability-parent-1",
    );
  });
});
