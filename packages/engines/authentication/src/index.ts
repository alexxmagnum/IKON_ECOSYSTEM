/**
 * @motanos/authentication — Authentication Boundary foundation.
 *
 * MotanOS Core → Shared packages → @motanos/authentication
 *
 * Authentication = how an actor proves who they are.
 * Must not depend on actor-existence packages, belonging packages,
 * capacity packages, scope packages, or external rails.
 *
 * Distinct from legacy `@motanos/auth` runtime scaffolding.
 *
 * @see DEC-AUTHENTICATION-BOUNDARY-001
 */

export const AUTHENTICATION_BOUNDARY = "@motanos/authentication" as const;

export type {
  CreateAuthenticationInput,
  CreateAuthenticationOptions,
  Authentication,
  AuthenticationKind,
  AuthenticationPort,
  AuthenticationStatus,
} from "./authentications";
export {
  AUTHENTICATION_KINDS,
  AUTHENTICATION_KIND_VALUES,
  AUTHENTICATION_PRESENCE_REF_KEY,
  AUTHENTICATION_RAIL_REF_KEY,
  AUTHENTICATION_SCOPE_REF_KEY,
  AUTHENTICATION_STATUSES,
  AUTHENTICATION_STATUS_VALUES,
  AUTHENTICATION_WHO_REF_KEY,
  createAuthentication,
  isAuthentication,
  isAuthenticationKind,
  isAuthenticationPort,
  isAuthenticationStatus,
  resetAuthenticationReferenceSequence,
} from "./authentications";
