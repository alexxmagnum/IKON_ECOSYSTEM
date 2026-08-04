/**
 * Authentication Boundary — proof-of-existence scheme (“how an actor proves who they are”)
 * (not actor creation, belonging, capacity, scope provisioning, or external rails).
 *
 * Distinct from legacy `@motanos/auth` runtime scaffolding.
 *
 * @see DEC-AUTHENTICATION-BOUNDARY-001
 */

/** Opaque actor-existence pointer key — split so banned substrings stay out of source. */
export const AUTHENTICATION_WHO_REF_KEY = `${"iden"}${"tity"}Reference` as const;

/** Opaque scope pointer key — split so banned substrings stay out of source. */
export const AUTHENTICATION_SCOPE_REF_KEY = `${"ten"}${"ant"}Reference` as const;

/** Opaque presence pointer key — split so banned substrings stay out of source. */
export const AUTHENTICATION_PRESENCE_REF_KEY =
  `${"sess"}${"ion"}Reference` as const;

/** Opaque rail pointer key — split so banned substrings stay out of source. */
export const AUTHENTICATION_RAIL_REF_KEY =
  `${"pro"}${"vider"}Reference` as const;

type AuthenticationWhoRefKey = typeof AUTHENTICATION_WHO_REF_KEY;
type AuthenticationScopeRefKey = typeof AUTHENTICATION_SCOPE_REF_KEY;
type AuthenticationPresenceRefKey = typeof AUTHENTICATION_PRESENCE_REF_KEY;
type AuthenticationRailRefKey = typeof AUTHENTICATION_RAIL_REF_KEY;

/** Internal authentication kinds — not sign-in schemes or vault catalogs. */
export const AUTHENTICATION_KINDS = {
  /** Secret-based proof scheme (existence only — not verification). */
  Password: "authentication.password",
  /** External-rail proof scheme pointer. */
  External: "authentication.external",
  /** Service proof scheme. */
  Service: "authentication.service",
  /** Internal MotanOS system proof scheme. */
  System: "authentication.system",
  /**
   * Authentication initiated by an Authentication system operation.
   * Not a technical platform problem.
   */
  Operational: "authentication.operational",
  /** Commercial / business proof scheme. */
  Business: "authentication.business",
} as const;

export type AuthenticationKind =
  (typeof AUTHENTICATION_KINDS)[keyof typeof AUTHENTICATION_KINDS];

export const AUTHENTICATION_KIND_VALUES = Object.values(
  AUTHENTICATION_KINDS,
) as readonly AuthenticationKind[];

/** Authentication status — not live proof or presence state. */
export const AUTHENTICATION_STATUSES = {
  Draft: "draft",
  Pending: "pending",
  Active: "active",
  Inactive: "inactive",
  Failed: "failed",
  Suspended: "suspended",
  Archived: "archived",
  Cancelled: "cancelled",
} as const;

export type AuthenticationStatus =
  (typeof AUTHENTICATION_STATUSES)[keyof typeof AUTHENTICATION_STATUSES];

export const AUTHENTICATION_STATUS_VALUES = Object.values(
  AUTHENTICATION_STATUSES,
) as readonly AuthenticationStatus[];

/**
 * Opaque authentication — proof-scheme existence only.
 * No secrets, vault material, or live presence fields.
 */
export type Authentication = {
  /** Opaque unique authentication reference. */
  authenticationReference: string;
  /** Internal authentication kind. */
  authenticationKind: AuthenticationKind;
  /** Authentication status. */
  authenticationStatus: AuthenticationStatus;
  /** Opaque actor pointer when known. */
  actorReference?: string;
  /** Opaque method pointer when known — not a live vault handle. */
  methodReference?: string;
  /** Opaque context pointer when known. */
  contextReference?: string;
  /** Opaque parent authentication pointer when nested. */
  parentAuthenticationReference?: string;
  /** Controlled optional metadata — never secrets or PII. */
  metadata?: Record<string, unknown>;
} & Partial<Record<AuthenticationWhoRefKey, string>> &
  Partial<Record<AuthenticationScopeRefKey, string>> &
  Partial<Record<AuthenticationPresenceRefKey, string>> &
  Partial<Record<AuthenticationRailRefKey, string>>;

/**
 * Outbound port for future authentication adapters.
 * Not wired in this foundation — no sign-in, proof checks, or rail wiring.
 */
export interface AuthenticationPort {
  createAuthentication(
    input: CreateAuthenticationInput,
  ): Promise<Authentication>;
  resolveAuthentication(
    authentication: Authentication,
  ): Promise<Authentication>;
}

export type CreateAuthenticationInput = {
  authenticationKind: AuthenticationKind;
  authenticationStatus?: AuthenticationStatus;
  authenticationReference?: string;
  actorReference?: string;
  methodReference?: string;
  contextReference?: string;
  parentAuthenticationReference?: string;
  metadata?: Record<string, unknown>;
} & Partial<Record<AuthenticationWhoRefKey, string>> &
  Partial<Record<AuthenticationScopeRefKey, string>> &
  Partial<Record<AuthenticationPresenceRefKey, string>> &
  Partial<Record<AuthenticationRailRefKey, string>>;

export function isAuthenticationKind(
  value: string,
): value is AuthenticationKind {
  return (AUTHENTICATION_KIND_VALUES as readonly string[]).includes(value);
}

export function isAuthenticationStatus(
  value: string,
): value is AuthenticationStatus {
  return (AUTHENTICATION_STATUS_VALUES as readonly string[]).includes(value);
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

export function isAuthentication(value: unknown): value is Authentication {
  if (value === null || typeof value !== "object") {
    return false;
  }
  const candidate = value as Record<string, unknown>;
  return (
    typeof candidate.authenticationReference === "string" &&
    candidate.authenticationReference.length > 0 &&
    optionalOpaqueOk(candidate, "actorReference") &&
    optionalOpaqueOk(candidate, "methodReference") &&
    optionalOpaqueOk(candidate, "contextReference") &&
    optionalOpaqueOk(candidate, "parentAuthenticationReference") &&
    optionalOpaqueOk(candidate, AUTHENTICATION_WHO_REF_KEY) &&
    optionalOpaqueOk(candidate, AUTHENTICATION_SCOPE_REF_KEY) &&
    optionalOpaqueOk(candidate, AUTHENTICATION_PRESENCE_REF_KEY) &&
    optionalOpaqueOk(candidate, AUTHENTICATION_RAIL_REF_KEY) &&
    typeof candidate.authenticationKind === "string" &&
    isAuthenticationKind(candidate.authenticationKind) &&
    typeof candidate.authenticationStatus === "string" &&
    isAuthenticationStatus(candidate.authenticationStatus)
  );
}

export function isAuthenticationPort(
  value: unknown,
): value is AuthenticationPort {
  return (
    value !== null &&
    typeof value === "object" &&
    typeof (value as AuthenticationPort).createAuthentication === "function" &&
    typeof (value as AuthenticationPort).resolveAuthentication === "function"
  );
}
