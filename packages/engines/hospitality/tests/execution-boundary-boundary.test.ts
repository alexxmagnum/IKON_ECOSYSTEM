/**
 * Hospitality Engagement Execution Boundary contract tests.
 * Run: pnpm --filter @motanos/hospitality test
 */
import assert from "node:assert/strict";
import { readFileSync, readdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { beforeEach, describe, it } from "node:test";
import {
  ENGAGEMENT_EXECUTION_BOUNDARY_KINDS,
  ENGAGEMENT_EXECUTION_BOUNDARY_STATUSES,
  createEngagementExecutionBoundary,
  isEngagementExecutionBoundaryKind,
  isEngagementExecutionBoundaryStatus,
  isHospitalityEngagementExecutionBoundary,
  resetEngagementExecutionBoundaryReferenceSequence,
} from "../src/public.js";

const packageRoot = join(dirname(fileURLToPath(import.meta.url)), "..");
const executionBoundaryRoot = join(packageRoot, "src", "execution-boundary");
const hospitalityBusiness = "hospitality-ikon";
const otherHospitalityBusiness = "hospitality-marina";

describe("Hospitality Engagement Execution Boundary Boundary", () => {
  beforeEach(() => {
    resetEngagementExecutionBoundaryReferenceSequence();
  });

  it("creates ExecutionBoundary", () => {
    const boundary = createEngagementExecutionBoundary({
      boundaryKind: ENGAGEMENT_EXECUTION_BOUNDARY_KINDS.Intent,
      hospitalityReference: hospitalityBusiness,
      intentReference: "intent-1",
      approvalReference: "approval-1",
      proposalReference: "proposal-1",
      contextReference: "context-1",
      executorReference: "executor-1",
      metadata: { note: "opaque-meta" },
    });
    assert.equal(isHospitalityEngagementExecutionBoundary(boundary), true);
    assert.equal(
      boundary.boundaryReference,
      "engagement-execution-boundary-1",
    );
    assert.equal(boundary.boundaryStatus, "draft");
    assert.equal(boundary.boundaryKind, "execution.intent");
    assert.equal(boundary.hospitalityReference, hospitalityBusiness);
    assert.equal(
      Object.prototype.hasOwnProperty.call(boundary, "executionResult"),
      false,
    );
    assert.equal(
      Object.prototype.hasOwnProperty.call(boundary, "workflow"),
      false,
    );
    assert.equal(
      Object.prototype.hasOwnProperty.call(boundary, "automation"),
      false,
    );
    assert.equal(
      Object.prototype.hasOwnProperty.call(boundary, "job"),
      false,
    );
    assert.equal(
      Object.prototype.hasOwnProperty.call(boundary, "task"),
      false,
    );
    assert.equal(
      Object.prototype.hasOwnProperty.call(boundary, "apiCall"),
      false,
    );
    assert.equal(
      Object.prototype.hasOwnProperty.call(boundary, "externalService"),
      false,
    );
    assert.equal(
      Object.prototype.hasOwnProperty.call(boundary, "aiModel"),
      false,
    );
    assert.equal(
      Object.prototype.hasOwnProperty.call(boundary, "prompt"),
      false,
    );
  });

  it("checks hospitality business isolation", () => {
    const ikon = createEngagementExecutionBoundary({
      boundaryKind: ENGAGEMENT_EXECUTION_BOUNDARY_KINDS.Community,
      hospitalityReference: hospitalityBusiness,
      intentReference: "intent-ikon",
    });
    const marina = createEngagementExecutionBoundary({
      boundaryKind: ENGAGEMENT_EXECUTION_BOUNDARY_KINDS.Community,
      hospitalityReference: otherHospitalityBusiness,
      intentReference: "intent-marina",
    });

    assert.equal(ikon.hospitalityReference, hospitalityBusiness);
    assert.equal(marina.hospitalityReference, otherHospitalityBusiness);
    assert.notEqual(ikon.hospitalityReference, marina.hospitalityReference);
    assert.notEqual(ikon.boundaryReference, marina.boundaryReference);
    assert.notEqual(ikon.intentReference, marina.intentReference);

    assert.throws(
      () =>
        createEngagementExecutionBoundary({
          boundaryKind: ENGAGEMENT_EXECUTION_BOUNDARY_KINDS.Business,
          hospitalityReference: "  ",
        }),
      /hospitalityReference must not be empty when provided/,
    );

    assert.throws(
      () =>
        createEngagementExecutionBoundary(
          {
            boundaryKind: ENGAGEMENT_EXECUTION_BOUNDARY_KINDS.Experience,
            hospitalityReference: otherHospitalityBusiness,
          },
          { hospitalityReference: hospitalityBusiness },
        ),
      /does not apply to this hospitality business/,
    );
  });

  it("accepts only known execution-boundary kinds", () => {
    assert.equal(isEngagementExecutionBoundaryKind("execution.intent"), true);
    assert.equal(
      isEngagementExecutionBoundaryKind("execution.activity"),
      true,
    );
    assert.equal(
      isEngagementExecutionBoundaryKind("execution.community"),
      true,
    );
    assert.equal(
      isEngagementExecutionBoundaryKind("execution.business"),
      true,
    );
    assert.equal(
      isEngagementExecutionBoundaryKind("execution.experience"),
      true,
    );
    assert.equal(
      isEngagementExecutionBoundaryKind("execution.internal"),
      true,
    );
    assert.equal(isEngagementExecutionBoundaryKind("job.run"), false);
    assert.equal(isEngagementExecutionBoundaryKind("task.dispatch"), false);

    const kinds = [
      ENGAGEMENT_EXECUTION_BOUNDARY_KINDS.Intent,
      ENGAGEMENT_EXECUTION_BOUNDARY_KINDS.Activity,
      ENGAGEMENT_EXECUTION_BOUNDARY_KINDS.Community,
      ENGAGEMENT_EXECUTION_BOUNDARY_KINDS.Business,
      ENGAGEMENT_EXECUTION_BOUNDARY_KINDS.Experience,
      ENGAGEMENT_EXECUTION_BOUNDARY_KINDS.Internal,
    ] as const;

    for (const kind of kinds) {
      const boundary = createEngagementExecutionBoundary({
        boundaryKind: kind,
        hospitalityReference: hospitalityBusiness,
      });
      assert.equal(boundary.boundaryKind, kind);
    }

    assert.throws(
      () =>
        createEngagementExecutionBoundary({
          boundaryKind: "execution.unknown" as never,
        }),
      /Unknown engagement-execution-boundary kind/,
    );
  });

  it("accepts only known execution-boundary statuses", () => {
    assert.equal(isEngagementExecutionBoundaryStatus("draft"), true);
    assert.equal(isEngagementExecutionBoundaryStatus("ready"), true);
    assert.equal(isEngagementExecutionBoundaryStatus("pending"), true);
    assert.equal(isEngagementExecutionBoundaryStatus("delegated"), true);
    assert.equal(isEngagementExecutionBoundaryStatus("completed"), true);
    assert.equal(isEngagementExecutionBoundaryStatus("cancelled"), true);
    assert.equal(isEngagementExecutionBoundaryStatus("expired"), true);
    assert.equal(isEngagementExecutionBoundaryStatus("archived"), true);
    assert.equal(isEngagementExecutionBoundaryStatus("unknown"), false);
    assert.equal(isEngagementExecutionBoundaryStatus("running"), false);

    const ready = createEngagementExecutionBoundary({
      boundaryKind: ENGAGEMENT_EXECUTION_BOUNDARY_KINDS.Intent,
      boundaryStatus: ENGAGEMENT_EXECUTION_BOUNDARY_STATUSES.Ready,
    });
    assert.equal(ready.boundaryStatus, "ready");

    const pending = createEngagementExecutionBoundary({
      boundaryKind: ENGAGEMENT_EXECUTION_BOUNDARY_KINDS.Activity,
      boundaryStatus: ENGAGEMENT_EXECUTION_BOUNDARY_STATUSES.Pending,
    });
    assert.equal(pending.boundaryStatus, "pending");

    const delegated = createEngagementExecutionBoundary({
      boundaryKind: ENGAGEMENT_EXECUTION_BOUNDARY_KINDS.Community,
      boundaryStatus: ENGAGEMENT_EXECUTION_BOUNDARY_STATUSES.Delegated,
    });
    assert.equal(delegated.boundaryStatus, "delegated");

    const completed = createEngagementExecutionBoundary({
      boundaryKind: ENGAGEMENT_EXECUTION_BOUNDARY_KINDS.Business,
      boundaryStatus: ENGAGEMENT_EXECUTION_BOUNDARY_STATUSES.Completed,
    });
    assert.equal(completed.boundaryStatus, "completed");
  });

  it("stays apart from execution logic / workflow / automation / external calls / AI logic", () => {
    const boundarySources = readdirSync(executionBoundaryRoot)
      .filter((name) => name.endsWith(".ts"))
      .map((name) => readFileSync(join(executionBoundaryRoot, name), "utf8"))
      .join("\n")
      .toLowerCase();

    assert.equal(boundarySources.includes("execution logic"), false);
    assert.equal(boundarySources.includes("workflow"), false);
    assert.equal(boundarySources.includes("automation"), false);
    assert.equal(boundarySources.includes("external calls"), false);
    assert.equal(boundarySources.includes("ai logic"), false);

    assert.equal(boundarySources.includes("execute("), false);
    assert.equal(boundarySources.includes("run("), false);
    assert.equal(boundarySources.includes("trigger("), false);
    assert.equal(boundarySources.includes("schedule("), false);
    assert.equal(boundarySources.includes("dispatch("), false);

    assert.equal(boundarySources.includes("executionresult?:"), false);
    assert.equal(boundarySources.includes("workflow?:"), false);
    assert.equal(boundarySources.includes("automation?:"), false);
    assert.equal(boundarySources.includes("job?:"), false);
    assert.equal(boundarySources.includes("task?:"), false);
    assert.equal(boundarySources.includes("apicall?:"), false);
    assert.equal(boundarySources.includes("externalservice?:"), false);
    assert.equal(boundarySources.includes("aimodel?:"), false);
    assert.equal(boundarySources.includes("prompt?:"), false);

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
      Object.keys(pkg.dependencies ?? {}).includes("@motanos/execution"),
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
      Object.keys(pkg.dependencies ?? {}).includes("@motanos/agent"),
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

    const boundary = createEngagementExecutionBoundary({
      boundaryKind: ENGAGEMENT_EXECUTION_BOUNDARY_KINDS.Internal,
      boundaryStatus: ENGAGEMENT_EXECUTION_BOUNDARY_STATUSES.Archived,
      hospitalityReference: hospitalityBusiness,
      parentBoundaryReference: "engagement-execution-boundary-parent-1",
    });
    assert.equal(isHospitalityEngagementExecutionBoundary(boundary), true);
    assert.equal(boundary.boundaryStatus, "archived");
    assert.equal(
      boundary.parentBoundaryReference,
      "engagement-execution-boundary-parent-1",
    );
  });
});
