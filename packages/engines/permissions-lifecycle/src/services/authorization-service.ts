import type {
  AuthorizationResult,
  AuthorizeInput,
  CheckPermissionInput,
} from "../contracts/authorization";
import type { AuthorizationContext } from "../domain/permission";
import type { PermissionPolicy } from "../domain/policy";

/**
 * Authorization decision service.
 * Future Application use cases: UseCase → AuthorizationService.authorize → business logic.
 * No Auth, DB, row-security, or middleware in this package.
 */
export interface AuthorizationService {
  /**
   * Evaluate authorization and return an explicit Allowed | Denied decision.
   */
  check(context: AuthorizationContext): Promise<AuthorizationResult>;
  /**
   * Enforce authorization for an action. Implementations decide how Denied is surfaced
   * (result vs mapped application error) — not defined by infrastructure here.
   */
  authorize(context: AuthorizationContext): Promise<AuthorizationResult>;
}

/**
 * @deprecated Use AuthorizationService — same contract, clearer authorization naming.
 */
export type PermissionService = AuthorizationService;

/**
 * Optional registry of named policies for future composition.
 */
export interface AuthorizationPolicyRegistry {
  register(policy: PermissionPolicy): void;
  get(name: string): PermissionPolicy | undefined;
  list(): readonly PermissionPolicy[];
}

/**
 * @deprecated Use AuthorizationPolicyRegistry.
 */
export type PermissionPolicyRegistry = AuthorizationPolicyRegistry;

/**
 * Adapter for legacy CheckPermissionInput / AuthorizeInput call sites.
 */
export type AuthorizationServiceLegacyInput = CheckPermissionInput | AuthorizeInput;
