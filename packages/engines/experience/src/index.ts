/**
 * @motanos/experience — Experience Engine foundation.
 *
 * MotanOS Core → Shared Engines → @motanos/experience
 *
 * Experience = what business experience exists for a context.
 * Must not depend on step packages, preference, suggestion, signal,
 * actor, or relation packages; nor compute / persistence vendors.
 *
 * @see DEC-EXPERIENCE-BOUNDARY-001
 * @see DEC-EXPERIENCE-001
 */

export const EXPERIENCE_ENGINE = "@motanos/experience" as const;

export type {
  Capability,
  CapabilityId,
  CapabilityReference,
  CapabilityType,
} from "./legacy/capability";

/** Legacy aggregate — use boundary `Experience` for new work. */
export type {
  Experience as ExperienceAggregate,
  ExperienceId,
} from "./legacy/experience";

export type {
  Journey,
  JourneyId,
  JourneyStep,
  JourneyStepId,
} from "./legacy/journey";

/** Legacy provisional aggregate statuses (DEC-EXPERIENCE-003). */
export type {
  ExperienceStatus as ExperienceAggregateStatus,
  JourneyFinalStatus,
  JourneyStatus,
} from "./types";
export {
  canTransitionJourney,
  EXPERIENCE_STATUSES as EXPERIENCE_AGGREGATE_STATUSES,
  isExperienceStatus as isExperienceAggregateStatus,
  isJourneyFinal,
  isJourneyStatus,
  JOURNEY_FINAL_STATUSES,
  JOURNEY_STATUSES,
  JOURNEY_TRANSITIONS,
} from "./types";

/** Legacy aggregate contracts — use boundary `CreateExperienceInput` for new work. */
export type {
  CreateExperienceInput as CreateExperienceAggregateInput,
  CreateJourneyInput,
  ExperienceResult,
  JourneyResult,
  ListExperiencesQuery,
  ListJourneysQuery,
  UpdateExperienceInput,
  UpdateJourneyInput,
} from "./contracts";

export type { ExperienceService, JourneyService } from "./services";

export type {
  CreateExperienceInput,
  CreateExperienceOptions,
  Experience,
  ExperienceKind,
  ExperiencePort,
  ExperienceStatus,
} from "./experiences";
export {
  EXPERIENCE_KINDS,
  EXPERIENCE_KIND_VALUES,
  EXPERIENCE_STATUSES,
  EXPERIENCE_STATUS_VALUES,
  createExperience,
  isExperience,
  isExperienceKind,
  isExperiencePort,
  isExperienceStatus,
  resetExperienceReferenceSequence,
} from "./experiences";
