/**
 * @motanos/experience — Experience Layer foundation
 * (DEC-EXPERIENCE-001 / DEC-EXPERIENCE-002).
 *
 * MotanOS Core → Shared Engines → Experience Layer → Domain Modules
 *
 * Composes opaque capabilities. Does not import domains, engines
 * (including discovery/social), auth, or DB (DEC-EXPERIENCE-005).
 */

export const EXPERIENCE_ENGINE = "@motanos/experience" as const;

export type {
  Capability,
  CapabilityId,
  CapabilityReference,
  CapabilityType,
} from "./domain/capability";

export type { Experience, ExperienceId } from "./domain/experience";

export type {
  Journey,
  JourneyId,
  JourneyStep,
  JourneyStepId,
} from "./domain/journey";

export type {
  ExperienceStatus,
  JourneyFinalStatus,
  JourneyStatus,
} from "./types";
export {
  canTransitionJourney,
  EXPERIENCE_STATUSES,
  isExperienceStatus,
  isJourneyFinal,
  isJourneyStatus,
  JOURNEY_FINAL_STATUSES,
  JOURNEY_STATUSES,
  JOURNEY_TRANSITIONS,
} from "./types";

export type {
  CreateExperienceInput,
  CreateJourneyInput,
  ExperienceResult,
  JourneyResult,
  ListExperiencesQuery,
  ListJourneysQuery,
  UpdateExperienceInput,
  UpdateJourneyInput,
} from "./contracts";

export type { ExperienceService, JourneyService } from "./services";
