/**
 * Opaque actor identity for authorization checks.
 * Not a User / Member / Admin entity — Authentication remains separate.
 * Session → actor mapping happens outside this package.
 */
export type ActorReference = string;

/**
 * Free-form action name — domain-agnostic and extensible.
 * Domains may define their own typed catalogs without modifying this package:
 *
 * @example
 * // In a domain package (future):
 * export const MyDomainActions = {
 *   Create: "mydomain.create",
 *   Read: "mydomain.read",
 * } as const satisfies Record<string, PermissionAction>;
 *
 * Do not put vertical/business action catalogs in @motanos/permissions-lifecycle.
 */
export type PermissionAction = string;

/**
 * Marker for domain-owned action catalogs composed of PermissionAction values.
 * Enables typed catalogs outside this package without a closed enum here.
 */
export type PermissionActionCatalog = Readonly<Record<string, PermissionAction>>;

/**
 * Abstract resource target — domains supply type/reference vocabulary externally.
 */
export interface ResourceReference {
  resourceType: string;
  resourceReference: string;
  metadata?: Record<string, unknown>;
}

/**
 * Canonical authorization evaluation context.
 * Minimal: actor × action × resource (+ optional metadata).
 * No session, tenant, HTTP, JWT, or domain entities.
 */
export interface AuthorizationContext {
  actor: ActorReference;
  action: PermissionAction;
  resource: ResourceReference;
  metadata?: Record<string, unknown>;
}

/**
 * Legacy request shape (actorReference naming).
 * Prefer AuthorizationContext for new code.
 */
export interface AuthorizationRequest {
  actorReference: ActorReference;
  action: PermissionAction;
  resource: ResourceReference;
  metadata?: Record<string, unknown>;
}

export function toAuthorizationContext(
  request: AuthorizationRequest,
): AuthorizationContext {
  return {
    actor: request.actorReference,
    action: request.action,
    resource: request.resource,
    ...(request.metadata !== undefined ? { metadata: request.metadata } : {}),
  };
}

export function toAuthorizationRequest(
  context: AuthorizationContext,
): AuthorizationRequest {
  return {
    actorReference: context.actor,
    action: context.action,
    resource: context.resource,
    ...(context.metadata !== undefined ? { metadata: context.metadata } : {}),
  };
}
