/**
 * Authorization decision outcomes.
 */
export const AUTHORIZATION_DECISIONS = ["Allowed", "Denied"] as const;

export type AuthorizationDecisionKind =
  (typeof AUTHORIZATION_DECISIONS)[number];

/**
 * Result of a permission check — data, not thrown exceptions.
 */
export interface AuthorizationDecision {
  decision: AuthorizationDecisionKind;
  reason?: string;
  metadata?: Record<string, unknown>;
}

export function isAllowed(decision: AuthorizationDecision): boolean {
  return decision.decision === "Allowed";
}

export function isDenied(decision: AuthorizationDecision): boolean {
  return decision.decision === "Denied";
}

export function allow(
  reason?: string,
  metadata?: Record<string, unknown>,
): AuthorizationDecision {
  return {
    decision: "Allowed",
    ...(reason !== undefined ? { reason } : {}),
    ...(metadata !== undefined ? { metadata } : {}),
  };
}

export function deny(
  reason?: string,
  metadata?: Record<string, unknown>,
): AuthorizationDecision {
  return {
    decision: "Denied",
    ...(reason !== undefined ? { reason } : {}),
    ...(metadata !== undefined ? { metadata } : {}),
  };
}
