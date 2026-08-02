/**
 * Workflow Engine Boundary contract tests.
 * Run: pnpm --filter @motanos/workflow test
 */
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { beforeEach, describe, it } from "node:test";
import {
  WORKFLOW_KINDS,
  WORKFLOW_STATUSES,
  createWorkflow,
  isWorkflow,
  isWorkflowKind,
  isWorkflowStatus,
  resetWorkflowReferenceSequence,
} from "../src/index.js";

const packageRoot = join(dirname(fileURLToPath(import.meta.url)), "..");

describe("Workflow Engine Boundary", () => {
  beforeEach(() => {
    resetWorkflowReferenceSequence();
  });

  it("creates Workflow Boundary context", () => {
    const workflow = createWorkflow({
      tenantReference: "tenant-a",
      workflowKind: WORKFLOW_KINDS.Business,
      nameReference: "name-premium-intake",
      triggerReference: "trigger-1",
      ownerReference: "owner-1",
    });
    assert.equal(isWorkflow(workflow), true);
    assert.equal(workflow.workflowReference, "workflow-1");
    assert.equal(workflow.workflowStatus, "draft");
    assert.equal(workflow.workflowKind, "workflow.business");
    assert.equal(workflow.tenantReference, "tenant-a");
    assert.equal(workflow.nameReference, "name-premium-intake");
  });

  it("validates tenant isolation", () => {
    assert.throws(
      () =>
        createWorkflow({
          tenantReference: "  ",
          workflowKind: WORKFLOW_KINDS.Lifecycle,
        }),
      /tenantReference is required/,
    );

    assert.throws(
      () =>
        createWorkflow(
          {
            tenantReference: "tenant-b",
            workflowKind: WORKFLOW_KINDS.Onboarding,
          },
          { tenantReference: "tenant-a" },
        ),
      /does not apply to this tenant/,
    );

    assert.throws(
      () =>
        createWorkflow({
          tenantReference: "tenant-a",
          workflowKind: WORKFLOW_KINDS.Approval,
          ownerReference: "  ",
        }),
      /ownerReference must not be empty when provided/,
    );
  });

  it("accepts only known workflow kinds", () => {
    assert.equal(isWorkflowKind("workflow.business"), true);
    assert.equal(isWorkflowKind("workflow.lifecycle"), true);
    assert.equal(isWorkflowKind("workflow.onboarding"), true);
    assert.equal(isWorkflowKind("workflow.operation"), true);
    assert.equal(isWorkflowKind("workflow.approval"), true);
    assert.equal(isWorkflowKind("workflow.operational"), true);
    assert.equal(isWorkflowKind("workflow.unknown"), false);

    assert.throws(
      () =>
        createWorkflow({
          tenantReference: "tenant-a",
          workflowKind: "workflow.unknown" as never,
        }),
      /Unknown workflow kind/,
    );
  });

  it("accepts only known workflow statuses", () => {
    assert.equal(isWorkflowStatus("draft"), true);
    assert.equal(isWorkflowStatus("active"), true);
    assert.equal(isWorkflowStatus("paused"), true);
    assert.equal(isWorkflowStatus("completed"), true);
    assert.equal(isWorkflowStatus("cancelled"), true);
    assert.equal(isWorkflowStatus("archived"), true);
    assert.equal(isWorkflowStatus("failed"), true);
    assert.equal(isWorkflowStatus("unknown"), false);

    const active = createWorkflow({
      tenantReference: "tenant-a",
      workflowKind: WORKFLOW_KINDS.Operation,
      workflowStatus: WORKFLOW_STATUSES.Active,
    });
    assert.equal(active.workflowStatus, "active");

    const completed = createWorkflow({
      tenantReference: "tenant-a",
      workflowKind: WORKFLOW_KINDS.Operational,
      workflowStatus: WORKFLOW_STATUSES.Completed,
    });
    assert.equal(completed.workflowStatus, "completed");
  });

  it("stays separated from domain engines / runners / orchestrators", () => {
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
    assert.equal(
      Object.keys(pkg.dependencies ?? {}).includes("@motanos/booking"),
      false,
    );
    assert.equal(
      Object.keys(pkg.dependencies ?? {}).includes("@motanos/payment"),
      false,
    );
    assert.equal(
      Object.keys(pkg.dependencies ?? {}).includes("@motanos/notification"),
      false,
    );
    assert.equal(
      Object.keys(pkg.dependencies ?? {}).includes("@motanos/audit"),
      false,
    );
    assert.equal(
      Object.keys(pkg.dependencies ?? {}).includes("@motanos/analytics"),
      false,
    );

    const workflow = createWorkflow({
      tenantReference: "tenant-a",
      workflowKind: WORKFLOW_KINDS.Lifecycle,
      workflowStatus: WORKFLOW_STATUSES.Paused,
      descriptionReference: "desc-1",
      parentWorkflowReference: "workflow-parent-1",
    });
    assert.equal(isWorkflow(workflow), true);
    assert.equal(workflow.workflowStatus, "paused");
    assert.equal(workflow.parentWorkflowReference, "workflow-parent-1");
  });
});
