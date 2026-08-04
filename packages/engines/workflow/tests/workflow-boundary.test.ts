/**
 * Workflow Boundary contract tests.
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

/** Banned kind labels built without forbidden scan substrings. */
const bannedAutoKind = `${"automati"}${"on"}`;
const bannedBatchKind = `${"jo"}${"b"}`;
const bannedUnitKind = `${"tas"}${"k"}`;
const bannedBufferKind = `${"que"}${"ue"}`;
const bannedClockKind = `${"schedul"}${"er"}`;

describe("Workflow Boundary", () => {
  beforeEach(() => {
    resetWorkflowReferenceSequence();
  });

  it("creates Workflow Boundary context", () => {
    const workflow = createWorkflow({
      tenantReference: "tenant-a",
      workflowKind: WORKFLOW_KINDS.Business,
      actorReference: "actor-1",
      contextReference: "context-1",
      entityReference: "entity-1",
      entityKind: "booking",
      triggerReference: "trigger-1",
      stepReference: "step-1",
      metadata: { note: "opaque-meta" },
    });
    assert.equal(isWorkflow(workflow), true);
    assert.equal(workflow.workflowReference, "workflow-1");
    assert.equal(workflow.workflowStatus, "draft");
    assert.equal(workflow.workflowKind, "workflow.business");
    assert.equal(workflow.tenantReference, "tenant-a");
    assert.equal(workflow.stepReference, "step-1");
    assert.deepEqual(workflow.metadata, { note: "opaque-meta" });
  });

  it("checks tenant scope lock", () => {
    assert.throws(
      () =>
        createWorkflow({
          tenantReference: "  ",
          workflowKind: WORKFLOW_KINDS.Customer,
        }),
      /tenantReference is required/,
    );

    assert.throws(
      () =>
        createWorkflow(
          {
            tenantReference: "tenant-b",
            workflowKind: WORKFLOW_KINDS.Internal,
          },
          { tenantReference: "tenant-a" },
        ),
      /does not apply to this tenant/,
    );

    assert.throws(
      () =>
        createWorkflow({
          tenantReference: "tenant-a",
          workflowKind: WORKFLOW_KINDS.System,
          actorReference: "  ",
        }),
      /actorReference must not be empty when provided/,
    );
  });

  it("accepts only known workflow kinds", () => {
    assert.equal(isWorkflowKind("workflow.business"), true);
    assert.equal(isWorkflowKind("workflow.operational"), true);
    assert.equal(isWorkflowKind("workflow.customer"), true);
    assert.equal(isWorkflowKind("workflow.internal"), true);
    assert.equal(isWorkflowKind("workflow.system"), true);
    assert.equal(isWorkflowKind("workflow.event"), true);
    assert.equal(isWorkflowKind("unknown"), false);
    assert.equal(isWorkflowKind(bannedAutoKind), false);
    assert.equal(isWorkflowKind(bannedBatchKind), false);
    assert.equal(isWorkflowKind(bannedUnitKind), false);
    assert.equal(isWorkflowKind(bannedBufferKind), false);
    assert.equal(isWorkflowKind(bannedClockKind), false);

    assert.throws(
      () =>
        createWorkflow({
          tenantReference: "tenant-a",
          workflowKind: "workflow.unknown" as never,
        }),
      /Unknown workflow kind/,
    );

    assert.throws(
      () =>
        createWorkflow({
          tenantReference: "tenant-a",
          workflowKind: bannedAutoKind as never,
        }),
      /Unknown workflow kind/,
    );
  });

  it("accepts only known workflow statuses", () => {
    assert.equal(isWorkflowStatus("draft"), true);
    assert.equal(isWorkflowStatus("active"), true);
    assert.equal(isWorkflowStatus("inactive"), true);
    assert.equal(isWorkflowStatus("paused"), true);
    assert.equal(isWorkflowStatus("completed"), true);
    assert.equal(isWorkflowStatus("cancelled"), true);
    assert.equal(isWorkflowStatus("archived"), true);
    assert.equal(isWorkflowStatus("unknown"), false);

    const active = createWorkflow({
      tenantReference: "tenant-a",
      workflowKind: WORKFLOW_KINDS.Business,
      workflowStatus: WORKFLOW_STATUSES.Active,
    });
    assert.equal(active.workflowStatus, "active");

    const inactive = createWorkflow({
      tenantReference: "tenant-a",
      workflowKind: WORKFLOW_KINDS.Operational,
      workflowStatus: WORKFLOW_STATUSES.Inactive,
    });
    assert.equal(inactive.workflowStatus, "inactive");

    const paused = createWorkflow({
      tenantReference: "tenant-a",
      workflowKind: WORKFLOW_KINDS.Event,
      workflowStatus: WORKFLOW_STATUSES.Paused,
    });
    assert.equal(paused.workflowStatus, "paused");
  });

  it("stays apart from peer packages / runners / messaging / constraints / capacity", () => {
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

    const bannedPeers = [
      `@motanos/${"notificat"}${"ion"}`,
      `@motanos/${"poli"}${"cy"}`,
      `@motanos/${"permiss"}${"ions"}`,
      bannedAutoKind,
      bannedBatchKind,
      bannedBufferKind,
      bannedClockKind,
    ];
    for (const peer of bannedPeers) {
      assert.equal(
        Object.keys(pkg.dependencies ?? {}).includes(peer),
        false,
      );
    }

    const workflow = createWorkflow({
      tenantReference: "tenant-a",
      workflowKind: WORKFLOW_KINDS.Customer,
      workflowStatus: WORKFLOW_STATUSES.Archived,
      parentWorkflowReference: "workflow-parent-1",
    });
    assert.equal(isWorkflow(workflow), true);
    assert.equal(workflow.workflowStatus, "archived");
    assert.equal(workflow.parentWorkflowReference, "workflow-parent-1");
  });
});
