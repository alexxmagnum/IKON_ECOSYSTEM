/**
 * @motanos/audit — Audit Engine Boundary foundation.
 *
 * MotanOS Core → Shared Engines → @motanos/audit
 *
 * Audit = auditable action / event existence for a business context.
 * Must not depend on persistence vendors, tech-trail packages,
 * measure packages, statute packages, or observability vendors.
 *
 * @see DEC-AUDIT-BOUNDARY-001
 */

export const AUDIT_ENGINE = "@motanos/audit" as const;

export type {
  AuditEntry,
  AuditKind,
  AuditPort,
  AuditStatus,
  CreateAuditInput,
  CreateAuditOptions,
} from "./audits";
export {
  AUDIT_KINDS,
  AUDIT_KIND_VALUES,
  AUDIT_STATUSES,
  AUDIT_STATUS_VALUES,
  createAudit,
  isAuditEntry,
  isAuditKind,
  isAuditPort,
  isAuditStatus,
  resetAuditReferenceSequence,
} from "./audits";
