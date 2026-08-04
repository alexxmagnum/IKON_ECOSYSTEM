import type {
  CreateEventInput,
  Event,
  EventKind,
  EventStatus,
} from "./event";
import { EVENT_STATUSES, isEventKind, isEventStatus } from "./event";

let eventSequence = 0;

export interface CreateEventOptions {
  /**
   * When set, event may only be created for this ambit
   * (cross-context isolation).
   */
  contextReference?: string;
}

/**
 * Build a checked Event (in-memory — domain occurrence existence only).
 * Does not publish, dispatch, store technically, or wire listeners.
 */
export function createEvent(
  input: CreateEventInput,
  options: CreateEventOptions = {},
): Event {
  const actorReference = input.actorReference?.trim();
  const contextReference = input.contextReference?.trim();
  const entityReference = input.entityReference?.trim();
  const entityKind = input.entityKind?.trim();
  const sourceReference = input.sourceReference?.trim();
  const parentEventReference = input.parentEventReference?.trim();
  const boundContext = options.contextReference?.trim() || undefined;

  if (!isEventKind(input.eventKind)) {
    throw new Error(`Unknown event kind: ${String(input.eventKind)}`);
  }

  const eventStatus: EventStatus =
    input.eventStatus ?? EVENT_STATUSES.Draft;
  if (!isEventStatus(eventStatus)) {
    throw new Error(`Unknown event status: ${String(input.eventStatus)}`);
  }

  if (input.actorReference !== undefined && !actorReference) {
    throw new Error("actorReference must not be empty when provided");
  }
  if (input.contextReference !== undefined && !contextReference) {
    throw new Error("contextReference must not be empty when provided");
  }
  if (input.entityReference !== undefined && !entityReference) {
    throw new Error("entityReference must not be empty when provided");
  }
  if (input.entityKind !== undefined && !entityKind) {
    throw new Error("entityKind must not be empty when provided");
  }
  if (input.sourceReference !== undefined && !sourceReference) {
    throw new Error("sourceReference must not be empty when provided");
  }
  if (input.parentEventReference !== undefined && !parentEventReference) {
    throw new Error("parentEventReference must not be empty when provided");
  }

  if (
    boundContext !== undefined &&
    (contextReference === undefined || contextReference !== boundContext)
  ) {
    throw new Error("event does not apply to this scope");
  }

  const providedReference = input.eventReference?.trim() ?? "";
  if (input.eventReference !== undefined && !providedReference) {
    throw new Error("eventReference must not be empty when provided");
  }

  const eventKind: EventKind = input.eventKind;
  const eventReference = providedReference || allocateEventReference();

  return {
    eventReference,
    eventKind,
    eventStatus,
    ...(actorReference !== undefined && actorReference.length > 0
      ? { actorReference }
      : {}),
    ...(contextReference !== undefined && contextReference.length > 0
      ? { contextReference }
      : {}),
    ...(entityReference !== undefined && entityReference.length > 0
      ? { entityReference }
      : {}),
    ...(entityKind !== undefined && entityKind.length > 0
      ? { entityKind }
      : {}),
    ...(sourceReference !== undefined && sourceReference.length > 0
      ? { sourceReference }
      : {}),
    ...(parentEventReference !== undefined && parentEventReference.length > 0
      ? { parentEventReference }
      : {}),
    ...(input.metadata !== undefined ? { metadata: input.metadata } : {}),
  };
}

function allocateEventReference(): string {
  eventSequence += 1;
  return `event-${eventSequence}`;
}

/** Test helper — reset opaque id sequence. */
export function resetEventReferenceSequence(): void {
  eventSequence = 0;
}
