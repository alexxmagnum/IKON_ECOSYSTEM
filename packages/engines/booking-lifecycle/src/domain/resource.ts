import type { ResourceStatus } from "../types/states";

/**
 * Generic category of a bookable resource.
 * Domains map their concrete assets (courses, tables, courts, seats) onto these.
 * Booking never knows domain-specific names.
 */
export const RESOURCE_TYPES = [
  "sport",
  "dining",
  "event",
  "facility",
  "other",
] as const;

export type ResourceType = (typeof RESOURCE_TYPES)[number];

/** Opaque identifiers — string branded for future UUID wiring. */
export type ResourceId = string;
export type FacilityId = string;

/**
 * Any reservable element managed by the Booking Engine.
 * Consumers attach domain meaning via `type` + optional `metadata`.
 */
export interface Resource {
  id: ResourceId;
  name: string;
  type: ResourceType;
  /** Optional parent facility when the club model uses facilities. */
  facilityId?: FacilityId;
  status?: ResourceStatus;
  /** Domain-specific opaque payload; Booking does not interpret keys. */
  metadata?: Record<string, unknown>;
}

/**
 * Time-window constraints that a resource may declare (BR-0036).
 * Values are minutes unless noted. Foundation types only.
 */
export interface AvailabilityRule {
  id: string;
  resourceId: ResourceId;
  /** Minimum bookable duration in minutes. */
  minDurationMinutes?: number;
  /** Maximum bookable duration in minutes. */
  maxDurationMinutes?: number;
  /** Buffer before a booking starts (minutes). */
  prepMinutes?: number;
  /** Buffer after a booking ends (minutes). */
  cleanupMinutes?: number;
  /** Required gap between bookings (minutes). */
  separationMinutes?: number;
  /** Opaque schedule / calendar hints for future engines. */
  metadata?: Record<string, unknown>;
}
