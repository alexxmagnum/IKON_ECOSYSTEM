import type {
  CreateLocalizationInput,
  Localization,
  LocalizationKind,
  LocalizationStatus,
} from "./localization";
import {
  LOCALIZATION_STATUSES,
  isLocalizationKind,
  isLocalizationStatus,
} from "./localization";

let localizationSequence = 0;

export interface CreateLocalizationOptions {
  /**
   * When set, localization may only be created for this tenant
   * (cross-tenant isolation).
   */
  tenantReference?: string;
}

/**
 * Build a checked Localization (in-memory — linguistic reference only).
 * Does not open vendor sessions or produce copy bodies.
 */
export function createLocalization(
  input: CreateLocalizationInput,
  options: CreateLocalizationOptions = {},
): Localization {
  const tenantReference = input.tenantReference?.trim() ?? "";
  const localeReference = input.localeReference?.trim();
  const sourceReference = input.sourceReference?.trim();
  const targetReference = input.targetReference?.trim();
  const contextReference = input.contextReference?.trim();
  const ownerReference = input.ownerReference?.trim();
  const boundTenant = options.tenantReference?.trim() || undefined;

  if (!tenantReference) {
    throw new Error("tenantReference is required");
  }
  if (!isLocalizationKind(input.localizationKind)) {
    throw new Error(
      `Unknown localization kind: ${String(input.localizationKind)}`,
    );
  }

  const localizationStatus: LocalizationStatus =
    input.localizationStatus ?? LOCALIZATION_STATUSES.Draft;
  if (!isLocalizationStatus(localizationStatus)) {
    throw new Error(
      `Unknown localization status: ${String(input.localizationStatus)}`,
    );
  }

  if (input.localeReference !== undefined && !localeReference) {
    throw new Error("localeReference must not be empty when provided");
  }
  if (input.sourceReference !== undefined && !sourceReference) {
    throw new Error("sourceReference must not be empty when provided");
  }
  if (input.targetReference !== undefined && !targetReference) {
    throw new Error("targetReference must not be empty when provided");
  }
  if (input.contextReference !== undefined && !contextReference) {
    throw new Error("contextReference must not be empty when provided");
  }
  if (input.ownerReference !== undefined && !ownerReference) {
    throw new Error("ownerReference must not be empty when provided");
  }

  if (boundTenant !== undefined && tenantReference !== boundTenant) {
    throw new Error("localization does not apply to this tenant");
  }

  const providedReference = input.localizationReference?.trim() ?? "";
  if (input.localizationReference !== undefined && !providedReference) {
    throw new Error(
      "localizationReference must not be empty when provided",
    );
  }

  const localizationKind: LocalizationKind = input.localizationKind;
  const localizationReference =
    providedReference || allocateLocalizationReference();

  return {
    localizationReference,
    tenantReference,
    localizationKind,
    localizationStatus,
    ...(localeReference !== undefined && localeReference.length > 0
      ? { localeReference }
      : {}),
    ...(sourceReference !== undefined && sourceReference.length > 0
      ? { sourceReference }
      : {}),
    ...(targetReference !== undefined && targetReference.length > 0
      ? { targetReference }
      : {}),
    ...(contextReference !== undefined && contextReference.length > 0
      ? { contextReference }
      : {}),
    ...(ownerReference !== undefined && ownerReference.length > 0
      ? { ownerReference }
      : {}),
    ...(input.metadata !== undefined ? { metadata: input.metadata } : {}),
  };
}

function allocateLocalizationReference(): string {
  localizationSequence += 1;
  return `localization-${localizationSequence}`;
}

/** Test helper — reset opaque id sequence. */
export function resetLocalizationReferenceSequence(): void {
  localizationSequence = 0;
}
