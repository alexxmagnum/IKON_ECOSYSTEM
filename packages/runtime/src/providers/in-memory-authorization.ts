import {
  allow,
  authorizationResult,
  deny,
  type AuthorizationContext,
  type AuthorizationService,
} from "@motanos/permissions-lifecycle";

export interface InMemoryAuthorizationOptions {
  /**
   * Actors that receive Denied for every authorize/check call.
   * Used for composition tests — not a real policy engine.
   */
  deniedActors?: readonly string[];
}

/**
 * Temporary in-memory AuthorizationService for composition bootstrap / tests.
 * Default: allow. Optional deny list by actorReference.
 * Not part of the public @motanos/runtime API.
 */
export function createInMemoryAuthorizationService(
  options: InMemoryAuthorizationOptions = {},
): AuthorizationService {
  const denied = new Set(options.deniedActors ?? []);

  async function decide(context: AuthorizationContext) {
    if (denied.has(context.actor)) {
      return authorizationResult(
        deny("actor is not permitted"),
        context,
      );
    }
    return authorizationResult(allow("permitted"), context);
  }

  return {
    check: decide,
    authorize: decide,
  };
}
