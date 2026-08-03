import type {
  BookingWorkflow,
  BookingWorkflowDefinition,
  BookingWorkflowKind,
  BookingWorkflowState,
  CreateBookingWorkflowInput,
} from "./booking-workflow";
import {
  BOOKING_WORKFLOW_KINDS,
  BOOKING_WORKFLOW_STATES,
  isBookingWorkflowKind,
  isBookingWorkflowState,
} from "./booking-workflow";

let workflowSequence = 0;

/**
 * Canonical workflow definitions for known Booking processes.
 * Step ids are opaque coordination labels — not domain transition rules.
 */
export function createBookingWorkflowDefinition(
  kind: BookingWorkflowKind,
): BookingWorkflowDefinition {
  if (!isBookingWorkflowKind(kind)) {
    throw new Error(`Unknown booking workflow kind: ${String(kind)}`);
  }

  switch (kind) {
    case BOOKING_WORKFLOW_KINDS.Confirmation:
      return {
        kind,
        steps: [
          "check_confirmation_requirement",
          "confirm_booking",
          "emit_domain_event",
          "notify_integrations",
        ],
      };
    case BOOKING_WORKFLOW_KINDS.Payment:
      return {
        kind,
        steps: [
          "request_payment",
          "await_payment_result",
          "confirm_or_expire",
        ],
      };
    case BOOKING_WORKFLOW_KINDS.Reminder:
      return {
        kind,
        steps: ["await_reminder_window", "send_reminder"],
      };
    default: {
      const _exhaustive: never = kind;
      throw new Error(`Unhandled booking workflow kind: ${String(_exhaustive)}`);
    }
  }
}

/**
 * Build a validated BookingWorkflow instance (in-memory — no runner/storage).
 */
export function createBookingWorkflow(
  input: CreateBookingWorkflowInput,
): BookingWorkflow {
  const tenantReference = input.tenantReference?.trim() ?? "";
  const actorReference = input.actorReference?.trim() ?? "";
  const bookingReference = input.bookingReference?.trim() ?? "";
  const currentStep = input.currentStep?.trim() ?? "";

  if (!tenantReference) {
    throw new Error("tenantReference is required");
  }
  if (!actorReference) {
    throw new Error("actorReference is required");
  }
  if (!bookingReference) {
    throw new Error("bookingReference is required");
  }
  if (!isBookingWorkflowKind(input.kind)) {
    throw new Error(`Unknown booking workflow kind: ${String(input.kind)}`);
  }
  if (!currentStep) {
    throw new Error("currentStep is required");
  }

  const state: BookingWorkflowState =
    input.state ?? BOOKING_WORKFLOW_STATES.Pending;
  if (!isBookingWorkflowState(state)) {
    throw new Error(`Unknown booking workflow state: ${String(state)}`);
  }

  const definition = createBookingWorkflowDefinition(input.kind);
  if (!definition.steps.includes(currentStep)) {
    throw new Error(
      `currentStep "${currentStep}" is not part of workflow ${input.kind}`,
    );
  }

  const workflowReference =
    input.workflowReference?.trim() || allocateWorkflowReference();

  return {
    workflowReference,
    kind: input.kind,
    bookingReference,
    tenantReference,
    actorReference,
    currentStep,
    state,
    ...(input.metadata !== undefined ? { metadata: input.metadata } : {}),
  };
}

/**
 * Tenant isolation helper for workflow instances (DEC-BOOKING-TENANT-001).
 */
export function workflowBelongsToTenant(
  workflow: BookingWorkflow,
  tenantReference: string,
): boolean {
  const expected = tenantReference.trim();
  if (!expected) {
    return false;
  }
  return workflow.tenantReference === expected;
}

function allocateWorkflowReference(): string {
  workflowSequence += 1;
  return `workflow-${workflowSequence}`;
}

/** Test helper — reset opaque id sequence. */
export function resetBookingWorkflowReferenceSequence(): void {
  workflowSequence = 0;
}
