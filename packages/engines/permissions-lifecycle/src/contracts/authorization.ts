import type {
  AuthorizationContext,
  AuthorizationRequest,
  PermissionAction,
  ResourceReference,
  ActorReference,
} from "../domain/permission";
import type { AuthorizationDecision } from "./decision";
import {
  toAuthorizationContext,
  toAuthorizationRequest,
} from "../domain/permission";

/**
 * API-oriented authorization contracts — no enforcement runtime yet.
 */

/**
 * @deprecated Prefer AuthorizationContext. Kept for callers using CheckPermissionInput.
 */
export interface CheckPermissionInput {
  actorReference: ActorReference;
  action: PermissionAction;
  resource: ResourceReference;
  metadata?: Record<string, unknown>;
}

/** @deprecated Prefer AuthorizationContext. */
export type AuthorizeInput = CheckPermissionInput;

export interface AuthorizationResult {
  decision: AuthorizationDecision;
  context: AuthorizationContext;
  /**
   * Legacy mirror of context (actorReference naming).
   * Prefer `context` for new code.
   */
  request: AuthorizationRequest;
}

export function authorizationResult(
  decision: AuthorizationDecision,
  context: AuthorizationContext,
): AuthorizationResult {
  return {
    decision,
    context,
    request: toAuthorizationRequest(context),
  };
}

export function contextFromCheckInput(
  input: CheckPermissionInput,
): AuthorizationContext {
  return toAuthorizationContext(input);
}

export type { AuthorizationRequest, AuthorizationContext };
