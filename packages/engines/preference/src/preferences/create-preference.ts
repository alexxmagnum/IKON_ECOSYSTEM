import type {
  CreatePreferenceInput,
  Preference,
  PreferenceKind,
  PreferenceStatus,
} from "./preference";
import {
  PREFERENCE_STATUSES,
  isPreferenceKind,
  isPreferenceStatus,
} from "./preference";

let preferenceSequence = 0;

export interface CreatePreferenceOptions {
  /**
   * When set, preference may only be created for this tenant
   * (cross-tenant isolation).
   */
  tenantReference?: string;
}

/**
 * Build a checked Preference (in-memory — declared preference only).
 * Does not open vendor sessions or run learn / suggest / forecast flows.
 */
export function createPreference(
  input: CreatePreferenceInput,
  options: CreatePreferenceOptions = {},
): Preference {
  const tenantReference = input.tenantReference?.trim() ?? "";
  const actorReference = input.actorReference?.trim();
  const contextReference = input.contextReference?.trim();
  const categoryReference = input.categoryReference?.trim();
  const valueReference = input.valueReference?.trim();
  const sourceReference = input.sourceReference?.trim();
  const boundTenant = options.tenantReference?.trim() || undefined;

  if (!tenantReference) {
    throw new Error("tenantReference is required");
  }
  if (!isPreferenceKind(input.preferenceKind)) {
    throw new Error(
      `Unknown preference kind: ${String(input.preferenceKind)}`,
    );
  }

  const preferenceStatus: PreferenceStatus =
    input.preferenceStatus ?? PREFERENCE_STATUSES.Draft;
  if (!isPreferenceStatus(preferenceStatus)) {
    throw new Error(
      `Unknown preference status: ${String(input.preferenceStatus)}`,
    );
  }

  if (input.actorReference !== undefined && !actorReference) {
    throw new Error("actorReference must not be empty when provided");
  }
  if (input.contextReference !== undefined && !contextReference) {
    throw new Error("contextReference must not be empty when provided");
  }
  if (input.categoryReference !== undefined && !categoryReference) {
    throw new Error("categoryReference must not be empty when provided");
  }
  if (input.valueReference !== undefined && !valueReference) {
    throw new Error("valueReference must not be empty when provided");
  }
  if (input.sourceReference !== undefined && !sourceReference) {
    throw new Error("sourceReference must not be empty when provided");
  }

  if (boundTenant !== undefined && tenantReference !== boundTenant) {
    throw new Error("preference does not apply to this tenant");
  }

  const providedReference = input.preferenceReference?.trim() ?? "";
  if (input.preferenceReference !== undefined && !providedReference) {
    throw new Error("preferenceReference must not be empty when provided");
  }

  const preferenceKind: PreferenceKind = input.preferenceKind;
  const preferenceReference =
    providedReference || allocatePreferenceReference();

  return {
    preferenceReference,
    tenantReference,
    preferenceKind,
    preferenceStatus,
    ...(actorReference !== undefined && actorReference.length > 0
      ? { actorReference }
      : {}),
    ...(contextReference !== undefined && contextReference.length > 0
      ? { contextReference }
      : {}),
    ...(categoryReference !== undefined && categoryReference.length > 0
      ? { categoryReference }
      : {}),
    ...(valueReference !== undefined && valueReference.length > 0
      ? { valueReference }
      : {}),
    ...(sourceReference !== undefined && sourceReference.length > 0
      ? { sourceReference }
      : {}),
    ...(input.metadata !== undefined ? { metadata: input.metadata } : {}),
  };
}

function allocatePreferenceReference(): string {
  preferenceSequence += 1;
  return `preference-${preferenceSequence}`;
}

/** Test helper — reset opaque id sequence. */
export function resetPreferenceReferenceSequence(): void {
  preferenceSequence = 0;
}
