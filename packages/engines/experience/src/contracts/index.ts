import type { Capability, CapabilityId } from "../domain/capability";
import type { Experience, ExperienceId } from "../domain/experience";
import type {
  Journey,
  JourneyId,
  JourneyStep,
} from "../domain/journey";
import type { ExperienceStatus, JourneyStatus } from "../types";

/**
 * API-oriented TypeScript contracts for a future Experience Layer surface.
 * No route handlers or workflow runtimes live here.
 */

export interface CreateExperienceInput {
  name: string;
  description?: string;
  status?: ExperienceStatus;
  capabilityReferences?: CapabilityId[];
  capabilities?: Capability[];
  capacity?: number;
  startsAt?: string;
  endsAt?: string;
  metadata?: Record<string, unknown>;
}

export interface UpdateExperienceInput {
  experienceId: ExperienceId;
  name?: string;
  description?: string;
  status?: ExperienceStatus;
  capabilityReferences?: CapabilityId[];
  capabilities?: Capability[];
  capacity?: number;
  startsAt?: string;
  endsAt?: string;
  metadata?: Record<string, unknown>;
}

export interface ExperienceResult {
  experience: Experience;
}

export interface ListExperiencesQuery {
  status?: ExperienceStatus | ExperienceStatus[];
  capabilityId?: CapabilityId;
}

export interface CreateJourneyInput {
  experienceReference: ExperienceId;
  steps: JourneyStep[];
  status?: JourneyStatus;
  metadata?: Record<string, unknown>;
}

export interface UpdateJourneyInput {
  journeyId: JourneyId;
  steps?: JourneyStep[];
  status?: JourneyStatus;
  metadata?: Record<string, unknown>;
}

export interface JourneyResult {
  journey: Journey;
}

export interface ListJourneysQuery {
  experienceReference?: ExperienceId;
  status?: JourneyStatus | JourneyStatus[];
}
