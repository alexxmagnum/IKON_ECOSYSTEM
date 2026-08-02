import type { Booking, TimeInterval } from "./booking";
import type { ResourceId } from "./resource";
import {
  isAvailabilityBlocking,
  type BookingStatus,
} from "../types/states";

/** A discrete bookable window for a resource. */
export interface AvailabilitySlot extends TimeInterval {
  resourceId: ResourceId;
  /** True when the slot can accept a new availability-blocking booking. */
  available: boolean;
  reason?: string;
}

/**
 * Result of an availability inquiry (foundation shape — no adapter I/O yet).
 */
export interface Availability {
  resourceId: ResourceId;
  range: TimeInterval;
  slots: AvailabilitySlot[];
  /** Future or existing holds/blocks that constrain the range. */
  blocks: TimeInterval[];
}

/**
 * Pure interval overlap: half-open `[start, end)`.
 * Returns false when either bound is missing or non-comparable.
 */
export function intervalsOverlap(a: TimeInterval, b: TimeInterval): boolean {
  const aStart = Date.parse(a.startsAt);
  const aEnd = Date.parse(a.endsAt);
  const bStart = Date.parse(b.startsAt);
  const bEnd = Date.parse(b.endsAt);

  if (
    Number.isNaN(aStart) ||
    Number.isNaN(aEnd) ||
    Number.isNaN(bStart) ||
    Number.isNaN(bEnd)
  ) {
    return false;
  }

  if (aEnd <= aStart || bEnd <= bStart) {
    return false;
  }

  return aStart < bEnd && bStart < aEnd;
}

/**
 * BR-0031 helper: two bookings conflict when they share a resource,
 * both are availability-blocking, and their intervals overlap.
 */
export function bookingsConflict(a: Booking, b: Booking): boolean {
  if (a.resourceId !== b.resourceId) {
    return false;
  }
  if (a.id === b.id) {
    return false;
  }
  if (!isAvailabilityBlocking(a.status) || !isAvailabilityBlocking(b.status)) {
    return false;
  }
  return intervalsOverlap(a, b);
}

/** Whether a status participates in overlap exclusion (BR-0031). */
export function statusBlocksAvailability(status: BookingStatus): boolean {
  return isAvailabilityBlocking(status);
}

/**
 * Check whether a proposed interval is free of availability-blocking overlaps.
 * Uses existing bookings as the conflict set (engine authority).
 * Optional excludeBookingId skips that booking (reschedule self-window).
 */
export function checkRangeAvailability(
  resourceId: ResourceId,
  range: TimeInterval,
  existing: readonly Booking[],
  options?: { excludeBookingId?: string },
): { available: boolean; reason?: string } {
  const probe: Booking = {
    id: options?.excludeBookingId ?? "__availability-probe__",
    resourceId,
    ownerUserId: "__probe__",
    startsAt: range.startsAt,
    endsAt: range.endsAt,
    status: "Draft",
  };

  for (const booking of existing) {
    if (
      options?.excludeBookingId !== undefined &&
      booking.id === options.excludeBookingId
    ) {
      continue;
    }
    if (bookingsConflict(probe, booking)) {
      return {
        available: false,
        reason: `overlap:${booking.id}`,
      };
    }
  }

  return { available: true };
}
