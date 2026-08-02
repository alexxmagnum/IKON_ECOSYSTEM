/**
 * @motanos/availability — Availability Engine foundation.
 *
 * MotanOS Core → Shared Engines → @motanos/availability
 *
 * Availability = when something may be used (temporal rule).
 * Resource = what exists. Usage intents and timelines live elsewhere.
 *
 * Must not depend on usage engines, resource engines, experience engines,
 * commerce packages, auth packages, or persistence vendors.
 *
 * Distinct from any MotanOS usage-engine policy boundary.
 *
 * @see DEC-AVAILABILITY-BOUNDARY-001
 */

export const AVAILABILITY_ENGINE = "@motanos/availability" as const;

export type {
  Availability,
  AvailabilityKind,
  AvailabilityPort,
  AvailabilityStatus,
  CreateAvailabilityInput,
  CreateAvailabilityOptions,
} from "./availabilities";
export {
  AVAILABILITY_KINDS,
  AVAILABILITY_KIND_VALUES,
  AVAILABILITY_STATUSES,
  AVAILABILITY_STATUS_VALUES,
  createAvailability,
  isAvailability,
  isAvailabilityKind,
  isAvailabilityPort,
  isAvailabilityStatus,
  resetAvailabilityReferenceSequence,
} from "./availabilities";
