import type { AuthorizationContext } from "./permission";
import type { AuthorizationDecision } from "../contracts/decision";

/**
 * Abstract authorization policy (domain-agnostic).
 * Evaluates a canonical AuthorizationContext — no storage, session, or domain I/O.
 * Official MotanOS model remains RBAC (docs/27); this contract stays extensible
 * for future policy styles without embedding ABAC/attributes here.
 */
export interface PermissionPolicy {
  readonly name: string;
  can(
    context: AuthorizationContext,
  ): Promise<AuthorizationDecision> | AuthorizationDecision;
}
