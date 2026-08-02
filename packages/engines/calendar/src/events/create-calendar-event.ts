import type {
  CalendarEvent,
  CalendarEventKind,
  CalendarEventStatus,
  CreateCalendarEventInput,
} from "./calendar-event";
import {
  CALENDAR_EVENT_STATUSES,
  isCalendarEventKind,
  isCalendarEventStatus,
} from "./calendar-event";

let eventSequence = 0;

export interface CreateCalendarEventOptions {
  /**
   * When set, calendar event may only be created for this tenant
   * (cross-tenant isolation).
   */
  tenantReference?: string;
}

/**
 * Build a validated CalendarEvent (in-memory — event definition only).
 * Does not create usage intents, sync external timelines, or send notices.
 */
export function createCalendarEvent(
  input: CreateCalendarEventInput,
  options: CreateCalendarEventOptions = {},
): CalendarEvent {
  const tenantReference = input.tenantReference?.trim() ?? "";
  const nameReference = input.nameReference?.trim();
  const descriptionReference = input.descriptionReference?.trim();
  const experienceReference = input.experienceReference?.trim();
  const resourceReference = input.resourceReference?.trim();
  const communityReference = input.communityReference?.trim();
  const startReference = input.startReference?.trim();
  const endReference = input.endReference?.trim();
  const boundTenant = options.tenantReference?.trim() || undefined;

  if (!tenantReference) {
    throw new Error("tenantReference is required");
  }
  if (!isCalendarEventKind(input.eventKind)) {
    throw new Error(`Unknown calendar event kind: ${String(input.eventKind)}`);
  }

  const eventStatus: CalendarEventStatus =
    input.eventStatus ?? CALENDAR_EVENT_STATUSES.Draft;
  if (!isCalendarEventStatus(eventStatus)) {
    throw new Error(
      `Unknown calendar event status: ${String(input.eventStatus)}`,
    );
  }

  if (input.nameReference !== undefined && !nameReference) {
    throw new Error("nameReference must not be empty when provided");
  }
  if (input.descriptionReference !== undefined && !descriptionReference) {
    throw new Error("descriptionReference must not be empty when provided");
  }
  if (input.experienceReference !== undefined && !experienceReference) {
    throw new Error("experienceReference must not be empty when provided");
  }
  if (input.resourceReference !== undefined && !resourceReference) {
    throw new Error("resourceReference must not be empty when provided");
  }
  if (input.communityReference !== undefined && !communityReference) {
    throw new Error("communityReference must not be empty when provided");
  }
  if (input.startReference !== undefined && !startReference) {
    throw new Error("startReference must not be empty when provided");
  }
  if (input.endReference !== undefined && !endReference) {
    throw new Error("endReference must not be empty when provided");
  }

  if (boundTenant !== undefined && tenantReference !== boundTenant) {
    throw new Error("calendar event does not apply to this tenant");
  }

  const providedReference = input.eventReference?.trim() ?? "";
  if (input.eventReference !== undefined && !providedReference) {
    throw new Error("eventReference must not be empty when provided");
  }

  const eventKind: CalendarEventKind = input.eventKind;
  const eventReference = providedReference || allocateEventReference();

  return {
    eventReference,
    tenantReference,
    eventKind,
    eventStatus,
    ...(nameReference !== undefined && nameReference.length > 0
      ? { nameReference }
      : {}),
    ...(descriptionReference !== undefined && descriptionReference.length > 0
      ? { descriptionReference }
      : {}),
    ...(experienceReference !== undefined && experienceReference.length > 0
      ? { experienceReference }
      : {}),
    ...(resourceReference !== undefined && resourceReference.length > 0
      ? { resourceReference }
      : {}),
    ...(communityReference !== undefined && communityReference.length > 0
      ? { communityReference }
      : {}),
    ...(startReference !== undefined && startReference.length > 0
      ? { startReference }
      : {}),
    ...(endReference !== undefined && endReference.length > 0
      ? { endReference }
      : {}),
    ...(input.metadata !== undefined ? { metadata: input.metadata } : {}),
  };
}

function allocateEventReference(): string {
  eventSequence += 1;
  return `event-${eventSequence}`;
}

/** Test helper — reset opaque id sequence. */
export function resetCalendarEventReferenceSequence(): void {
  eventSequence = 0;
}
