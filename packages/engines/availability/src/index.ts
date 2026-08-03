/**
 * @motanos/availability — Availability Engine foundation.
 *
 * MotanOS Core → Shared Engines → @motanos/availability
 *
 * Availability = when an open slot exists for a business context.
 * Must not depend on hold packages, timeline packages, unit packages,
 * collect packages, trade packages, value packages, item packages,
 * offer packages, compute vendors, or persistence vendors.
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
  AVAILABILITY_ITEM_REF_KEY,
  AVAILABILITY_KINDS,
  AVAILABILITY_KIND_VALUES,
  AVAILABILITY_STATUSES,
  AVAILABILITY_STATUS_VALUES,
  AVAILABILITY_UNIT_REF_KEY,
  createAvailability,
  isAvailability,
  isAvailabilityKind,
  isAvailabilityPort,
  isAvailabilityStatus,
  resetAvailabilityReferenceSequence,
} from "./availabilities";
