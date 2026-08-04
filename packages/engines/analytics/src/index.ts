/**
 * @motanos/analytics — Analytics Boundary foundation.
 *
 * MotanOS Core → Shared packages → @motanos/analytics
 *
 * Analytics = what analytical capacity exists.
 * Must not depend on measurable-value packages, presentation packages,
 * recorded-fact packages, or technical observation engines.
 *
 * @see DEC-ANALYTICS-BOUNDARY-001
 */

export const ANALYTICS_BOUNDARY = "@motanos/analytics" as const;

export type {
  Analytics,
  AnalyticsKind,
  AnalyticsPort,
  AnalyticsStatus,
  CreateAnalyticsInput,
  CreateAnalyticsOptions,
} from "./analytics";
export {
  ANALYTICS_KINDS,
  ANALYTICS_KIND_VALUES,
  ANALYTICS_STATUSES,
  ANALYTICS_STATUS_VALUES,
  createAnalytics,
  isAnalytics,
  isAnalyticsKind,
  isAnalyticsPort,
  isAnalyticsStatus,
  resetAnalyticsReferenceSequence,
} from "./analytics";
