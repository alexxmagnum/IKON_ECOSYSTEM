import type {
  AuditEvent,
  AuditKind,
  AuditStatus,
  CreateAuditEventInput,
} from "./audit-event";
import {
  AUDIT_STATUSES,
  isAuditKind,
  isAuditStatus,
} from "./audit-event";

let auditSequence = 0;

export interface CreateAuditEventOptions {
  /**
   * When set, audit event may only be created for this tenant
   * (cross-tenant isolation).
   */
  tenantReference?: string;
}

/**
 * Build a validated AuditEvent (in-memory — event / context only).
 * Does not persist, ship logs, or open analytics sessions.
 */
export function createAuditEvent(
  input: CreateAuditEventInput,
  options: CreateAuditEventOptions = {},
): AuditEvent {
  const tenantReference = input.tenantReference?.trim() ?? "";
  const actorReference = input.actorReference?.trim();
  const entityReference = input.entityReference?.trim();
  const entityKind = input.entityKind?.trim();
  const actionReference = input.actionReference?.trim();
  const sourceReference = input.sourceReference?.trim();
  const boundTenant = options.tenantReference?.trim() || undefined;

  if (!tenantReference) {
    throw new Error("tenantReference is required");
  }
  if (!isAuditKind(input.auditKind)) {
    throw new Error(`Unknown audit kind: ${String(input.auditKind)}`);
  }

  const auditStatus: AuditStatus =
    input.auditStatus ?? AUDIT_STATUSES.Pending;
  if (!isAuditStatus(auditStatus)) {
    throw new Error(`Unknown audit status: ${String(input.auditStatus)}`);
  }

  if (input.actorReference !== undefined && !actorReference) {
    throw new Error("actorReference must not be empty when provided");
  }
  if (input.entityReference !== undefined && !entityReference) {
    throw new Error("entityReference must not be empty when provided");
  }
  if (input.entityKind !== undefined && !entityKind) {
    throw new Error("entityKind must not be empty when provided");
  }
  if (input.actionReference !== undefined && !actionReference) {
    throw new Error("actionReference must not be empty when provided");
  }
  if (input.sourceReference !== undefined && !sourceReference) {
    throw new Error("sourceReference must not be empty when provided");
  }

  if (boundTenant !== undefined && tenantReference !== boundTenant) {
    throw new Error("audit event does not apply to this tenant");
  }

  const providedReference = input.auditReference?.trim() ?? "";
  if (input.auditReference !== undefined && !providedReference) {
    throw new Error("auditReference must not be empty when provided");
  }

  const auditKind: AuditKind = input.auditKind;
  const auditReference = providedReference || allocateAuditReference();

  return {
    auditReference,
    tenantReference,
    auditKind,
    auditStatus,
    ...(actorReference !== undefined && actorReference.length > 0
      ? { actorReference }
      : {}),
    ...(entityReference !== undefined && entityReference.length > 0
      ? { entityReference }
      : {}),
    ...(entityKind !== undefined && entityKind.length > 0
      ? { entityKind }
      : {}),
    ...(actionReference !== undefined && actionReference.length > 0
      ? { actionReference }
      : {}),
    ...(sourceReference !== undefined && sourceReference.length > 0
      ? { sourceReference }
      : {}),
    ...(input.metadata !== undefined ? { metadata: input.metadata } : {}),
  };
}

function allocateAuditReference(): string {
  auditSequence += 1;
  return `audit-${auditSequence}`;
}

/** Test helper — reset opaque id sequence. */
export function resetAuditReferenceSequence(): void {
  auditSequence = 0;
}
