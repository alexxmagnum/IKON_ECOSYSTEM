import type { BookingId, ResourceId } from "@motanos/booking-lifecycle";
import type { PaymentId } from "@motanos/payments";
import type { EventCategoryId } from "./category";
import type { EventStatus } from "../types";

export type EventId = string;

/**
 * Schedule window for an event (ISO-8601).
 * Not a calendar UI — domain timing only.
 */
export interface EventSchedule {
  startsAt: string;
  endsAt?: string;
  timezone?: string;
}

/**
 * Opaque link to a related Experience aggregate (BR-0098: EVENT ≠ EXPERIENCE).
 */
export type ExperienceRef = string;

/**
 * Club event / organized activity (EVENT machine).
 * Seat reservation and charges stay in Booking / Payments engines.
 */
export interface Event {
  id: EventId;
  title: string;
  description?: string;
  categoryId: EventCategoryId;
  status: EventStatus;
  schedule?: EventSchedule;
  /** Max confirmed seats (BR-0092). */
  capacity?: number;
  location?: string;
  /**
   * Bookable resource for venue/slot capacity when the event uses Booking.
   */
  resourceId?: ResourceId;
  /**
   * Optional Booking Engine reservation linked to this event.
   * Events never owns a parallel reservation system.
   */
  bookingReference?: BookingId;
  /**
   * Optional Payment Engine reference (registration fee) — no charge logic.
   */
  paymentReference?: PaymentId;
  /** Optional related Experience — distinct aggregate (BR-0098). */
  experienceReference?: ExperienceRef;
  /** Private events are restricted (BR-0095); flag only — no auth here. */
  isPrivate?: boolean;
  metadata?: Record<string, unknown>;
  createdAt?: string;
  updatedAt?: string;
}
