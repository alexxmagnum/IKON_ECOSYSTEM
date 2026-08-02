import type { PreferenceStatus } from "../types";

export type DiscoveryPreferenceId = string;

/**
 * Opaque subject whose discovery preferences are stored.
 */
export type SubjectReference = string;

/**
 * Free-form preference key — no business enums in this engine.
 * Consumers supply their own vocabulary via string keys.
 */
export type PreferenceType = string;

/**
 * Discovery preference for a subject (BR-0136: respect preferences).
 */
export interface DiscoveryPreference {
  id?: DiscoveryPreferenceId;
  subjectReference: SubjectReference;
  preferenceType: PreferenceType;
  /** Opaque preference payload (string, number, or structured JSON-like map). */
  value: string | number | boolean | Record<string, unknown>;
  status?: PreferenceStatus;
  createdAt: string;
  updatedAt?: string;
  metadata?: Record<string, unknown>;
}
