/**
 * Hospitality Engagement Execution Resource contract tests.
 * Run: pnpm --filter @motanos/hospitality test
 */
import assert from "node:assert/strict";
import { readFileSync, readdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { beforeEach, describe, it } from "node:test";
import {
  ENGAGEMENT_EXECUTION_RESOURCE_KINDS,
  ENGAGEMENT_EXECUTION_RESOURCE_STATUSES,
  createEngagementExecutionResource,
  isEngagementExecutionResourceKind,
  isEngagementExecutionResourceStatus,
  isHospitalityEngagementExecutionResource,
  resetEngagementExecutionResourceReferenceSequence,
} from "../src/public.js";

const packageRoot = join(dirname(fileURLToPath(import.meta.url)), "..");
const executionResourceRoot = join(packageRoot, "src", "execution-resource");
const hospitalityBusiness = "hospitality-ikon";
const otherHospitalityBusiness = "hospitality-marina";

describe("Hospitality Engagement Execution Resource Boundary", () => {
  beforeEach(() => {
    resetEngagementExecutionResourceReferenceSequence();
  });

  it("creates ExecutionResource", () => {
    const resource = createEngagementExecutionResource({
      executionResourceKind: ENGAGEMENT_EXECUTION_RESOURCE_KINDS.Activity,
      hospitalityReference: hospitalityBusiness,
      executionCapabilityReference: "capability-1",
      executionContextReference: "execution-context-1",
      executionIntentReference: "execution-intent-1",
      constraintReference: "constraint-1",
      boundaryReference: "boundary-1",
      providerReference: "provider-1",
      locationReference: "location-1",
      memberReference: "member-1",
      communityReference: "community-1",
      experienceReference: "experience-1",
      metadata: { note: "opaque-meta" },
    });
    assert.equal(isHospitalityEngagementExecutionResource(resource), true);
    assert.equal(
      resource.executionResourceReference,
      "engagement-execution-resource-1",
    );
    assert.equal(resource.executionResourceStatus, "draft");
    assert.equal(
      resource.executionResourceKind,
      "execution-resource.activity",
    );
    assert.equal(resource.hospitalityReference, hospitalityBusiness);
    assert.equal(
      Object.prototype.hasOwnProperty.call(resource, "resourceConsumption"),
      false,
    );
    assert.equal(
      Object.prototype.hasOwnProperty.call(resource, "allocation"),
      false,
    );
    assert.equal(
      Object.prototype.hasOwnProperty.call(resource, "reservation"),
      false,
    );
    assert.equal(
      Object.prototype.hasOwnProperty.call(resource, "availabilityChange"),
      false,
    );
    assert.equal(
      Object.prototype.hasOwnProperty.call(resource, "inventoryMutation"),
      false,
    );
    assert.equal(
      Object.prototype.hasOwnProperty.call(resource, "workflow"),
      false,
    );
    assert.equal(
      Object.prototype.hasOwnProperty.call(resource, "automation"),
      false,
    );
    assert.equal(
      Object.prototype.hasOwnProperty.call(resource, "apiCall"),
      false,
    );
    assert.equal(
      Object.prototype.hasOwnProperty.call(resource, "externalService"),
      false,
    );
    assert.equal(
      Object.prototype.hasOwnProperty.call(resource, "aiModel"),
      false,
    );
    assert.equal(
      Object.prototype.hasOwnProperty.call(resource, "prompt"),
      false,
    );
  });

  it("checks hospitality business isolation", () => {
    const ikon = createEngagementExecutionResource({
      executionResourceKind: ENGAGEMENT_EXECUTION_RESOURCE_KINDS.Community,
      hospitalityReference: hospitalityBusiness,
      communityReference: "community-ikon",
    });
    const marina = createEngagementExecutionResource({
      executionResourceKind: ENGAGEMENT_EXECUTION_RESOURCE_KINDS.Community,
      hospitalityReference: otherHospitalityBusiness,
      communityReference: "community-marina",
    });

    assert.equal(ikon.hospitalityReference, hospitalityBusiness);
    assert.equal(marina.hospitalityReference, otherHospitalityBusiness);
    assert.notEqual(ikon.hospitalityReference, marina.hospitalityReference);
    assert.notEqual(
      ikon.executionResourceReference,
      marina.executionResourceReference,
    );
    assert.notEqual(ikon.communityReference, marina.communityReference);

    assert.throws(
      () =>
        createEngagementExecutionResource({
          executionResourceKind: ENGAGEMENT_EXECUTION_RESOURCE_KINDS.Business,
          hospitalityReference: "  ",
        }),
      /hospitalityReference must not be empty when provided/,
    );

    assert.throws(
      () =>
        createEngagementExecutionResource(
          {
            executionResourceKind:
              ENGAGEMENT_EXECUTION_RESOURCE_KINDS.Experience,
            hospitalityReference: otherHospitalityBusiness,
          },
          { hospitalityReference: hospitalityBusiness },
        ),
      /does not apply to this hospitality business/,
    );
  });

  it("accepts only known execution-resource kinds", () => {
    assert.equal(
      isEngagementExecutionResourceKind("execution-resource.activity"),
      true,
    );
    assert.equal(
      isEngagementExecutionResourceKind("execution-resource.community"),
      true,
    );
    assert.equal(
      isEngagementExecutionResourceKind("execution-resource.business"),
      true,
    );
    assert.equal(
      isEngagementExecutionResourceKind("execution-resource.experience"),
      true,
    );
    assert.equal(
      isEngagementExecutionResourceKind("execution-resource.member"),
      true,
    );
    assert.equal(
      isEngagementExecutionResourceKind("execution-resource.engagement"),
      true,
    );
    assert.equal(
      isEngagementExecutionResourceKind("execution-resource.internal"),
      true,
    );
    assert.equal(isEngagementExecutionResourceKind("stock.hold"), false);
    assert.equal(isEngagementExecutionResourceKind("seat.reserve"), false);

    const kinds = [
      ENGAGEMENT_EXECUTION_RESOURCE_KINDS.Activity,
      ENGAGEMENT_EXECUTION_RESOURCE_KINDS.Community,
      ENGAGEMENT_EXECUTION_RESOURCE_KINDS.Business,
      ENGAGEMENT_EXECUTION_RESOURCE_KINDS.Experience,
      ENGAGEMENT_EXECUTION_RESOURCE_KINDS.Member,
      ENGAGEMENT_EXECUTION_RESOURCE_KINDS.Engagement,
      ENGAGEMENT_EXECUTION_RESOURCE_KINDS.Internal,
    ] as const;

    for (const kind of kinds) {
      const resource = createEngagementExecutionResource({
        executionResourceKind: kind,
        hospitalityReference: hospitalityBusiness,
      });
      assert.equal(resource.executionResourceKind, kind);
    }

    assert.throws(
      () =>
        createEngagementExecutionResource({
          executionResourceKind: "execution-resource.unknown" as never,
        }),
      /Unknown engagement-execution-resource kind/,
    );
  });

  it("accepts only known execution-resource statuses", () => {
    assert.equal(isEngagementExecutionResourceStatus("draft"), true);
    assert.equal(isEngagementExecutionResourceStatus("registered"), true);
    assert.equal(isEngagementExecutionResourceStatus("available"), true);
    assert.equal(isEngagementExecutionResourceStatus("active"), true);
    assert.equal(isEngagementExecutionResourceStatus("inactive"), true);
    assert.equal(isEngagementExecutionResourceStatus("expired"), true);
    assert.equal(isEngagementExecutionResourceStatus("cancelled"), true);
    assert.equal(isEngagementExecutionResourceStatus("archived"), true);
    assert.equal(isEngagementExecutionResourceStatus("unknown"), false);
    assert.equal(isEngagementExecutionResourceStatus("reserved"), false);

    const registered = createEngagementExecutionResource({
      executionResourceKind: ENGAGEMENT_EXECUTION_RESOURCE_KINDS.Activity,
      executionResourceStatus: ENGAGEMENT_EXECUTION_RESOURCE_STATUSES.Registered,
    });
    assert.equal(registered.executionResourceStatus, "registered");

    const available = createEngagementExecutionResource({
      executionResourceKind: ENGAGEMENT_EXECUTION_RESOURCE_KINDS.Community,
      executionResourceStatus: ENGAGEMENT_EXECUTION_RESOURCE_STATUSES.Available,
    });
    assert.equal(available.executionResourceStatus, "available");

    const active = createEngagementExecutionResource({
      executionResourceKind: ENGAGEMENT_EXECUTION_RESOURCE_KINDS.Business,
      executionResourceStatus: ENGAGEMENT_EXECUTION_RESOURCE_STATUSES.Active,
    });
    assert.equal(active.executionResourceStatus, "active");

    const inactive = createEngagementExecutionResource({
      executionResourceKind: ENGAGEMENT_EXECUTION_RESOURCE_KINDS.Experience,
      executionResourceStatus: ENGAGEMENT_EXECUTION_RESOURCE_STATUSES.Inactive,
    });
    assert.equal(inactive.executionResourceStatus, "inactive");
  });

  it("stays apart from resource consumption / allocation logic / inventory mutation / workflow / automation / AI", () => {
    const resourceSources = readdirSync(executionResourceRoot)
      .filter((name) => name.endsWith(".ts"))
      .map((name) => readFileSync(join(executionResourceRoot, name), "utf8"))
      .join("\n")
      .toLowerCase();

    assert.equal(resourceSources.includes("resource consumption"), false);
    assert.equal(resourceSources.includes("allocation logic"), false);
    assert.equal(resourceSources.includes("inventory mutation"), false);
    assert.equal(resourceSources.includes("workflow"), false);
    assert.equal(resourceSources.includes("automation"), false);
    assert.equal(resourceSources.includes("ai logic"), false);

    assert.equal(resourceSources.includes("allocate("), false);
    assert.equal(resourceSources.includes("consume("), false);
    assert.equal(resourceSources.includes("reserve("), false);
    assert.equal(resourceSources.includes("release("), false);
    assert.equal(resourceSources.includes("execute("), false);

    assert.equal(resourceSources.includes("resourceconsumption?:"), false);
    assert.equal(resourceSources.includes("allocation?:"), false);
    assert.equal(resourceSources.includes("reservation?:"), false);
    assert.equal(resourceSources.includes("availabilitychange?:"), false);
    assert.equal(resourceSources.includes("inventorymutation?:"), false);
    assert.equal(resourceSources.includes("workflow?:"), false);
    assert.equal(resourceSources.includes("automation?:"), false);
    assert.equal(resourceSources.includes("apicall?:"), false);
    assert.equal(resourceSources.includes("externalservice?:"), false);
    assert.equal(resourceSources.includes("aimodel?:"), false);
    assert.equal(resourceSources.includes("prompt?:"), false);

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
        "@motanos/resource-manager",
      ),
      false,
    );
    assert.equal(
      Object.keys(pkg.dependencies ?? {}).includes("@motanos/inventory"),
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
      Object.keys(pkg.dependencies ?? {}).includes("@motanos/workflow"),
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

    const resource = createEngagementExecutionResource({
      executionResourceKind: ENGAGEMENT_EXECUTION_RESOURCE_KINDS.Internal,
      executionResourceStatus: ENGAGEMENT_EXECUTION_RESOURCE_STATUSES.Archived,
      hospitalityReference: hospitalityBusiness,
      parentResourceReference: "engagement-execution-resource-parent-1",
    });
    assert.equal(isHospitalityEngagementExecutionResource(resource), true);
    assert.equal(resource.executionResourceStatus, "archived");
    assert.equal(
      resource.parentResourceReference,
      "engagement-execution-resource-parent-1",
    );
  });
});
