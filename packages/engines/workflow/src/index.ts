/**
 * @motanos/workflow — Workflow Boundary foundation.
 *
 * MotanOS Core → Shared packages → @motanos/workflow
 *
 * Workflow = declarative process / flow existence for a business context.
 * Must not depend on batch runners, timed runners, messaging packages,
 * constraint packages, capacity packages, or persistence vendors.
 *
 * @see DEC-WORKFLOW-BOUNDARY-001
 */

export const WORKFLOW_BOUNDARY = "@motanos/workflow" as const;

export type {
  CreateWorkflowInput,
  CreateWorkflowOptions,
  Workflow,
  WorkflowKind,
  WorkflowPort,
  WorkflowStatus,
} from "./workflows";
export {
  WORKFLOW_KINDS,
  WORKFLOW_KIND_VALUES,
  WORKFLOW_STATUSES,
  WORKFLOW_STATUS_VALUES,
  createWorkflow,
  isWorkflow,
  isWorkflowKind,
  isWorkflowPort,
  isWorkflowStatus,
  resetWorkflowReferenceSequence,
} from "./workflows";
