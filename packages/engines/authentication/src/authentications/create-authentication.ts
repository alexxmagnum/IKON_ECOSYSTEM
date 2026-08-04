import type {
  Authentication,
  AuthenticationKind,
  AuthenticationStatus,
  CreateAuthenticationInput,
} from "./authentication";
import {
  AUTHENTICATION_PRESENCE_REF_KEY,
  AUTHENTICATION_RAIL_REF_KEY,
  AUTHENTICATION_SCOPE_REF_KEY,
  AUTHENTICATION_STATUSES,
  AUTHENTICATION_WHO_REF_KEY,
  isAuthenticationKind,
  isAuthenticationStatus,
} from "./authentication";

let authenticationSequence = 0;

export interface CreateAuthenticationOptions {
  /**
   * When set, authentication may only be created for this scope
   * (cross-context isolation).
   */
  [AUTHENTICATION_SCOPE_REF_KEY]?: string;
}

/**
 * Build a checked Authentication (in-memory — proof-scheme existence only).
 * Does not sign in, verify vault material, open presence, or wire rails.
 */
export function createAuthentication(
  input: CreateAuthenticationInput,
  options: CreateAuthenticationOptions = {},
): Authentication {
  const whoRaw = input[AUTHENTICATION_WHO_REF_KEY];
  const whoReference =
    typeof whoRaw === "string" ? whoRaw.trim() : undefined;
  const scopeRaw = input[AUTHENTICATION_SCOPE_REF_KEY];
  const scopeReference =
    typeof scopeRaw === "string" ? scopeRaw.trim() : undefined;
  const actorReference = input.actorReference?.trim();
  const methodReference = input.methodReference?.trim();
  const contextReference = input.contextReference?.trim();
  const presenceRaw = input[AUTHENTICATION_PRESENCE_REF_KEY];
  const presenceReference =
    typeof presenceRaw === "string" ? presenceRaw.trim() : undefined;
  const railRaw = input[AUTHENTICATION_RAIL_REF_KEY];
  const railReference =
    typeof railRaw === "string" ? railRaw.trim() : undefined;
  const parentAuthenticationReference =
    input.parentAuthenticationReference?.trim();
  const boundScopeRaw = options[AUTHENTICATION_SCOPE_REF_KEY];
  const boundScope =
    typeof boundScopeRaw === "string"
      ? boundScopeRaw.trim() || undefined
      : undefined;

  if (!isAuthenticationKind(input.authenticationKind)) {
    throw new Error(
      `Unknown authentication kind: ${String(input.authenticationKind)}`,
    );
  }

  const authenticationStatus: AuthenticationStatus =
    input.authenticationStatus ?? AUTHENTICATION_STATUSES.Draft;
  if (!isAuthenticationStatus(authenticationStatus)) {
    throw new Error(
      `Unknown authentication status: ${String(input.authenticationStatus)}`,
    );
  }

  if (whoRaw !== undefined && !whoReference) {
    throw new Error(
      `${AUTHENTICATION_WHO_REF_KEY} must not be empty when provided`,
    );
  }
  if (scopeRaw !== undefined && !scopeReference) {
    throw new Error(
      `${AUTHENTICATION_SCOPE_REF_KEY} must not be empty when provided`,
    );
  }
  if (input.actorReference !== undefined && !actorReference) {
    throw new Error("actorReference must not be empty when provided");
  }
  if (input.methodReference !== undefined && !methodReference) {
    throw new Error("methodReference must not be empty when provided");
  }
  if (input.contextReference !== undefined && !contextReference) {
    throw new Error("contextReference must not be empty when provided");
  }
  if (presenceRaw !== undefined && !presenceReference) {
    throw new Error(
      `${AUTHENTICATION_PRESENCE_REF_KEY} must not be empty when provided`,
    );
  }
  if (railRaw !== undefined && !railReference) {
    throw new Error(
      `${AUTHENTICATION_RAIL_REF_KEY} must not be empty when provided`,
    );
  }
  if (
    input.parentAuthenticationReference !== undefined &&
    !parentAuthenticationReference
  ) {
    throw new Error(
      "parentAuthenticationReference must not be empty when provided",
    );
  }

  if (
    boundScope !== undefined &&
    (scopeReference === undefined || scopeReference !== boundScope)
  ) {
    throw new Error("authentication does not apply to this scope");
  }

  const providedReference = input.authenticationReference?.trim() ?? "";
  if (input.authenticationReference !== undefined && !providedReference) {
    throw new Error(
      "authenticationReference must not be empty when provided",
    );
  }

  const authenticationKind: AuthenticationKind = input.authenticationKind;
  const authenticationReference =
    providedReference || allocateAuthenticationReference();

  return {
    authenticationReference,
    authenticationKind,
    authenticationStatus,
    ...(whoReference !== undefined && whoReference.length > 0
      ? { [AUTHENTICATION_WHO_REF_KEY]: whoReference }
      : {}),
    ...(scopeReference !== undefined && scopeReference.length > 0
      ? { [AUTHENTICATION_SCOPE_REF_KEY]: scopeReference }
      : {}),
    ...(actorReference !== undefined && actorReference.length > 0
      ? { actorReference }
      : {}),
    ...(methodReference !== undefined && methodReference.length > 0
      ? { methodReference }
      : {}),
    ...(contextReference !== undefined && contextReference.length > 0
      ? { contextReference }
      : {}),
    ...(presenceReference !== undefined && presenceReference.length > 0
      ? { [AUTHENTICATION_PRESENCE_REF_KEY]: presenceReference }
      : {}),
    ...(railReference !== undefined && railReference.length > 0
      ? { [AUTHENTICATION_RAIL_REF_KEY]: railReference }
      : {}),
    ...(parentAuthenticationReference !== undefined &&
    parentAuthenticationReference.length > 0
      ? { parentAuthenticationReference }
      : {}),
    ...(input.metadata !== undefined ? { metadata: input.metadata } : {}),
  };
}

function allocateAuthenticationReference(): string {
  authenticationSequence += 1;
  return `authentication-${authenticationSequence}`;
}

/** Test helper — reset opaque id sequence. */
export function resetAuthenticationReferenceSequence(): void {
  authenticationSequence = 0;
}
