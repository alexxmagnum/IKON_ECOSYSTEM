/**
 * Free-form capability kind (DEC-EXPERIENCE-004 — extensible, no catalog yet).
 * No engine/domain imports — vocabulary is opaque.
 */
export type CapabilityType = string;

export type CapabilityId = string;

/**
 * Opaque pointer to an external capability instance.
 */
export type CapabilityReference = string;

/**
 * Required capability for composing an Experience.
 * Does not import Booking, Payments, Social, or domains.
 */
export interface Capability {
  id: CapabilityId;
  type: CapabilityType;
  reference?: CapabilityReference;
  metadata?: Record<string, unknown>;
}
