import type {
  CreateWorkflowInput,
  Workflow,
  WorkflowKind,
  WorkflowStatus,
} from "./workflow";
import {
  WORKFLOW_STATUSES,
  isWorkflowKind,
  isWorkflowStatus,
} from "./workflow";

let workflowSequence = 0;

export interface CreateWorkflowOptions {
  /**
   * When set, workflow may only be created for this tenant
   * (cross-tenant isolation).
   */
  tenantReference?: string;
}

/**
 * Build a validated Workflow (in-memory — process definition only).
 * Does not run steps, open vendor sessions, or persist runner state.
 */
export function createWorkflow(
  input: CreateWorkflowInput,
  options: CreateWorkflowOptions = {},
): Workflow {
  const tenantReference = input.tenantReference?.trim() ?? "";
  const nameReference = input.nameReference?.trim();
  const descriptionReference = input.descriptionReference?.trim();
  const triggerReference = input.triggerReference?.trim();
  const ownerReference = input.ownerReference?.trim();
  const parentWorkflowReference = input.parentWorkflowReference?.trim();
  const boundTenant = options.tenantReference?.trim() || undefined;

  if (!tenantReference) {
    throw new Error("tenantReference is required");
  }
  if (!isWorkflowKind(input.workflowKind)) {
    throw new Error(`Unknown workflow kind: ${String(input.workflowKind)}`);
  }

  const workflowStatus: WorkflowStatus =
    input.workflowStatus ?? WORKFLOW_STATUSES.Draft;
  if (!isWorkflowStatus(workflowStatus)) {
    throw new Error(
      `Unknown workflow status: ${String(input.workflowStatus)}`,
    );
  }

  if (input.nameReference !== undefined && !nameReference) {
    throw new Error("nameReference must not be empty when provided");
  }
  if (input.descriptionReference !== undefined && !descriptionReference) {
    throw new Error("descriptionReference must not be empty when provided");
  }
  if (input.triggerReference !== undefined && !triggerReference) {
    throw new Error("triggerReference must not be empty when provided");
  }
  if (input.ownerReference !== undefined && !ownerReference) {
    throw new Error("ownerReference must not be empty when provided");
  }
  if (
    input.parentWorkflowReference !== undefined &&
    !parentWorkflowReference
  ) {
    throw new Error(
      "parentWorkflowReference must not be empty when provided",
    );
  }

  if (boundTenant !== undefined && tenantReference !== boundTenant) {
    throw new Error("workflow does not apply to this tenant");
  }

  const providedReference = input.workflowReference?.trim() ?? "";
  if (input.workflowReference !== undefined && !providedReference) {
    throw new Error("workflowReference must not be empty when provided");
  }

  const workflowKind: WorkflowKind = input.workflowKind;
  const workflowReference =
    providedReference || allocateWorkflowReference();

  return {
    workflowReference,
    tenantReference,
    workflowKind,
    workflowStatus,
    ...(nameReference !== undefined && nameReference.length > 0
      ? { nameReference }
      : {}),
    ...(descriptionReference !== undefined && descriptionReference.length > 0
      ? { descriptionReference }
      : {}),
    ...(triggerReference !== undefined && triggerReference.length > 0
      ? { triggerReference }
      : {}),
    ...(ownerReference !== undefined && ownerReference.length > 0
      ? { ownerReference }
      : {}),
    ...(parentWorkflowReference !== undefined &&
    parentWorkflowReference.length > 0
      ? { parentWorkflowReference }
      : {}),
    ...(input.metadata !== undefined ? { metadata: input.metadata } : {}),
  };
}

function allocateWorkflowReference(): string {
  workflowSequence += 1;
  return `workflow-${workflowSequence}`;
}

/** Test helper — reset opaque id sequence. */
export function resetWorkflowReferenceSequence(): void {
  workflowSequence = 0;
}
