import type {
  CreateIdentityInput,
  Identity,
  IdentityKind,
  IdentityStatus,
} from "./identity";
import {
  IDENTITY_STATUSES,
  isIdentityKind,
  isIdentityStatus,
} from "./identity";

let identitySequence = 0;

export interface CreateIdentityOptions {
  /**
   * When set, identity may only be created for this tenant
   * (cross-tenant isolation).
   */
  tenantReference?: string;
}

/**
 * Build a validated Identity (in-memory — definition only).
 * Does not sign in, register accounts, verify contacts, or assign roles.
 */
export function createIdentity(
  input: CreateIdentityInput,
  options: CreateIdentityOptions = {},
): Identity {
  const tenantReference = input.tenantReference?.trim() ?? "";
  const externalReference = input.externalReference?.trim();
  const ownerReference = input.ownerReference?.trim();
  const boundTenant = options.tenantReference?.trim() || undefined;

  if (!tenantReference) {
    throw new Error("tenantReference is required");
  }
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

  if (input.externalReference !== undefined && !externalReference) {
    throw new Error("externalReference must not be empty when provided");
  }
  if (input.ownerReference !== undefined && !ownerReference) {
    throw new Error("ownerReference must not be empty when provided");
  }

  if (boundTenant !== undefined && tenantReference !== boundTenant) {
    throw new Error("identity does not apply to this tenant");
  }

  const providedReference = input.identityReference?.trim() ?? "";
  if (input.identityReference !== undefined && !providedReference) {
    throw new Error("identityReference must not be empty when provided");
  }

  const identityKind: IdentityKind = input.identityKind;
  const identityReference = providedReference || allocateIdentityReference();

  return {
    identityReference,
    tenantReference,
    identityKind,
    identityStatus,
    ...(externalReference !== undefined && externalReference.length > 0
      ? { externalReference }
      : {}),
    ...(ownerReference !== undefined && ownerReference.length > 0
      ? { ownerReference }
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
