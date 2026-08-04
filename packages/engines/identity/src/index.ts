/**
 * @motanos/identity — Identity Boundary foundation.
 *
 * MotanOS Core → Shared packages → @motanos/identity
 *
 * Identity = actor existence (“who exists”).
 * Must not depend on sign-in packages, belonging packages, capacity packages,
 * scope packages, or external rails.
 *
 * @see DEC-IDENTITY-BOUNDARY-001
 */

export const IDENTITY_BOUNDARY = "@motanos/identity" as const;

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
  IDENTITY_SCOPE_REF_KEY,
  IDENTITY_STATUSES,
  IDENTITY_STATUS_VALUES,
  createIdentity,
  isIdentity,
  isIdentityKind,
  isIdentityPort,
  isIdentityStatus,
  resetIdentityReferenceSequence,
} from "./identities";
