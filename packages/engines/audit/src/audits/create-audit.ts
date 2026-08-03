import type {
  CreateAuditInput,
  AuditEntry,
  AuditKind,
  AuditStatus,
} from "./audit-entry";
import {
  AUDIT_STATUSES,
  isAuditKind,
  isAuditStatus,
} from "./audit-entry";

let auditSequence = 0;

export interface CreateAuditOptions {
  /**
   * When set, audit may only be created for this tenant
   * (cross-tenant scope lock).
   */
  tenantReference?: string;
}

/**
 * Build a checked AuditEntry (in-memory — auditable fact existence only).
 * Does not persist, open measure sessions, or export trails.
 */
export function createAudit(
  input: CreateAuditInput,
  options: CreateAuditOptions = {},
): AuditEntry {
  const tenantReference = input.tenantReference?.trim() ?? "";
  const actorReference = input.actorReference?.trim();
  const identityReference = input.identityReference?.trim();
  const membershipReference = input.membershipReference?.trim();
  const permissionReference = input.permissionReference?.trim();
  const entityReference = input.entityReference?.trim();
  const entityKind = input.entityKind?.trim();
  const actionReference = input.actionReference?.trim();
  const contextReference = input.contextReference?.trim();
  const parentAuditReference = input.parentAuditReference?.trim();
  const boundTenant = options.tenantReference?.trim() || undefined;

  if (!tenantReference) {
    throw new Error("tenantReference is required");
  }
  if (!isAuditKind(input.auditKind)) {
    throw new Error(`Unknown audit kind: ${String(input.auditKind)}`);
  }

  const auditStatus: AuditStatus =
    input.auditStatus ?? AUDIT_STATUSES.Draft;
  if (!isAuditStatus(auditStatus)) {
    throw new Error(`Unknown audit status: ${String(input.auditStatus)}`);
  }

  if (input.actorReference !== undefined && !actorReference) {
    throw new Error("actorReference must not be empty when provided");
  }
  if (input.identityReference !== undefined && !identityReference) {
    throw new Error("identityReference must not be empty when provided");
  }
  if (input.membershipReference !== undefined && !membershipReference) {
    throw new Error("membershipReference must not be empty when provided");
  }
  if (input.permissionReference !== undefined && !permissionReference) {
    throw new Error("permissionReference must not be empty when provided");
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
  if (input.contextReference !== undefined && !contextReference) {
    throw new Error("contextReference must not be empty when provided");
  }
  if (input.parentAuditReference !== undefined && !parentAuditReference) {
    throw new Error("parentAuditReference must not be empty when provided");
  }

  if (boundTenant !== undefined && tenantReference !== boundTenant) {
    throw new Error("audit does not apply to this tenant");
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
    ...(identityReference !== undefined && identityReference.length > 0
      ? { identityReference }
      : {}),
    ...(membershipReference !== undefined && membershipReference.length > 0
      ? { membershipReference }
      : {}),
    ...(permissionReference !== undefined && permissionReference.length > 0
      ? { permissionReference }
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
    ...(contextReference !== undefined && contextReference.length > 0
      ? { contextReference }
      : {}),
    ...(parentAuditReference !== undefined && parentAuditReference.length > 0
      ? { parentAuditReference }
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
