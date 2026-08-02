import type { Capability, CapabilityId } from "./capability";
import type { ExperienceStatus } from "../types";

export type ExperienceId = string;

/**
 * Abstract composable experience (data model EXPERIENCE; BR-0098 ≠ EVENT).
 * Not a sport-, dining-, or competition-specific experience type.
 */
export interface Experience {
  id: ExperienceId;
  name: string;
  description?: string;
  status: ExperienceStatus;
  /** Capabilities this experience may compose — opaque refs / inline defs. */
  capabilityReferences?: CapabilityId[];
  capabilities?: Capability[];
  /** Optional capacity hint from the data model — not enforcement logic. */
  capacity?: number;
  /** ISO-8601 schedule hints — no calendar engine. */
  startsAt?: string;
  endsAt?: string;
  metadata?: Record<string, unknown>;
  createdAt?: string;
  updatedAt?: string;
}
