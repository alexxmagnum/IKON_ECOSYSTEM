import type { BookingStatus } from "../types/states";
import type { ResourceId } from "./resource";

export type BookingId = string;
export type UserId = string;
export type ParticipantId = string;

/**
 * Inclusive start / exclusive-or-end interval for a booking.
 * ISO-8601 strings keep the engine free of Date library choices.
 */
export interface TimeInterval {
  startsAt: string;
  endsAt: string;
}

/**
 * Unified reservation aggregate (docs/47_BOOKING_MODULE + BOOKING machine).
 * Independent of resource kind — consuming domains map their assets onto Resource.
 */
export interface Booking extends TimeInterval {
  id: BookingId;
  /** Opaque tenant scope (DEC-BOOKING-TENANT-001 — Option A: on aggregate). */
  tenantReference: string;
  resourceId: ResourceId;
  /** Owner of the booking (BR-0016). */
  ownerUserId: UserId;
  status: BookingStatus;
  /** Present while a temporary hold is active (Draft / payment flows). */
  holdExpiresAt?: string;
  /** Optional links to product aggregates; Booking does not interpret them. */
  experienceId?: string;
  eventId?: string;
  metadata?: Record<string, unknown>;
  createdAt?: string;
  updatedAt?: string;
}

/** Participant attached to a booking (capacity / party size). */
export interface BookingParticipant {
  id: ParticipantId;
  bookingId: BookingId;
  userId: UserId;
  role?: "owner" | "guest" | "member" | "other";
  metadata?: Record<string, unknown>;
}

/** Non-blocking waitlist entry (BR-0035). */
export interface WaitlistEntry {
  id: string;
  resourceId: ResourceId;
  userId: UserId;
  createdAt: string;
  offerExpiresAt?: string;
  metadata?: Record<string, unknown>;
}
