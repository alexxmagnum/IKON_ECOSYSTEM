/**
 * @motanos/identity — Identity Engine foundation.
 *
 * MotanOS Core → Shared Engines → @motanos/identity
 *
 * Identity = who the entity is (opaque reference).
 * Authentication / Profile / Membership / Community / Booking live elsewhere.
 *
 * Must not depend on auth packages, community, membership, booking,
 * experience, resource, commerce, or persistence vendors.
 *
 * @see DEC-IDENTITY-BOUNDARY-001
 */

export const IDENTITY_ENGINE = "@motanos/identity" as const;

export type {
  CreateIdentityInput,
  CreateIdentityOptions,
  Identity,
  IdentityKind,
  IdentityPort,
  IdentityStatus,
} from "./identities";
export {
  IDENTITY_KINDS,
  IDENTITY_KIND_VALUES,
  IDENTITY_STATUSES,
  IDENTITY_STATUS_VALUES,
  createIdentity,
  isIdentity,
  isIdentityKind,
  isIdentityPort,
  isIdentityStatus,
  resetIdentityReferenceSequence,
} from "./identities";
