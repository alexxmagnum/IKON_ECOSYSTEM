/**
 * @motanos/audit — Audit Engine foundation.
 *
 * MotanOS Core → Shared Engines → @motanos/audit
 *
 * Audit = what happened: events, traceability, action context.
 * Domain actions may emit audit events; storage / analytics live elsewhere.
 *
 * Must not depend on identity, sign-in packages, access-control packages,
 * persistence vendors, or analytics vendors.
 *
 * @see DEC-AUDIT-BOUNDARY-001
 */

export const AUDIT_ENGINE = "@motanos/audit" as const;

export type {
  AuditEvent,
  AuditKind,
  AuditPort,
  AuditStatus,
  CreateAuditEventInput,
  CreateAuditEventOptions,
} from "./audits";
export {
  AUDIT_KINDS,
  AUDIT_KIND_VALUES,
  AUDIT_STATUSES,
  AUDIT_STATUS_VALUES,
  createAuditEvent,
  isAuditEvent,
  isAuditKind,
  isAuditPort,
  isAuditStatus,
  resetAuditReferenceSequence,
} from "./audits";
