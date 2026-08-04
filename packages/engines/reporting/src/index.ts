/**
 * @motanos/reporting — Reporting Boundary foundation.
 *
 * MotanOS Core → Shared packages → @motanos/reporting
 *
 * Reporting = what information representation exists.
 * Must not depend on capacity packages, measurable-value packages,
 * recorded-fact packages, communication packages, or live technical engines.
 *
 * @see DEC-REPORTING-BOUNDARY-001
 */

export const REPORTING_BOUNDARY = "@motanos/reporting" as const;

export type {
  CreateReportingInput,
  CreateReportingOptions,
  Reporting,
  ReportingKind,
  ReportingPort,
  ReportingStatus,
} from "./reportings";
export {
  REPORTING_CAPACITY_REF_KEY,
  REPORTING_KINDS,
  REPORTING_KIND_VALUES,
  REPORTING_STATUSES,
  REPORTING_STATUS_VALUES,
  createReporting,
  isReporting,
  isReportingKind,
  isReportingPort,
  isReportingStatus,
  resetReportingReferenceSequence,
} from "./reportings";
