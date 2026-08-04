/**
 * Hospitality Participation — person ↔ activity relation within a community.
 * Foundation: Community Member → Participation → Activity (existence only).
 *
 * @see DEC-HOSPITALITY-PARTICIPATION-CONTEXT-001
 */

/** Internal participation kinds — hospitality-scoped links, not tickets or holds. */
export const PARTICIPATION_KINDS = {
  /** Community member participation. */
  Member: "participation.member",
  /** Guest / visitor participation. */
  Guest: "participation.guest",
  /** Community-originated participation. */
  Community: "participation.community",
  /** Business-managed participation. */
  Business: "participation.business",
  /** Internal MotanOS hospitality participation. */
  Internal: "participation.internal",
} as const;

export type ParticipationKind =
  (typeof PARTICIPATION_KINDS)[keyof typeof PARTICIPATION_KINDS];

export const PARTICIPATION_KIND_VALUES = Object.values(
  PARTICIPATION_KINDS,
) as readonly ParticipationKind[];

/** Participation lifecycle status (existence labels only — no join runtime). */
export const PARTICIPATION_STATUSES = {
  Draft: "draft",
  Interested: "interested",
  Requested: "requested",
  Confirmed: "confirmed",
  Cancelled: "cancelled",
  Completed: "completed",
  Archived: "archived",
} as const;

export type ParticipationStatus =
  (typeof PARTICIPATION_STATUSES)[keyof typeof PARTICIPATION_STATUSES];

export const PARTICIPATION_STATUS_VALUES = Object.values(
  PARTICIPATION_STATUSES,
) as readonly ParticipationStatus[];

/**
 * Opaque hospitality participation — relation existence only.
 * No seat hold, till, door scan, badge, score, or alert payloads.
 */
export type HospitalityParticipation = {
  /** Opaque unique participation reference. */
  participationReference: string;
  /** Internal participation kind. */
  participationKind: ParticipationKind;
  /** Participation status. */
  participationStatus: ParticipationStatus;
  /** Opaque hospitality business pointer when known. */
  hospitalityReference?: string;
  /** Opaque community pointer when known. */
  communityReference?: string;
  /** Opaque activity pointer when known. */
  activityReference?: string;
  /** Opaque actor pointer when known. */
  actorReference?: string;
  /** Opaque member pointer when known. */
  memberReference?: string;
  /** Opaque reservation pointer when known. */
  reservationReference?: string;
  /** Opaque parent participation pointer when nested. */
  parentParticipationReference?: string;
  /** Controlled optional metadata — never secrets or PII. */
  metadata?: Record<string, unknown>;
};

/**
 * Outbound port for future participation adapters.
 * Not wired in this foundation — existence create/resolve only.
 */
export interface ParticipationPort {
  createParticipation(
    input: CreateParticipationInput,
  ): Promise<HospitalityParticipation>;
  resolveParticipation(
    participation: HospitalityParticipation,
  ): Promise<HospitalityParticipation>;
}

export type CreateParticipationInput = {
  participationKind: ParticipationKind;
  participationStatus?: ParticipationStatus;
  participationReference?: string;
  hospitalityReference?: string;
  communityReference?: string;
  activityReference?: string;
  actorReference?: string;
  memberReference?: string;
  reservationReference?: string;
  parentParticipationReference?: string;
  metadata?: Record<string, unknown>;
};

export function isParticipationKind(
  value: string,
): value is ParticipationKind {
  return (PARTICIPATION_KIND_VALUES as readonly string[]).includes(value);
}

export function isParticipationStatus(
  value: string,
): value is ParticipationStatus {
  return (PARTICIPATION_STATUS_VALUES as readonly string[]).includes(value);
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

export function isHospitalityParticipation(
  value: unknown,
): value is HospitalityParticipation {
  if (value === null || typeof value !== "object") {
    return false;
  }
  const candidate = value as Record<string, unknown>;
  return (
    typeof candidate.participationReference === "string" &&
    candidate.participationReference.length > 0 &&
    optionalOpaqueOk(candidate, "hospitalityReference") &&
    optionalOpaqueOk(candidate, "communityReference") &&
    optionalOpaqueOk(candidate, "activityReference") &&
    optionalOpaqueOk(candidate, "actorReference") &&
    optionalOpaqueOk(candidate, "memberReference") &&
    optionalOpaqueOk(candidate, "reservationReference") &&
    optionalOpaqueOk(candidate, "parentParticipationReference") &&
    typeof candidate.participationKind === "string" &&
    isParticipationKind(candidate.participationKind) &&
    typeof candidate.participationStatus === "string" &&
    isParticipationStatus(candidate.participationStatus)
  );
}

export function isParticipationPort(
  value: unknown,
): value is ParticipationPort {
  return (
    value !== null &&
    typeof value === "object" &&
    typeof (value as ParticipationPort).createParticipation ===
      "function" &&
    typeof (value as ParticipationPort).resolveParticipation ===
      "function"
  );
}
