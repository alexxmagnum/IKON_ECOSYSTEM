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
   * (cross-tenant scope lock).
   */
  tenantReference?: string;
}

/**
 * Build a checked Workflow (in-memory — process / flow existence only).
 * Does not run steps, open vendor sessions, or persist runner state.
 */
export function createWorkflow(
  input: CreateWorkflowInput,
  options: CreateWorkflowOptions = {},
): Workflow {
  const tenantReference = input.tenantReference?.trim() ?? "";
  const actorReference = input.actorReference?.trim();
  const contextReference = input.contextReference?.trim();
  const entityReference = input.entityReference?.trim();
  const entityKind = input.entityKind?.trim();
  const triggerReference = input.triggerReference?.trim();
  const stepReference = input.stepReference?.trim();
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

  if (input.actorReference !== undefined && !actorReference) {
    throw new Error("actorReference must not be empty when provided");
  }
  if (input.contextReference !== undefined && !contextReference) {
    throw new Error("contextReference must not be empty when provided");
  }
  if (input.entityReference !== undefined && !entityReference) {
    throw new Error("entityReference must not be empty when provided");
  }
  if (input.entityKind !== undefined && !entityKind) {
    throw new Error("entityKind must not be empty when provided");
  }
  if (input.triggerReference !== undefined && !triggerReference) {
    throw new Error("triggerReference must not be empty when provided");
  }
  if (input.stepReference !== undefined && !stepReference) {
    throw new Error("stepReference must not be empty when provided");
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
    ...(actorReference !== undefined && actorReference.length > 0
      ? { actorReference }
      : {}),
    ...(contextReference !== undefined && contextReference.length > 0
      ? { contextReference }
      : {}),
    ...(entityReference !== undefined && entityReference.length > 0
      ? { entityReference }
      : {}),
    ...(entityKind !== undefined && entityKind.length > 0
      ? { entityKind }
      : {}),
    ...(triggerReference !== undefined && triggerReference.length > 0
      ? { triggerReference }
      : {}),
    ...(stepReference !== undefined && stepReference.length > 0
      ? { stepReference }
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
