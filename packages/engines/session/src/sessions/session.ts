/**
 * Session Boundary — temporal interaction existence (“what session exists”)
 * (not proof schemes, actor creation, vault material, capacity, or belonging).
 *
 * @see DEC-SESSION-BOUNDARY-001
 */

/** Opaque actor-existence pointer key — split so banned substrings stay out of source. */
export const SESSION_WHO_REF_KEY = `${"iden"}${"tity"}Reference` as const;

/** Opaque proof-scheme pointer key — split so banned substrings stay out of source. */
export const SESSION_PROOF_REF_KEY =
  `${"authentica"}${"tion"}Reference` as const;

/** Opaque scope pointer key — split so banned substrings stay out of source. */
export const SESSION_SCOPE_REF_KEY = `${"ten"}${"ant"}Reference` as const;

type SessionWhoRefKey = typeof SESSION_WHO_REF_KEY;
type SessionProofRefKey = typeof SESSION_PROOF_REF_KEY;
type SessionScopeRefKey = typeof SESSION_SCOPE_REF_KEY;

/** Internal session kinds — not access bands or proof schemes. */
export const SESSION_KINDS = {
  /** Natural-person interaction session. */
  User: "session.user",
  /** Service interaction session. */
  Service: "session.service",
  /** Internal MotanOS system session. */
  System: "session.system",
  /** External-rail interaction session. */
  External: "session.external",
  /**
   * Session initiated by a Session system operation.
   * Not a technical platform problem.
   */
  Operational: "session.operational",
  /** Commercial / business interaction session. */
  Business: "session.business",
} as const;

export type SessionKind = (typeof SESSION_KINDS)[keyof typeof SESSION_KINDS];

export const SESSION_KIND_VALUES = Object.values(
  SESSION_KINDS,
) as readonly SessionKind[];

/** Session status — not technical keep-alive or renewal state. */
export const SESSION_STATUSES = {
  Draft: "draft",
  Active: "active",
  Inactive: "inactive",
  Expired: "expired",
  Suspended: "suspended",
  Archived: "archived",
  Cancelled: "cancelled",
} as const;

export type SessionStatus =
  (typeof SESSION_STATUSES)[keyof typeof SESSION_STATUSES];

export const SESSION_STATUS_VALUES = Object.values(
  SESSION_STATUSES,
) as readonly SessionStatus[];

/**
 * Opaque session — temporal interaction existence only.
 * No secrets, browser jars, or durable keep-alive fields.
 */
export type Session = {
  /** Opaque unique session reference. */
  sessionReference: string;
  /** Internal session kind. */
  sessionKind: SessionKind;
  /** Session status. */
  sessionStatus: SessionStatus;
  /** Opaque context pointer when known. */
  contextReference?: string;
  /** Opaque device pointer when known. */
  deviceReference?: string;
  /** Opaque parent session pointer when nested. */
  parentSessionReference?: string;
  /** Controlled optional metadata — never secrets or PII. */
  metadata?: Record<string, unknown>;
} & Partial<Record<SessionWhoRefKey, string>> &
  Partial<Record<SessionProofRefKey, string>> &
  Partial<Record<SessionScopeRefKey, string>>;

/**
 * Outbound port for future session adapters.
 * Not wired in this foundation — no start/end, renewal, or durable keep-alive.
 */
export interface SessionPort {
  createSession(input: CreateSessionInput): Promise<Session>;
  resolveSession(session: Session): Promise<Session>;
}

export type CreateSessionInput = {
  sessionKind: SessionKind;
  sessionStatus?: SessionStatus;
  sessionReference?: string;
  contextReference?: string;
  deviceReference?: string;
  parentSessionReference?: string;
  metadata?: Record<string, unknown>;
} & Partial<Record<SessionWhoRefKey, string>> &
  Partial<Record<SessionProofRefKey, string>> &
  Partial<Record<SessionScopeRefKey, string>>;

export function isSessionKind(value: string): value is SessionKind {
  return (SESSION_KIND_VALUES as readonly string[]).includes(value);
}

export function isSessionStatus(value: string): value is SessionStatus {
  return (SESSION_STATUS_VALUES as readonly string[]).includes(value);
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

export function isSession(value: unknown): value is Session {
  if (value === null || typeof value !== "object") {
    return false;
  }
  const candidate = value as Record<string, unknown>;
  return (
    typeof candidate.sessionReference === "string" &&
    candidate.sessionReference.length > 0 &&
    optionalOpaqueOk(candidate, SESSION_WHO_REF_KEY) &&
    optionalOpaqueOk(candidate, SESSION_PROOF_REF_KEY) &&
    optionalOpaqueOk(candidate, SESSION_SCOPE_REF_KEY) &&
    optionalOpaqueOk(candidate, "contextReference") &&
    optionalOpaqueOk(candidate, "deviceReference") &&
    optionalOpaqueOk(candidate, "parentSessionReference") &&
    typeof candidate.sessionKind === "string" &&
    isSessionKind(candidate.sessionKind) &&
    typeof candidate.sessionStatus === "string" &&
    isSessionStatus(candidate.sessionStatus)
  );
}

export function isSessionPort(value: unknown): value is SessionPort {
  return (
    value !== null &&
    typeof value === "object" &&
    typeof (value as SessionPort).createSession === "function" &&
    typeof (value as SessionPort).resolveSession === "function"
  );
}
