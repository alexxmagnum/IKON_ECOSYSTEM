import type { BookingId, ResourceId } from "@motanos/booking-lifecycle";
import type { PaymentId } from "@motanos/payments";
import type { EventCategory, EventCategoryId } from "../domain/category";
import type {
  Event,
  EventId,
  EventSchedule,
  ExperienceRef,
} from "../domain/event";
import type {
  EventParticipant,
  EventParticipantId,
  ParticipantRef,
} from "../domain/participant";
import type { EventParticipantStatus, EventStatus } from "../types";

/**
 * API-oriented TypeScript contracts for a future Events domain surface.
 * No route handlers. Reservation/payment mutations belong to their engines.
 */

export interface CreateEventCategoryInput {
  name: string;
  description?: string;
  metadata?: Record<string, unknown>;
}

export interface CreateEventInput {
  title: string;
  description?: string;
  categoryId: EventCategoryId;
  status?: EventStatus;
  schedule?: EventSchedule;
  capacity?: number;
  location?: string;
  resourceId?: ResourceId;
  bookingReference?: BookingId;
  paymentReference?: PaymentId;
  experienceReference?: ExperienceRef;
  isPrivate?: boolean;
  metadata?: Record<string, unknown>;
}

export interface UpdateEventStatusInput {
  eventId: EventId;
  status: EventStatus;
}

export interface AttachEventBookingReferenceInput {
  eventId: EventId;
  bookingReference: BookingId;
}

export interface AttachEventResourceReferenceInput {
  eventId: EventId;
  resourceId: ResourceId;
}

export interface AttachEventPaymentReferenceInput {
  eventId: EventId;
  paymentReference: PaymentId;
}

export interface RegisterEventParticipantInput {
  eventId: EventId;
  participantRef: ParticipantRef;
  displayName?: string;
  status?: EventParticipantStatus;
  metadata?: Record<string, unknown>;
}

export interface UpdateEventParticipantStatusInput {
  participantId: EventParticipantId;
  status: EventParticipantStatus;
}

export interface EventCategoryResult {
  category: EventCategory;
}

export interface EventResult {
  event: Event;
}

export interface EventParticipantResult {
  participant: EventParticipant;
}

export interface ListEventsQuery {
  categoryId?: EventCategoryId;
  status?: EventStatus | EventStatus[];
  resourceId?: ResourceId;
  bookingReference?: BookingId;
}

export interface ListEventParticipantsQuery {
  eventId: EventId;
  status?: EventParticipantStatus | EventParticipantStatus[];
}
