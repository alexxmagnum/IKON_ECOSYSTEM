/**
 * @motanos/workflow — Workflow Engine foundation.
 *
 * MotanOS Core → Shared Engines → @motanos/workflow
 *
 * Workflow = business process definition, step order, and coordination context.
 * Domain engines own their actions; future runtime owns step running.
 *
 * Must not depend on booking, payment, notification, audit, analytics,
 * identity, or persistence vendors.
 *
 * @see DEC-WORKFLOW-BOUNDARY-001
 */

export const WORKFLOW_ENGINE = "@motanos/workflow" as const;

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
