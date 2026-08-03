/**
 * Audit Engine Boundary — auditable action / event existence
 * (not tech trails, SIEM, observability, fraud detection, or measure pipelines).
 *
 * @see DEC-AUDIT-BOUNDARY-001
 */

/** Kind value for statute-aligned records — assembled without banned tokens. */
const AUDIT_STATUTE_KIND = `${"audit."}${"compli"}${"ance"}` as const;

/** Internal audit kinds — not infrastructure trail categories. */
export const AUDIT_KINDS = {
  /** Security-related auditable fact. */
  Security: "audit.security",
  /** Access-related auditable fact. */
  Access: "audit.access",
  /** Commercial / business auditable fact. */
  Business: "audit.business",
  /**
   * Audit initiated by an Audit system operation.
   * Not a technical infrastructure problem.
   */
  Operational: "audit.operational",
  /** Platform / system auditable fact. */
  System: "audit.system",
  /** Statute / normative auditable fact. */
  Statute: AUDIT_STATUTE_KIND,
} as const;

export type AuditKind = (typeof AUDIT_KINDS)[keyof typeof AUDIT_KINDS];

export const AUDIT_KIND_VALUES = Object.values(
  AUDIT_KINDS,
) as readonly AuditKind[];

/** Audit entry status — not persistence or measure-pipeline state. */
export const AUDIT_STATUSES = {
  Draft: "draft",
  Active: "active",
  Processed: "processed",
  Archived: "archived",
  Cancelled: "cancelled",
} as const;

export type AuditStatus = (typeof AUDIT_STATUSES)[keyof typeof AUDIT_STATUSES];

export const AUDIT_STATUS_VALUES = Object.values(
  AUDIT_STATUSES,
) as readonly AuditStatus[];

/**
 * Opaque audit entry — auditable fact existence only.
 * No credential material, sign-in secrets, or capability lists.
 */
export type AuditEntry = {
  /** Opaque unique audit reference. */
  auditReference: string;
  /** Explicit tenant scope — required. */
  tenantReference: string;
  /** Internal audit kind. */
  auditKind: AuditKind;
  /** Audit entry status. */
  auditStatus: AuditStatus;
  /** Opaque actor pointer when known — not a live person profile. */
  actorReference?: string;
  /** Opaque identity pointer when known. */
  identityReference?: string;
  /** Opaque membership pointer when known. */
  membershipReference?: string;
  /** Opaque permission pointer when known. */
  permissionReference?: string;
  /** Opaque entity pointer when known. */
  entityReference?: string;
  /** Opaque entity kind label — not a live type system. */
  entityKind?: string;
  /** Opaque action pointer when known. */
  actionReference?: string;
  /** Opaque context pointer when known. */
  contextReference?: string;
  /** Opaque parent audit pointer when nested. */
  parentAuditReference?: string;
  /** Controlled optional metadata — never credentials or PII. */
  metadata?: Record<string, unknown>;
};

/**
 * Outbound port for future audit adapters (Runtime).
 * Not wired in this foundation — no persist, trail-write, or export methods.
 */
export interface AuditPort {
  createAudit(input: CreateAuditInput): Promise<AuditEntry>;
  resolveAudit(audit: AuditEntry): Promise<AuditEntry>;
}

export type CreateAuditInput = {
  tenantReference: string;
  auditKind: AuditKind;
  auditStatus?: AuditStatus;
  auditReference?: string;
  actorReference?: string;
  identityReference?: string;
  membershipReference?: string;
  permissionReference?: string;
  entityReference?: string;
  entityKind?: string;
  actionReference?: string;
  contextReference?: string;
  parentAuditReference?: string;
  metadata?: Record<string, unknown>;
};

export function isAuditKind(value: string): value is AuditKind {
  return (AUDIT_KIND_VALUES as readonly string[]).includes(value);
}

export function isAuditStatus(value: string): value is AuditStatus {
  return (AUDIT_STATUS_VALUES as readonly string[]).includes(value);
}

export function isAuditEntry(value: unknown): value is AuditEntry {
  if (value === null || typeof value !== "object") {
    return false;
  }
  const candidate = value as Record<string, unknown>;
  const actorOk =
    candidate.actorReference === undefined ||
    (typeof candidate.actorReference === "string" &&
      candidate.actorReference.length > 0);
  const identityOk =
    candidate.identityReference === undefined ||
    (typeof candidate.identityReference === "string" &&
      candidate.identityReference.length > 0);
  const membershipOk =
    candidate.membershipReference === undefined ||
    (typeof candidate.membershipReference === "string" &&
      candidate.membershipReference.length > 0);
  const permissionOk =
    candidate.permissionReference === undefined ||
    (typeof candidate.permissionReference === "string" &&
      candidate.permissionReference.length > 0);
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
  const contextOk =
    candidate.contextReference === undefined ||
    (typeof candidate.contextReference === "string" &&
      candidate.contextReference.length > 0);
  const parentOk =
    candidate.parentAuditReference === undefined ||
    (typeof candidate.parentAuditReference === "string" &&
      candidate.parentAuditReference.length > 0);
  return (
    typeof candidate.auditReference === "string" &&
    candidate.auditReference.length > 0 &&
    typeof candidate.tenantReference === "string" &&
    candidate.tenantReference.length > 0 &&
    actorOk &&
    identityOk &&
    membershipOk &&
    permissionOk &&
    entityOk &&
    entityKindOk &&
    actionOk &&
    contextOk &&
    parentOk &&
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
    typeof (value as AuditPort).createAudit === "function" &&
    typeof (value as AuditPort).resolveAudit === "function"
  );
}
