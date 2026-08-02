/**
 * Identity Engine Boundary — conceptual identity reference in MotanOS
 * (not authentication, credentials, profiles, permissions, or providers).
 *
 * @see DEC-IDENTITY-BOUNDARY-001
 */

/** Internal identity kinds — not roles, membership tiers, or auth schemes. */
export const IDENTITY_KINDS = {
  /** Natural person identity. */
  Person: "identity.person",
  /** Organization / business identity. */
  Organization: "identity.organization",
  /** External service identity. */
  Service: "identity.service",
  /** Internal MotanOS system identity. */
  System: "identity.system",
  /**
   * Identity initiated by an Identity system operation.
   * Not a technical infrastructure error.
   */
  Operational: "identity.operational",
} as const;

export type IdentityKind =
  (typeof IDENTITY_KINDS)[keyof typeof IDENTITY_KINDS];

export const IDENTITY_KIND_VALUES = Object.values(
  IDENTITY_KINDS,
) as readonly IdentityKind[];

/** Identity definition status — not authentication or authorization state. */
export const IDENTITY_STATUSES = {
  Draft: "draft",
  Active: "active",
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
 * Opaque identity definition — "an entity exists in the ecosystem".
 * No secrets, credentials, or personally identifying payload fields.
 */
export interface Identity {
  /** Opaque unique identity reference. */
  identityReference: string;
  /** Explicit tenant scope — required. */
  tenantReference: string;
  /** Internal identity kind. */
  identityKind: IdentityKind;
  /** Identity definition status. */
  identityStatus: IdentityStatus;
  /** Opaque external system pointer — not a live provider session. */
  externalReference?: string;
  /** Opaque owner when known — not a live user profile. */
  ownerReference?: string;
  /** Controlled optional metadata — never secrets or PII. */
  metadata?: Record<string, unknown>;
}

/**
 * Outbound port for future identity adapters (Runtime).
 * Not wired in this foundation — no sign-in, registration, or providers.
 */
export interface IdentityPort {
  createIdentity(input: CreateIdentityInput): Promise<Identity>;
  resolveIdentity(identity: Identity): Promise<Identity>;
}

export interface CreateIdentityInput {
  tenantReference: string;
  identityKind: IdentityKind;
  identityStatus?: IdentityStatus;
  identityReference?: string;
  externalReference?: string;
  ownerReference?: string;
  metadata?: Record<string, unknown>;
}

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
  const externalOk =
    candidate.externalReference === undefined ||
    (typeof candidate.externalReference === "string" &&
      candidate.externalReference.length > 0);
  const ownerOk =
    candidate.ownerReference === undefined ||
    (typeof candidate.ownerReference === "string" &&
      candidate.ownerReference.length > 0);
  return (
    typeof candidate.identityReference === "string" &&
    candidate.identityReference.length > 0 &&
    typeof candidate.tenantReference === "string" &&
    candidate.tenantReference.length > 0 &&
    externalOk &&
    ownerOk &&
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
