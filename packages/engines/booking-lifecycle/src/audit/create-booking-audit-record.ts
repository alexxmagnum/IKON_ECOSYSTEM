import type {
  BookingAuditAction,
  BookingAuditRecord,
  CreateBookingAuditRecordInput,
} from "./booking-audit-record";
import { isBookingAuditAction } from "./booking-audit-record";

let auditSequence = 0;

/**
 * Build a validated BookingAuditRecord (in-memory factory — no storage).
 * Throws when required opaque fields are missing or action is unknown.
 */
export function createBookingAuditRecord(
  input: CreateBookingAuditRecordInput,
): BookingAuditRecord {
  const tenantReference = input.tenantReference?.trim() ?? "";
  const actorReference = input.actorReference?.trim() ?? "";
  const resourceType = input.resourceType?.trim() ?? "";
  const resourceReference = input.resourceReference?.trim() ?? "";

  if (!tenantReference) {
    throw new Error("tenantReference is required");
  }
  if (!actorReference) {
    throw new Error("actorReference is required");
  }
  if (!isBookingAuditAction(input.action)) {
    throw new Error(`Unknown booking audit action: ${String(input.action)}`);
  }
  if (!resourceType) {
    throw new Error("resourceType is required");
  }
  if (!resourceReference) {
    throw new Error("resourceReference is required");
  }

  const action: BookingAuditAction = input.action;
  const occurredAt = input.occurredAt?.trim() || new Date().toISOString();
  const auditReference =
    input.auditReference?.trim() || allocateAuditReference();

  return {
    auditReference,
    tenantReference,
    actorReference,
    action,
    resourceType,
    resourceReference,
    occurredAt,
    ...(input.metadata !== undefined ? { metadata: input.metadata } : {}),
  };
}

function allocateAuditReference(): string {
  auditSequence += 1;
  return `audit-${auditSequence}`;
}

/** Test helper — reset opaque id sequence. */
export function resetBookingAuditReferenceSequence(): void {
  auditSequence = 0;
}
