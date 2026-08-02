/**
 * @motanos/permissions — Authorization / Permissions foundation.
 *
 * Application → AuthorizationService → Domains / Engines
 *
 * Authorization answers: can this actor perform this action on this resource?
 * Authentication (who you are) stays outside this package.
 *
 * Official model: RBAC (docs/27 + DEC-002). Public contracts stay extensible
 * without implementing ABAC or domain action catalogs here.
 */

export const PERMISSIONS_LAYER = "@motanos/permissions" as const;

export type {
  ActorReference,
  AuthorizationContext,
  AuthorizationRequest,
  PermissionAction,
  PermissionActionCatalog,
  ResourceReference,
} from "./domain/permission";
export {
  toAuthorizationContext,
  toAuthorizationRequest,
} from "./domain/permission";

export type { PermissionPolicy } from "./domain/policy";

export type {
  AuthorizationDecision,
  AuthorizationDecisionKind,
} from "./contracts/decision";
export {
  AUTHORIZATION_DECISIONS,
  allow,
  deny,
  isAllowed,
  isDenied,
} from "./contracts/decision";

export type {
  AuthorizationResult,
  AuthorizeInput,
  CheckPermissionInput,
} from "./contracts/authorization";
export {
  authorizationResult,
  contextFromCheckInput,
} from "./contracts/authorization";

export type {
  AuthorizationPolicyRegistry,
  AuthorizationService,
  AuthorizationServiceLegacyInput,
  PermissionPolicyRegistry,
  PermissionService,
} from "./services/authorization-service";

/** Legacy / DEC-002 permission key model (Phase 2 foundation). */
export {
  PLATFORM_PERMISSION_KEYS,
  type Permission,
  type PermissionKey,
  type PlatformPermissionKey,
} from "./permissions";

export {
  filterOfficialRoles,
  hasAllRoles,
  hasAnyRole,
  hasRole,
  isClubAdmin,
  isPlatformAdmin,
  isStaffOrAbove,
} from "./rbac";

export {
  OFFICIAL_ROLES,
  PHASE2_FOCUS_ROLES,
  isOfficialRole,
  type OfficialRole,
  type Phase2FocusRole,
} from "./roles";
