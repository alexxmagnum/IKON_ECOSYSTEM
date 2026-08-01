import type {
  AttachEventBookingReferenceInput,
  AttachEventPaymentReferenceInput,
  AttachEventResourceReferenceInput,
  CreateEventCategoryInput,
  CreateEventInput,
  EventCategoryResult,
  EventParticipantResult,
  EventResult,
  ListEventParticipantsQuery,
  ListEventsQuery,
  RegisterEventParticipantInput,
  UpdateEventParticipantStatusInput,
  UpdateEventStatusInput,
} from "../contracts";
import type { EventCategoryId } from "../domain/category";
import type { EventId } from "../domain/event";
import type { EventParticipantId } from "../domain/participant";

/**
 * Events domain service contracts.
 * Implementations must call Booking / Payment engines for seats and charges.
 * This package never owns those workflows.
 */

export interface EventCategoryService {
  create(input: CreateEventCategoryInput): Promise<EventCategoryResult>;
  getById(categoryId: EventCategoryId): Promise<EventCategoryResult | null>;
  list(): Promise<EventCategoryResult[]>;
}

export interface EventService {
  create(input: CreateEventInput): Promise<EventResult>;
  updateStatus(input: UpdateEventStatusInput): Promise<EventResult>;
  attachBookingReference(
    input: AttachEventBookingReferenceInput,
  ): Promise<EventResult>;
  attachResourceReference(
    input: AttachEventResourceReferenceInput,
  ): Promise<EventResult>;
  attachPaymentReference(
    input: AttachEventPaymentReferenceInput,
  ): Promise<EventResult>;
  getById(eventId: EventId): Promise<EventResult | null>;
  list(query: ListEventsQuery): Promise<EventResult[]>;
}

export interface EventParticipantService {
  register(
    input: RegisterEventParticipantInput,
  ): Promise<EventParticipantResult>;
  updateStatus(
    input: UpdateEventParticipantStatusInput,
  ): Promise<EventParticipantResult>;
  getById(
    participantId: EventParticipantId,
  ): Promise<EventParticipantResult | null>;
  list(query: ListEventParticipantsQuery): Promise<EventParticipantResult[]>;
}
