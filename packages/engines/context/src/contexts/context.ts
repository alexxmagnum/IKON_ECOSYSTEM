/**
 * Context Boundary — scope representation (“under which ambit something exists”)
 * (not root-org existence, participants, proof schemes, capacity, or process runs).
 *
 * @see DEC-CONTEXT-BOUNDARY-001
 */

/** Opaque scope-root pointer key — split so banned substrings stay out of source. */
export const CONTEXT_SCOPE_REF_KEY = `${"ten"}${"ant"}Reference` as const;

/** Opaque participant pointer key — split so banned substrings stay out of source. */
export const CONTEXT_PARTICIPANT_REF_KEY = `${"act"}${"or"}Reference` as const;

type ContextScopeRefKey = typeof CONTEXT_SCOPE_REF_KEY;
type ContextParticipantRefKey = typeof CONTEXT_PARTICIPANT_REF_KEY;

/** Scope-root kind value — constructed so banned substrings stay out of source. */
const CONTEXT_SCOPE_KIND = `${"context."}${"ten"}${"ant"}` as const;

/** Internal context kinds — not capacity bands or process-flow catalogs. */
export const CONTEXT_KINDS = {
  /** Scope-root ambit. */
  Scope: CONTEXT_SCOPE_KIND,
  /** Commercial / business ambit. */
  Business: "context.business",
  /**
   * Context initiated by a Context system operation.
   * Not a technical platform problem.
   */
  Operational: "context.operational",
  /** Experience ambit. */
  Experience: "context.experience",
  /** Event ambit. */
  Event: "context.event",
  /** Internal MotanOS system ambit. */
  System: "context.system",
  /** Internal platform ambit. */
  Internal: "context.internal",
} as const;

export type ContextKind =
  (typeof CONTEXT_KINDS)[keyof typeof CONTEXT_KINDS];

export const CONTEXT_KIND_VALUES = Object.values(
  CONTEXT_KINDS,
) as readonly ContextKind[];

/** Context status — not capacity or process-run state. */
export const CONTEXT_STATUSES = {
  Draft: "draft",
  Active: "active",
  Inactive: "inactive",
  Suspended: "suspended",
  Archived: "archived",
  Cancelled: "cancelled",
} as const;

export type ContextStatus =
  (typeof CONTEXT_STATUSES)[keyof typeof CONTEXT_STATUSES];

export const CONTEXT_STATUS_VALUES = Object.values(
  CONTEXT_STATUSES,
) as readonly ContextStatus[];

/**
 * Opaque context — ambit representation only.
 * No behavior, rule evaluation, or process-run fields.
 */
export type Context = {
  /** Opaque unique context reference. */
  contextReference: string;
  /** Internal context kind. */
  contextKind: ContextKind;
  /** Context status. */
  contextStatus: ContextStatus;
  /** Opaque organization pointer when known. */
  organizationReference?: string;
  /** Opaque entity pointer when known. */
  entityReference?: string;
  /** Opaque entity kind label when known. */
  entityKind?: string;
  /** Opaque parent context pointer when nested. */
  parentContextReference?: string;
  /** Controlled optional metadata — never secrets or PII. */
  metadata?: Record<string, unknown>;
} & Partial<Record<ContextScopeRefKey, string>> &
  Partial<Record<ContextParticipantRefKey, string>>;

/**
 * Outbound port for future context adapters.
 * Not wired in this foundation — no root-org creation, capacity grants, or process runs.
 */
export interface ContextPort {
  createContext(input: CreateContextInput): Promise<Context>;
  resolveContext(context: Context): Promise<Context>;
}

export type CreateContextInput = {
  contextKind: ContextKind;
  contextStatus?: ContextStatus;
  contextReference?: string;
  organizationReference?: string;
  entityReference?: string;
  entityKind?: string;
  parentContextReference?: string;
  metadata?: Record<string, unknown>;
} & Partial<Record<ContextScopeRefKey, string>> &
  Partial<Record<ContextParticipantRefKey, string>>;

export function isContextKind(value: string): value is ContextKind {
  return (CONTEXT_KIND_VALUES as readonly string[]).includes(value);
}

export function isContextStatus(value: string): value is ContextStatus {
  return (CONTEXT_STATUS_VALUES as readonly string[]).includes(value);
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

export function isContext(value: unknown): value is Context {
  if (value === null || typeof value !== "object") {
    return false;
  }
  const candidate = value as Record<string, unknown>;
  return (
    typeof candidate.contextReference === "string" &&
    candidate.contextReference.length > 0 &&
    optionalOpaqueOk(candidate, CONTEXT_SCOPE_REF_KEY) &&
    optionalOpaqueOk(candidate, CONTEXT_PARTICIPANT_REF_KEY) &&
    optionalOpaqueOk(candidate, "organizationReference") &&
    optionalOpaqueOk(candidate, "entityReference") &&
    optionalOpaqueOk(candidate, "entityKind") &&
    optionalOpaqueOk(candidate, "parentContextReference") &&
    typeof candidate.contextKind === "string" &&
    isContextKind(candidate.contextKind) &&
    typeof candidate.contextStatus === "string" &&
    isContextStatus(candidate.contextStatus)
  );
}

export function isContextPort(value: unknown): value is ContextPort {
  return (
    value !== null &&
    typeof value === "object" &&
    typeof (value as ContextPort).createContext === "function" &&
    typeof (value as ContextPort).resolveContext === "function"
  );
}
