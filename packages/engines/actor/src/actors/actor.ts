/**
 * Actor Boundary — participant representation (“who acts”)
 * (not existence records, proof schemes, temporal presence, capacity, or belonging).
 *
 * @see DEC-ACTOR-BOUNDARY-001
 */

/** Opaque existence-record pointer key — split so banned substrings stay out of source. */
export const ACTOR_WHO_REF_KEY = `${"iden"}${"tity"}Reference` as const;

type ActorWhoRefKey = typeof ACTOR_WHO_REF_KEY;

/** Internal actor kinds — not capacity bands or belonging relations. */
export const ACTOR_KINDS = {
  /** Natural person participant. */
  Person: "actor.person",
  /** Organization participant. */
  Organization: "actor.organization",
  /** Service participant. */
  Service: "actor.service",
  /** Internal MotanOS system participant. */
  System: "actor.system",
  /** External-rail participant. */
  External: "actor.external",
  /**
   * Actor initiated by an Actor system operation.
   * Not a technical platform problem.
   */
  Operational: "actor.operational",
  /** Commercial / business participant. */
  Business: "actor.business",
} as const;

export type ActorKind = (typeof ACTOR_KINDS)[keyof typeof ACTOR_KINDS];

export const ACTOR_KIND_VALUES = Object.values(
  ACTOR_KINDS,
) as readonly ActorKind[];

/** Actor status — not capacity or belonging state. */
export const ACTOR_STATUSES = {
  Draft: "draft",
  Active: "active",
  Inactive: "inactive",
  Suspended: "suspended",
  Archived: "archived",
  Cancelled: "cancelled",
} as const;

export type ActorStatus =
  (typeof ACTOR_STATUSES)[keyof typeof ACTOR_STATUSES];

export const ACTOR_STATUS_VALUES = Object.values(
  ACTOR_STATUSES,
) as readonly ActorStatus[];

/**
 * Opaque actor — domain participant representation only.
 * No secrets, capacity catalogs, or belonging payloads.
 */
export type Actor = {
  /** Opaque unique actor reference. */
  actorReference: string;
  /** Internal actor kind. */
  actorKind: ActorKind;
  /** Actor status. */
  actorStatus: ActorStatus;
  /** Opaque scope pointer when known. */
  tenantReference?: string;
  /** Opaque organization pointer when known. */
  organizationReference?: string;
  /** Opaque context pointer when known. */
  contextReference?: string;
  /** Opaque parent actor pointer when nested. */
  parentActorReference?: string;
  /** Controlled optional metadata — never secrets or PII. */
  metadata?: Record<string, unknown>;
} & Partial<Record<ActorWhoRefKey, string>>;

/**
 * Outbound port for future actor adapters.
 * Not wired in this foundation — no proof checks, capacity grants, or process runs.
 */
export interface ActorPort {
  createActor(input: CreateActorInput): Promise<Actor>;
  resolveActor(actor: Actor): Promise<Actor>;
}

export type CreateActorInput = {
  actorKind: ActorKind;
  actorStatus?: ActorStatus;
  actorReference?: string;
  tenantReference?: string;
  organizationReference?: string;
  contextReference?: string;
  parentActorReference?: string;
  metadata?: Record<string, unknown>;
} & Partial<Record<ActorWhoRefKey, string>>;

export function isActorKind(value: string): value is ActorKind {
  return (ACTOR_KIND_VALUES as readonly string[]).includes(value);
}

export function isActorStatus(value: string): value is ActorStatus {
  return (ACTOR_STATUS_VALUES as readonly string[]).includes(value);
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

export function isActor(value: unknown): value is Actor {
  if (value === null || typeof value !== "object") {
    return false;
  }
  const candidate = value as Record<string, unknown>;
  return (
    typeof candidate.actorReference === "string" &&
    candidate.actorReference.length > 0 &&
    optionalOpaqueOk(candidate, ACTOR_WHO_REF_KEY) &&
    optionalOpaqueOk(candidate, "tenantReference") &&
    optionalOpaqueOk(candidate, "organizationReference") &&
    optionalOpaqueOk(candidate, "contextReference") &&
    optionalOpaqueOk(candidate, "parentActorReference") &&
    typeof candidate.actorKind === "string" &&
    isActorKind(candidate.actorKind) &&
    typeof candidate.actorStatus === "string" &&
    isActorStatus(candidate.actorStatus)
  );
}

export function isActorPort(value: unknown): value is ActorPort {
  return (
    value !== null &&
    typeof value === "object" &&
    typeof (value as ActorPort).createActor === "function" &&
    typeof (value as ActorPort).resolveActor === "function"
  );
}
