/**
 * @motanos/experimentation — Experimentation Boundary foundation.
 *
 * MotanOS Core → Shared packages → @motanos/experimentation
 *
 * Experimentation = what trial exists.
 * Must not depend on capacity packages, signal packages,
 * value packages, or live technical trial engines.
 *
 * @see DEC-EXPERIMENTATION-BOUNDARY-001
 */

export const EXPERIMENTATION_BOUNDARY = "@motanos/experimentation" as const;

export type {
  CreateExperimentationInput,
  CreateExperimentationOptions,
  Experimentation,
  ExperimentationKind,
  ExperimentationPort,
  ExperimentationStatus,
} from "./experimentation/mod";
export {
  EXPERIMENTATION_KINDS,
  EXPERIMENTATION_KIND_VALUES,
  EXPERIMENTATION_SETTINGS_REF_KEY,
  EXPERIMENTATION_STATUSES,
  EXPERIMENTATION_STATUS_VALUES,
  createExperimentation,
  isExperimentation,
  isExperimentationKind,
  isExperimentationPort,
  isExperimentationStatus,
  resetExperimentationReferenceSequence,
} from "./experimentation/mod";
