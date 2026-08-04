/**
 * @motanos/feature — Feature Boundary foundation.
 *
 * MotanOS Core → Shared packages → @motanos/feature
 *
 * Feature = what functional capacity exists.
 * Must not depend on settings packages, trial suites,
 * distribution suites, or live technical activation engines.
 *
 * @see DEC-FEATURE-BOUNDARY-001
 */

export const FEATURE_BOUNDARY = "@motanos/feature" as const;

export type {
  CreateFeatureInput,
  CreateFeatureOptions,
  Feature,
  FeatureKind,
  FeaturePort,
  FeatureStatus,
} from "./feature/mod";
export {
  FEATURE_KINDS,
  FEATURE_KIND_VALUES,
  FEATURE_SETTINGS_REF_KEY,
  FEATURE_STATUSES,
  FEATURE_STATUS_VALUES,
  createFeature,
  isFeature,
  isFeatureKind,
  isFeaturePort,
  isFeatureStatus,
  resetFeatureReferenceSequence,
} from "./feature/mod";
