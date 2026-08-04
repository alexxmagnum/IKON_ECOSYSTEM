/**
 * Event Boundary — domain occurrence representation (“what occurrence exists”)
 * (not recorded facts, process flows, communications, or technical keep-alive).
 *
 * Distinct from legacy `@motanos/domain-events` domain scaffolding.
 *
 * @see DEC-EVENT-BOUNDARY-001
 */

/** Internal event kinds — not recorded-fact or process-flow catalogs. */
export const EVENT_KINDS = {
  /** Commercial / business occurrence. */
  Business: "event.business",
  /**
   * Event initiated by an Event system operation.
   * Not a technical platform problem.
   */
  Operational: "event.operational",
  /** Domain occurrence. */
  Domain: "event.domain",
  /** Internal MotanOS system occurrence. */
  System: "event.system",
  /** Customer-facing occurrence. */
  Customer: "event.customer",
  /** Experience occurrence. */
  Experience: "event.experience",
  /** Internal platform occurrence. */
  Internal: "event.internal",
} as const;

export type EventKind = (typeof EVENT_KINDS)[keyof typeof EVENT_KINDS];

export const EVENT_KIND_VALUES = Object.values(
  EVENT_KINDS,
) as readonly EventKind[];

/** Event status — not technical delivery or keep-alive state. */
export const EVENT_STATUSES = {
  Draft: "draft",
  Active: "active",
  Processed: "processed",
  Archived: "archived",
  Cancelled: "cancelled",
} as const;

export type EventStatus =
  (typeof EVENT_STATUSES)[keyof typeof EVENT_STATUSES];

export const EVENT_STATUS_VALUES = Object.values(
  EVENT_STATUSES,
) as readonly EventStatus[];

/**
 * Opaque event — domain occurrence existence only.
 * No delivery payloads, backlog handles, or listener wiring.
 */
export type Event = {
  /** Opaque unique event reference. */
  eventReference: string;
  /** Internal event kind. */
  eventKind: EventKind;
  /** Event status. */
  eventStatus: EventStatus;
  /** Opaque actor pointer when known. */
  actorReference?: string;
  /** Opaque ambit pointer when known. */
  contextReference?: string;
  /** Opaque entity pointer when known. */
  entityReference?: string;
  /** Opaque entity kind label when known. */
  entityKind?: string;
  /** Opaque source pointer when known. */
  sourceReference?: string;
  /** Opaque parent event pointer when nested. */
  parentEventReference?: string;
  /** Controlled optional metadata — never secrets or PII. */
  metadata?: Record<string, unknown>;
};

/**
 * Outbound port for future event adapters.
 * Not wired in this foundation — no publish, dispatch, or technical store.
 */
export interface EventPort {
  createEvent(input: CreateEventInput): Promise<Event>;
  resolveEvent(event: Event): Promise<Event>;
}

export type CreateEventInput = {
  eventKind: EventKind;
  eventStatus?: EventStatus;
  eventReference?: string;
  actorReference?: string;
  contextReference?: string;
  entityReference?: string;
  entityKind?: string;
  sourceReference?: string;
  parentEventReference?: string;
  metadata?: Record<string, unknown>;
};

export function isEventKind(value: string): value is EventKind {
  return (EVENT_KIND_VALUES as readonly string[]).includes(value);
}

export function isEventStatus(value: string): value is EventStatus {
  return (EVENT_STATUS_VALUES as readonly string[]).includes(value);
}

function optionalOpaqueOk(
  candidate: Record<string, unknown>,
  key: string,
): boolean {
  const raw = candidate[key];
  return (
    raw === undefined || (typeof raw === "string" && raw.length > 0)
  );
}

export function isEvent(value: unknown): value is Event {
  if (value === null || typeof value !== "object") {
    return false;
  }
  const candidate = value as Record<string, unknown>;
  return (
    typeof candidate.eventReference === "string" &&
    candidate.eventReference.length > 0 &&
    optionalOpaqueOk(candidate, "actorReference") &&
    optionalOpaqueOk(candidate, "contextReference") &&
    optionalOpaqueOk(candidate, "entityReference") &&
    optionalOpaqueOk(candidate, "entityKind") &&
    optionalOpaqueOk(candidate, "sourceReference") &&
    optionalOpaqueOk(candidate, "parentEventReference") &&
    typeof candidate.eventKind === "string" &&
    isEventKind(candidate.eventKind) &&
    typeof candidate.eventStatus === "string" &&
    isEventStatus(candidate.eventStatus)
  );
}

export function isEventPort(value: unknown): value is EventPort {
  return (
    value !== null &&
    typeof value === "object" &&
    typeof (value as EventPort).createEvent === "function" &&
    typeof (value as EventPort).resolveEvent === "function"
  );
}
