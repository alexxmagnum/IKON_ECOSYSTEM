import type {
  CreateIdentityInput,
  Identity,
  IdentityKind,
  IdentityStatus,
} from "./identity";
import {
  IDENTITY_SCOPE_REF_KEY,
  IDENTITY_STATUSES,
  isIdentityKind,
  isIdentityStatus,
} from "./identity";

let identitySequence = 0;

export interface CreateIdentityOptions {
  /**
   * When set, identity may only be created for this scope
   * (cross-context isolation).
   */
  [IDENTITY_SCOPE_REF_KEY]?: string;
}

/**
 * Build a checked Identity (in-memory — actor existence only).
 * Does not sign in, register accounts, verify contacts, or assign access bands.
 */
export function createIdentity(
  input: CreateIdentityInput,
  options: CreateIdentityOptions = {},
): Identity {
  const scopeRaw = input[IDENTITY_SCOPE_REF_KEY];
  const scopeReference =
    typeof scopeRaw === "string" ? scopeRaw.trim() : undefined;
  const actorReference = input.actorReference?.trim();
  const organizationReference = input.organizationReference?.trim();
  const profileReference = input.profileReference?.trim();
  const externalReference = input.externalReference?.trim();
  const contextReference = input.contextReference?.trim();
  const parentIdentityReference = input.parentIdentityReference?.trim();
  const boundScopeRaw = options[IDENTITY_SCOPE_REF_KEY];
  const boundScope =
    typeof boundScopeRaw === "string"
      ? boundScopeRaw.trim() || undefined
      : undefined;

  if (!isIdentityKind(input.identityKind)) {
    throw new Error(`Unknown identity kind: ${String(input.identityKind)}`);
  }

  const identityStatus: IdentityStatus =
    input.identityStatus ?? IDENTITY_STATUSES.Draft;
  if (!isIdentityStatus(identityStatus)) {
    throw new Error(
      `Unknown identity status: ${String(input.identityStatus)}`,
    );
  }

  if (scopeRaw !== undefined && !scopeReference) {
    throw new Error(
      `${IDENTITY_SCOPE_REF_KEY} must not be empty when provided`,
    );
  }
  if (input.actorReference !== undefined && !actorReference) {
    throw new Error("actorReference must not be empty when provided");
  }
  if (input.organizationReference !== undefined && !organizationReference) {
    throw new Error("organizationReference must not be empty when provided");
  }
  if (input.profileReference !== undefined && !profileReference) {
    throw new Error("profileReference must not be empty when provided");
  }
  if (input.externalReference !== undefined && !externalReference) {
    throw new Error("externalReference must not be empty when provided");
  }
  if (input.contextReference !== undefined && !contextReference) {
    throw new Error("contextReference must not be empty when provided");
  }
  if (
    input.parentIdentityReference !== undefined &&
    !parentIdentityReference
  ) {
    throw new Error(
      "parentIdentityReference must not be empty when provided",
    );
  }

  if (
    boundScope !== undefined &&
    (scopeReference === undefined || scopeReference !== boundScope)
  ) {
    throw new Error("identity does not apply to this scope");
  }

  const providedReference = input.identityReference?.trim() ?? "";
  if (input.identityReference !== undefined && !providedReference) {
    throw new Error("identityReference must not be empty when provided");
  }

  const identityKind: IdentityKind = input.identityKind;
  const identityReference =
    providedReference || allocateIdentityReference();

  return {
    identityReference,
    identityKind,
    identityStatus,
    ...(scopeReference !== undefined && scopeReference.length > 0
      ? { [IDENTITY_SCOPE_REF_KEY]: scopeReference }
      : {}),
    ...(actorReference !== undefined && actorReference.length > 0
      ? { actorReference }
      : {}),
    ...(organizationReference !== undefined && organizationReference.length > 0
      ? { organizationReference }
      : {}),
    ...(profileReference !== undefined && profileReference.length > 0
      ? { profileReference }
      : {}),
    ...(externalReference !== undefined && externalReference.length > 0
      ? { externalReference }
      : {}),
    ...(contextReference !== undefined && contextReference.length > 0
      ? { contextReference }
      : {}),
    ...(parentIdentityReference !== undefined &&
    parentIdentityReference.length > 0
      ? { parentIdentityReference }
      : {}),
    ...(input.metadata !== undefined ? { metadata: input.metadata } : {}),
  };
}

function allocateIdentityReference(): string {
  identitySequence += 1;
  return `identity-${identitySequence}`;
}

/** Test helper — reset opaque id sequence. */
export function resetIdentityReferenceSequence(): void {
  identitySequence = 0;
}
