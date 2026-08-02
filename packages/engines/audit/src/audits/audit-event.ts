/**
 * Audit Engine Boundary — audit events / traceability / action context
 * (not sign-in, access control, user admin, persistence logging, SIEM,
 * or monitoring infrastructure).
 *
 * @see DEC-AUDIT-BOUNDARY-001
 */

/** Internal audit kinds — not infrastructure log categories. */
export const AUDIT_KINDS = {
  /** Something was created. */
  Creation: "audit.creation",
  /** Something was modified. */
  Update: "audit.update",
  /** Something was removed. */
  Deletion: "audit.deletion",
  /** A read / consult was observed. */
  Access: "audit.access",
  /** A domain state transition was observed. */
  Lifecycle: "audit.lifecycle",
  /**
   * Audit initiated by an Audit system operation.
   * Not a technical infrastructure error.
   */
  Operational: "audit.operational",
} as const;

export type AuditKind = (typeof AUDIT_KINDS)[keyof typeof AUDIT_KINDS];

export const AUDIT_KIND_VALUES = Object.values(
  AUDIT_KINDS,
) as readonly AuditKind[];

/** Audit event status — not storage or analytics pipeline state. */
export const AUDIT_STATUSES = {
  Pending: "pending",
  Recorded: "recorded",
  Archived: "archived",
  Failed: "failed",
  Cancelled: "cancelled",
} as const;

export type AuditStatus = (typeof AUDIT_STATUSES)[keyof typeof AUDIT_STATUSES];

export const AUDIT_STATUS_VALUES = Object.values(
  AUDIT_STATUSES,
) as readonly AuditStatus[];

/**
 * Opaque audit event — what happened, with business context.
 * No credential material, sign-in secrets, or capability catalogs.
 */
export interface AuditEvent {
  /** Opaque unique audit reference. */
  auditReference: string;
  /** Explicit tenant scope — required. */
  tenantReference: string;
  /** Internal audit kind. */
  auditKind: AuditKind;
  /** Audit event status. */
  auditStatus: AuditStatus;
  /** Opaque actor when known — not a live identity profile. */
  actorReference?: string;
  /** Opaque entity pointer — booking, payment, community, etc. */
  entityReference?: string;
  /** Opaque entity kind label — not a live type system. */
  entityKind?: string;
  /** Opaque action pointer when known. */
  actionReference?: string;
  /** Opaque source pointer when known. */
  sourceReference?: string;
  /** Controlled optional metadata — never credentials or PII. */
  metadata?: Record<string, unknown>;
}

/**
 * Outbound port for future audit adapters (Runtime).
 * Not wired in this foundation — no store, write-log, or send-log methods.
 */
export interface AuditPort {
  createAuditEvent(input: CreateAuditEventInput): Promise<AuditEvent>;
  resolveAuditEvent(auditEvent: AuditEvent): Promise<AuditEvent>;
}

export interface CreateAuditEventInput {
  tenantReference: string;
  auditKind: AuditKind;
  auditStatus?: AuditStatus;
  auditReference?: string;
  actorReference?: string;
  entityReference?: string;
  entityKind?: string;
  actionReference?: string;
  sourceReference?: string;
  metadata?: Record<string, unknown>;
}

export function isAuditKind(value: string): value is AuditKind {
  return (AUDIT_KIND_VALUES as readonly string[]).includes(value);
}

export function isAuditStatus(value: string): value is AuditStatus {
  return (AUDIT_STATUS_VALUES as readonly string[]).includes(value);
}

export function isAuditEvent(value: unknown): value is AuditEvent {
  if (value === null || typeof value !== "object") {
    return false;
  }
  const candidate = value as Record<string, unknown>;
  const actorOk =
    candidate.actorReference === undefined ||
    (typeof candidate.actorReference === "string" &&
      candidate.actorReference.length > 0);
  const entityOk =
    candidate.entityReference === undefined ||
    (typeof candidate.entityReference === "string" &&
      candidate.entityReference.length > 0);
  const entityKindOk =
    candidate.entityKind === undefined ||
    (typeof candidate.entityKind === "string" &&
      candidate.entityKind.length > 0);
  const actionOk =
    candidate.actionReference === undefined ||
    (typeof candidate.actionReference === "string" &&
      candidate.actionReference.length > 0);
  const sourceOk =
    candidate.sourceReference === undefined ||
    (typeof candidate.sourceReference === "string" &&
      candidate.sourceReference.length > 0);
  return (
    typeof candidate.auditReference === "string" &&
    candidate.auditReference.length > 0 &&
    typeof candidate.tenantReference === "string" &&
    candidate.tenantReference.length > 0 &&
    actorOk &&
    entityOk &&
    entityKindOk &&
    actionOk &&
    sourceOk &&
    typeof candidate.auditKind === "string" &&
    isAuditKind(candidate.auditKind) &&
    typeof candidate.auditStatus === "string" &&
    isAuditStatus(candidate.auditStatus)
  );
}

export function isAuditPort(value: unknown): value is AuditPort {
  return (
    value !== null &&
    typeof value === "object" &&
    typeof (value as AuditPort).createAuditEvent === "function" &&
    typeof (value as AuditPort).resolveAuditEvent === "function"
  );
}
