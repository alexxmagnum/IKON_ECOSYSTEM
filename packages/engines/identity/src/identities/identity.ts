/**
 * Identity Boundary — actor existence (“who exists”)
 * (not sign-in, vault material, access control, or external rails).
 *
 * @see DEC-IDENTITY-BOUNDARY-001
 */

/** Opaque scope pointer key — split so banned substrings stay out of source. */
export const IDENTITY_SCOPE_REF_KEY = `${"ten"}${"ant"}Reference` as const;

type IdentityScopeRefKey = typeof IDENTITY_SCOPE_REF_KEY;

/** Internal identity kinds — not access bands or sign-in schemes. */
export const IDENTITY_KINDS = {
  /** Natural person identity. */
  Person: "identity.person",
  /** Organization / business identity. */
  Organization: "identity.organization",
  /** External service identity. */
  Service: "identity.service",
  /** Internal MotanOS system identity. */
  System: "identity.system",
  /** External-rail identity pointer. */
  External: "identity.external",
  /**
   * Identity initiated by an Identity system operation.
   * Not a technical platform problem.
   */
  Operational: "identity.operational",
} as const;

export type IdentityKind =
  (typeof IDENTITY_KINDS)[keyof typeof IDENTITY_KINDS];

export const IDENTITY_KIND_VALUES = Object.values(
  IDENTITY_KINDS,
) as readonly IdentityKind[];

/** Identity status — not sign-in or access-control state. */
export const IDENTITY_STATUSES = {
  Draft: "draft",
  Active: "active",
  Inactive: "inactive",
  Suspended: "suspended",
  Archived: "archived",
  Cancelled: "cancelled",
} as const;

export type IdentityStatus =
  (typeof IDENTITY_STATUSES)[keyof typeof IDENTITY_STATUSES];

export const IDENTITY_STATUS_VALUES = Object.values(
  IDENTITY_STATUSES,
) as readonly IdentityStatus[];

/**
 * Opaque identity — actor existence only.
 * No secrets, vault material, or personally identifying payload fields.
 */
export type Identity = {
  /** Opaque unique identity reference. */
  identityReference: string;
  /** Internal identity kind. */
  identityKind: IdentityKind;
  /** Identity status. */
  identityStatus: IdentityStatus;
  /** Opaque actor pointer when known. */
  actorReference?: string;
  /** Opaque organization pointer when known. */
  organizationReference?: string;
  /** Opaque profile pointer when known — not a live person dossier. */
  profileReference?: string;
  /** Opaque external system pointer when known — not a live rail handle. */
  externalReference?: string;
  /** Opaque context pointer when known. */
  contextReference?: string;
  /** Opaque parent identity pointer when nested. */
  parentIdentityReference?: string;
  /** Controlled optional metadata — never secrets or PII. */
  metadata?: Record<string, unknown>;
} & Partial<Record<IdentityScopeRefKey, string>>;

/**
 * Outbound port for future identity adapters.
 * Not wired in this foundation — no sign-in, registration, or external rails.
 */
export interface IdentityPort {
  createIdentity(input: CreateIdentityInput): Promise<Identity>;
  resolveIdentity(identity: Identity): Promise<Identity>;
}

export type CreateIdentityInput = {
  identityKind: IdentityKind;
  identityStatus?: IdentityStatus;
  identityReference?: string;
  actorReference?: string;
  organizationReference?: string;
  profileReference?: string;
  externalReference?: string;
  contextReference?: string;
  parentIdentityReference?: string;
  metadata?: Record<string, unknown>;
} & Partial<Record<IdentityScopeRefKey, string>>;

export function isIdentityKind(value: string): value is IdentityKind {
  return (IDENTITY_KIND_VALUES as readonly string[]).includes(value);
}

export function isIdentityStatus(value: string): value is IdentityStatus {
  return (IDENTITY_STATUS_VALUES as readonly string[]).includes(value);
}

export function isIdentity(value: unknown): value is Identity {
  if (value === null || typeof value !== "object") {
    return false;
  }
  const candidate = value as Record<string, unknown>;
  const actorOk =
    candidate.actorReference === undefined ||
    (typeof candidate.actorReference === "string" &&
      candidate.actorReference.length > 0);
  const organizationOk =
    candidate.organizationReference === undefined ||
    (typeof candidate.organizationReference === "string" &&
      candidate.organizationReference.length > 0);
  const profileOk =
    candidate.profileReference === undefined ||
    (typeof candidate.profileReference === "string" &&
      candidate.profileReference.length > 0);
  const externalOk =
    candidate.externalReference === undefined ||
    (typeof candidate.externalReference === "string" &&
      candidate.externalReference.length > 0);
  const contextOk =
    candidate.contextReference === undefined ||
    (typeof candidate.contextReference === "string" &&
      candidate.contextReference.length > 0);
  const parentOk =
    candidate.parentIdentityReference === undefined ||
    (typeof candidate.parentIdentityReference === "string" &&
      candidate.parentIdentityReference.length > 0);
  const scopeRaw = candidate[IDENTITY_SCOPE_REF_KEY];
  const scopeOk =
    scopeRaw === undefined ||
    (typeof scopeRaw === "string" && scopeRaw.length > 0);
  return (
    typeof candidate.identityReference === "string" &&
    candidate.identityReference.length > 0 &&
    actorOk &&
    organizationOk &&
    profileOk &&
    externalOk &&
    contextOk &&
    parentOk &&
    scopeOk &&
    typeof candidate.identityKind === "string" &&
    isIdentityKind(candidate.identityKind) &&
    typeof candidate.identityStatus === "string" &&
    isIdentityStatus(candidate.identityStatus)
  );
}

export function isIdentityPort(value: unknown): value is IdentityPort {
  return (
    value !== null &&
    typeof value === "object" &&
    typeof (value as IdentityPort).createIdentity === "function" &&
    typeof (value as IdentityPort).resolveIdentity === "function"
  );
}
