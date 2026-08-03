/**
 * Booking Workflow Boundary — process coordination contracts (not a runner).
 * Workflows orchestrate steps; Domain Rules remain the source of validity.
 *
 * @see DEC-BOOKING-WORKFLOW-001
 */

/** Known Booking process kinds (definitions only — no execution). */
export const BOOKING_WORKFLOW_KINDS = {
  Confirmation: "booking.confirmation",
  Payment: "booking.payment",
  Reminder: "booking.reminder",
} as const;

export type BookingWorkflowKind =
  (typeof BOOKING_WORKFLOW_KINDS)[keyof typeof BOOKING_WORKFLOW_KINDS];

export const BOOKING_WORKFLOW_KIND_VALUES = Object.values(
  BOOKING_WORKFLOW_KINDS,
) as readonly BookingWorkflowKind[];

/** Lifecycle of a workflow instance (coordination state — not Booking status). */
export const BOOKING_WORKFLOW_STATES = {
  Pending: "pending",
  InProgress: "in_progress",
  Completed: "completed",
  Failed: "failed",
  Cancelled: "cancelled",
} as const;

export type BookingWorkflowState =
  (typeof BOOKING_WORKFLOW_STATES)[keyof typeof BOOKING_WORKFLOW_STATES];

export const BOOKING_WORKFLOW_STATE_VALUES = Object.values(
  BOOKING_WORKFLOW_STATES,
) as readonly BookingWorkflowState[];

/**
 * Static definition of an ordered Booking process.
 * Does not schedule, retry, or invoke infrastructure.
 */
export interface BookingWorkflowDefinition {
  kind: BookingWorkflowKind;
  /** Ordered opaque step identifiers for this process. */
  steps: readonly string[];
}

/**
 * In-memory workflow instance contract.
 * Opaque references only — no secrets, tokens, or provider payloads.
 */
export interface BookingWorkflow {
  workflowReference: string;
  kind: BookingWorkflowKind;
  bookingReference: string;
  tenantReference: string;
  actorReference: string;
  /** Current step id (must belong to the definition when created from one). */
  currentStep: string;
  state: BookingWorkflowState;
  metadata?: Record<string, unknown>;
}

export interface CreateBookingWorkflowInput {
  kind: BookingWorkflowKind;
  bookingReference: string;
  tenantReference: string;
  actorReference: string;
  currentStep: string;
  state?: BookingWorkflowState;
  workflowReference?: string;
  metadata?: Record<string, unknown>;
}

export function isBookingWorkflowKind(
  value: string,
): value is BookingWorkflowKind {
  return (BOOKING_WORKFLOW_KIND_VALUES as readonly string[]).includes(value);
}

export function isBookingWorkflowState(
  value: string,
): value is BookingWorkflowState {
  return (BOOKING_WORKFLOW_STATE_VALUES as readonly string[]).includes(value);
}

export function isBookingWorkflow(value: unknown): value is BookingWorkflow {
  if (value === null || typeof value !== "object") {
    return false;
  }
  const candidate = value as Record<string, unknown>;
  return (
    typeof candidate.workflowReference === "string" &&
    candidate.workflowReference.length > 0 &&
    typeof candidate.kind === "string" &&
    isBookingWorkflowKind(candidate.kind) &&
    typeof candidate.bookingReference === "string" &&
    candidate.bookingReference.length > 0 &&
    typeof candidate.tenantReference === "string" &&
    candidate.tenantReference.length > 0 &&
    typeof candidate.actorReference === "string" &&
    candidate.actorReference.length > 0 &&
    typeof candidate.currentStep === "string" &&
    candidate.currentStep.length > 0 &&
    typeof candidate.state === "string" &&
    isBookingWorkflowState(candidate.state)
  );
}

export function isBookingWorkflowDefinition(
  value: unknown,
): value is BookingWorkflowDefinition {
  if (value === null || typeof value !== "object") {
    return false;
  }
  const candidate = value as Record<string, unknown>;
  return (
    typeof candidate.kind === "string" &&
    isBookingWorkflowKind(candidate.kind) &&
    Array.isArray(candidate.steps) &&
    candidate.steps.length > 0 &&
    candidate.steps.every(
      (step) => typeof step === "string" && step.trim().length > 0,
    )
  );
}
