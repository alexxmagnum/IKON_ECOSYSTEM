import type {
  CreateExperienceInput,
  CreateJourneyInput,
  ExperienceResult,
  JourneyResult,
  ListExperiencesQuery,
  ListJourneysQuery,
  UpdateExperienceInput,
  UpdateJourneyInput,
} from "../contracts";
import type { ExperienceId } from "../legacy/experience";
import type { JourneyId } from "../legacy/journey";

/**
 * Service contracts for the Experience Layer.
 * Interfaces only — no composition runtime or aggregate orchestration here.
 */

export interface ExperienceService {
  create(input: CreateExperienceInput): Promise<ExperienceResult>;
  update(input: UpdateExperienceInput): Promise<ExperienceResult>;
  get(experienceId: ExperienceId): Promise<ExperienceResult | null>;
  list(query: ListExperiencesQuery): Promise<ExperienceResult[]>;
}

export interface JourneyService {
  create(input: CreateJourneyInput): Promise<JourneyResult>;
  update(input: UpdateJourneyInput): Promise<JourneyResult>;
  get(journeyId: JourneyId): Promise<JourneyResult | null>;
  list(query: ListJourneysQuery): Promise<JourneyResult[]>;
}
