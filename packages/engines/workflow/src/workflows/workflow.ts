/**
 * Workflow Engine Boundary — business process definition / step order / coordination
 * (not domain logic, job runners, timed jobs, or vendor orchestrators).
 *
 * @see DEC-WORKFLOW-BOUNDARY-001
 */

/** Internal workflow kinds — not vendor process catalogs. */
export const WORKFLOW_KINDS = {
  /** Multi-step business process (e.g. premium member intake). */
  Business: "workflow.business",
  /** Entity lifecycle process (e.g. booking lifecycle). */
  Lifecycle: "workflow.lifecycle",
  /** Client / member intake process. */
  Onboarding: "workflow.onboarding",
  /** Internal operational process. */
  Operation: "workflow.operation",
  /** Approval process. */
  Approval: "workflow.approval",
  /**
   * Workflow initiated by a Workflow system operation.
   * Not a technical infrastructure error.
   */
  Operational: "workflow.operational",
} as const;

export type WorkflowKind =
  (typeof WORKFLOW_KINDS)[keyof typeof WORKFLOW_KINDS];

export const WORKFLOW_KIND_VALUES = Object.values(
  WORKFLOW_KINDS,
) as readonly WorkflowKind[];

/** Workflow definition status — not runtime runner state. */
export const WORKFLOW_STATUSES = {
  Draft: "draft",
  Active: "active",
  Paused: "paused",
  Completed: "completed",
  Cancelled: "cancelled",
  Archived: "archived",
  Failed: "failed",
} as const;

export type WorkflowStatus =
  (typeof WORKFLOW_STATUSES)[keyof typeof WORKFLOW_STATUSES];

export const WORKFLOW_STATUS_VALUES = Object.values(
  WORKFLOW_STATUSES,
) as readonly WorkflowStatus[];

/**
 * Opaque workflow definition — process steps and logical order only.
 * No credential material or capability catalogs.
 */
export interface Workflow {
  /** Opaque unique workflow reference. */
  workflowReference: string;
  /** Explicit tenant scope — required. */
  tenantReference: string;
  /** Internal workflow kind. */
  workflowKind: WorkflowKind;
  /** Workflow definition status. */
  workflowStatus: WorkflowStatus;
  /** Opaque name pointer when known. */
  nameReference?: string;
  /** Opaque description pointer when known. */
  descriptionReference?: string;
  /** Opaque trigger pointer when known. */
  triggerReference?: string;
  /** Opaque owner pointer when known. */
  ownerReference?: string;
  /** Opaque parent workflow pointer when nested. */
  parentWorkflowReference?: string;
  /** Controlled optional metadata — never credentials or PII. */
  metadata?: Record<string, unknown>;
}

/**
 * Outbound port for future workflow adapters (Runtime).
 * Not wired in this foundation — no run, schedule, trigger, or step-processing.
 */
export interface WorkflowPort {
  createWorkflow(input: CreateWorkflowInput): Promise<Workflow>;
  resolveWorkflow(workflow: Workflow): Promise<Workflow>;
}

export interface CreateWorkflowInput {
  tenantReference: string;
  workflowKind: WorkflowKind;
  workflowStatus?: WorkflowStatus;
  workflowReference?: string;
  nameReference?: string;
  descriptionReference?: string;
  triggerReference?: string;
  ownerReference?: string;
  parentWorkflowReference?: string;
  metadata?: Record<string, unknown>;
}

export function isWorkflowKind(value: string): value is WorkflowKind {
  return (WORKFLOW_KIND_VALUES as readonly string[]).includes(value);
}

export function isWorkflowStatus(value: string): value is WorkflowStatus {
  return (WORKFLOW_STATUS_VALUES as readonly string[]).includes(value);
}

export function isWorkflow(value: unknown): value is Workflow {
  if (value === null || typeof value !== "object") {
    return false;
  }
  const candidate = value as Record<string, unknown>;
  const nameOk =
    candidate.nameReference === undefined ||
    (typeof candidate.nameReference === "string" &&
      candidate.nameReference.length > 0);
  const descriptionOk =
    candidate.descriptionReference === undefined ||
    (typeof candidate.descriptionReference === "string" &&
      candidate.descriptionReference.length > 0);
  const triggerOk =
    candidate.triggerReference === undefined ||
    (typeof candidate.triggerReference === "string" &&
      candidate.triggerReference.length > 0);
  const ownerOk =
    candidate.ownerReference === undefined ||
    (typeof candidate.ownerReference === "string" &&
      candidate.ownerReference.length > 0);
  const parentOk =
    candidate.parentWorkflowReference === undefined ||
    (typeof candidate.parentWorkflowReference === "string" &&
      candidate.parentWorkflowReference.length > 0);
  return (
    typeof candidate.workflowReference === "string" &&
    candidate.workflowReference.length > 0 &&
    typeof candidate.tenantReference === "string" &&
    candidate.tenantReference.length > 0 &&
    nameOk &&
    descriptionOk &&
    triggerOk &&
    ownerOk &&
    parentOk &&
    typeof candidate.workflowKind === "string" &&
    isWorkflowKind(candidate.workflowKind) &&
    typeof candidate.workflowStatus === "string" &&
    isWorkflowStatus(candidate.workflowStatus)
  );
}

export function isWorkflowPort(value: unknown): value is WorkflowPort {
  return (
    value !== null &&
    typeof value === "object" &&
    typeof (value as WorkflowPort).createWorkflow === "function" &&
    typeof (value as WorkflowPort).resolveWorkflow === "function"
  );
}
