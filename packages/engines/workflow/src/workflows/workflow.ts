/**
 * Workflow Boundary — declarative process / flow existence
 * (not domain logic, batch runners, timed runners, or vendor orchestrators).
 *
 * @see DEC-WORKFLOW-BOUNDARY-001
 */

/** Internal workflow kinds — not vendor process catalogs. */
export const WORKFLOW_KINDS = {
  /** Commercial / business process. */
  Business: "workflow.business",
  /**
   * Workflow initiated by a Workflow system operation.
   * Not a technical infrastructure problem.
   */
  Operational: "workflow.operational",
  /** Customer-facing process. */
  Customer: "workflow.customer",
  /** Internal process. */
  Internal: "workflow.internal",
  /** Platform / system process. */
  System: "workflow.system",
  /** Event-linked process. */
  Event: "workflow.event",
} as const;

export type WorkflowKind =
  (typeof WORKFLOW_KINDS)[keyof typeof WORKFLOW_KINDS];

export const WORKFLOW_KIND_VALUES = Object.values(
  WORKFLOW_KINDS,
) as readonly WorkflowKind[];

/** Workflow status — not process-runner state. */
export const WORKFLOW_STATUSES = {
  Draft: "draft",
  Active: "active",
  Inactive: "inactive",
  Paused: "paused",
  Completed: "completed",
  Cancelled: "cancelled",
  Archived: "archived",
} as const;

export type WorkflowStatus =
  (typeof WORKFLOW_STATUSES)[keyof typeof WORKFLOW_STATUSES];

export const WORKFLOW_STATUS_VALUES = Object.values(
  WORKFLOW_STATUSES,
) as readonly WorkflowStatus[];

/**
 * Opaque workflow — process / flow existence only.
 * No credential material or capability catalogs.
 */
export type Workflow = {
  /** Opaque unique workflow reference. */
  workflowReference: string;
  /** Explicit tenant scope — required. */
  tenantReference: string;
  /** Internal workflow kind. */
  workflowKind: WorkflowKind;
  /** Workflow status. */
  workflowStatus: WorkflowStatus;
  /** Opaque actor pointer when known — not a live person profile. */
  actorReference?: string;
  /** Opaque context pointer when known. */
  contextReference?: string;
  /** Opaque entity pointer when known. */
  entityReference?: string;
  /** Opaque entity kind label — not a live type system. */
  entityKind?: string;
  /** Opaque trigger pointer when known. */
  triggerReference?: string;
  /** Opaque step pointer when known — not a live runner step. */
  stepReference?: string;
  /** Opaque parent workflow pointer when nested. */
  parentWorkflowReference?: string;
  /** Controlled optional metadata — never credentials or PII. */
  metadata?: Record<string, unknown>;
};

/**
 * Outbound port for future workflow adapters.
 * Not wired in this foundation — no run, start, or step-processing.
 */
export interface WorkflowPort {
  createWorkflow(input: CreateWorkflowInput): Promise<Workflow>;
  resolveWorkflow(workflow: Workflow): Promise<Workflow>;
}

export type CreateWorkflowInput = {
  tenantReference: string;
  workflowKind: WorkflowKind;
  workflowStatus?: WorkflowStatus;
  workflowReference?: string;
  actorReference?: string;
  contextReference?: string;
  entityReference?: string;
  entityKind?: string;
  triggerReference?: string;
  stepReference?: string;
  parentWorkflowReference?: string;
  metadata?: Record<string, unknown>;
};

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
  const actorOk =
    candidate.actorReference === undefined ||
    (typeof candidate.actorReference === "string" &&
      candidate.actorReference.length > 0);
  const contextOk =
    candidate.contextReference === undefined ||
    (typeof candidate.contextReference === "string" &&
      candidate.contextReference.length > 0);
  const entityOk =
    candidate.entityReference === undefined ||
    (typeof candidate.entityReference === "string" &&
      candidate.entityReference.length > 0);
  const entityKindOk =
    candidate.entityKind === undefined ||
    (typeof candidate.entityKind === "string" &&
      candidate.entityKind.length > 0);
  const triggerOk =
    candidate.triggerReference === undefined ||
    (typeof candidate.triggerReference === "string" &&
      candidate.triggerReference.length > 0);
  const stepOk =
    candidate.stepReference === undefined ||
    (typeof candidate.stepReference === "string" &&
      candidate.stepReference.length > 0);
  const parentOk =
    candidate.parentWorkflowReference === undefined ||
    (typeof candidate.parentWorkflowReference === "string" &&
      candidate.parentWorkflowReference.length > 0);
  return (
    typeof candidate.workflowReference === "string" &&
    candidate.workflowReference.length > 0 &&
    typeof candidate.tenantReference === "string" &&
    candidate.tenantReference.length > 0 &&
    actorOk &&
    contextOk &&
    entityOk &&
    entityKindOk &&
    triggerOk &&
    stepOk &&
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
