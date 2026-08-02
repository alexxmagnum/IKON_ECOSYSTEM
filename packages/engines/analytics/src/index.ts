/**
 * @motanos/analytics — Analytics Engine foundation.
 *
 * MotanOS Core → Shared Engines → @motanos/analytics
 *
 * Analytics = measurable business signals and metric context.
 * Domain / audit facts may emit signals; metrics, reporting, and BI live elsewhere.
 *
 * Must not depend on audit, booking, commerce, billing, persistence vendors,
 * or external metric vendors.
 *
 * @see DEC-ANALYTICS-BOUNDARY-001
 */

export const ANALYTICS_ENGINE = "@motanos/analytics" as const;

export type {
  AnalyticsEvent,
  AnalyticsKind,
  AnalyticsPort,
  AnalyticsStatus,
  CreateAnalyticsEventInput,
  CreateAnalyticsEventOptions,
} from "./analytics";
export {
  ANALYTICS_KINDS,
  ANALYTICS_KIND_VALUES,
  ANALYTICS_STATUSES,
  ANALYTICS_STATUS_VALUES,
  createAnalyticsEvent,
  isAnalyticsEvent,
  isAnalyticsKind,
  isAnalyticsPort,
  isAnalyticsStatus,
  resetAnalyticsReferenceSequence,
} from "./analytics";
