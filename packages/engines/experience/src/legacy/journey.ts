import type { CapabilityId, CapabilityReference } from "./capability";
import type { ExperienceId } from "./experience";
import type { JourneyStatus } from "../types";

export type JourneyId = string;
export type JourneyStepId = string;

/**
 * Single abstract step in a journey — no process runner.
 */
export interface JourneyStep {
  id: JourneyStepId;
  name?: string;
  order: number;
  capabilityId?: CapabilityId;
  capabilityReference?: CapabilityReference;
  metadata?: Record<string, unknown>;
}

/**
 * Abstract sequence for living an Experience.
 * Composition model only — not an automation or orchestration runtime.
 */
export interface Journey {
  id: JourneyId;
  experienceReference: ExperienceId;
  steps: JourneyStep[];
  status?: JourneyStatus;
  metadata?: Record<string, unknown>;
  createdAt?: string;
  updatedAt?: string;
}
