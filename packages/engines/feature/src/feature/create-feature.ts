import type {
  CreateFeatureInput,
  Feature,
  FeatureKind,
  FeatureStatus,
} from "./feature";
import {
  FEATURE_SETTINGS_REF_KEY,
  FEATURE_STATUSES,
  isFeatureKind,
  isFeatureStatus,
} from "./feature";

let featureSequence = 0;

export interface CreateFeatureOptions {
  /**
   * When set, feature may only be created for this ambit
   * (cross-context isolation).
   */
  contextReference?: string;
}

/**
 * Build a checked Feature (in-memory — functional capacity existence only).
 * Does not activate capacities, switch clients, or open live trial suites.
 */
export function createFeature(
  input: CreateFeatureInput,
  options: CreateFeatureOptions = {},
): Feature {
  const contextReference = input.contextReference?.trim();
  const actorReference = input.actorReference?.trim();
  const entityReference = input.entityReference?.trim();
  const entityKind = input.entityKind?.trim();
  const settingsRaw = input[FEATURE_SETTINGS_REF_KEY];
  const settingsReference =
    typeof settingsRaw === "string" ? settingsRaw.trim() : undefined;
  const capabilityReference = input.capabilityReference?.trim();
  const parentFeatureReference = input.parentFeatureReference?.trim();
  const boundContext = options.contextReference?.trim() || undefined;

  if (!isFeatureKind(input.featureKind)) {
    throw new Error(`Unknown feature kind: ${String(input.featureKind)}`);
  }

  const featureStatus: FeatureStatus =
    input.featureStatus ?? FEATURE_STATUSES.Draft;
  if (!isFeatureStatus(featureStatus)) {
    throw new Error(`Unknown feature status: ${String(input.featureStatus)}`);
  }

  if (input.contextReference !== undefined && !contextReference) {
    throw new Error("contextReference must not be empty when provided");
  }
  if (input.actorReference !== undefined && !actorReference) {
    throw new Error("actorReference must not be empty when provided");
  }
  if (input.entityReference !== undefined && !entityReference) {
    throw new Error("entityReference must not be empty when provided");
  }
  if (input.entityKind !== undefined && !entityKind) {
    throw new Error("entityKind must not be empty when provided");
  }
  if (settingsRaw !== undefined && !settingsReference) {
    throw new Error(
      `${FEATURE_SETTINGS_REF_KEY} must not be empty when provided`,
    );
  }
  if (input.capabilityReference !== undefined && !capabilityReference) {
    throw new Error("capabilityReference must not be empty when provided");
  }
  if (
    input.parentFeatureReference !== undefined &&
    !parentFeatureReference
  ) {
    throw new Error(
      "parentFeatureReference must not be empty when provided",
    );
  }

  if (
    boundContext !== undefined &&
    (contextReference === undefined || contextReference !== boundContext)
  ) {
    throw new Error("feature does not apply to this scope");
  }

  const providedReference = input.featureReference?.trim() ?? "";
  if (input.featureReference !== undefined && !providedReference) {
    throw new Error("featureReference must not be empty when provided");
  }

  const featureKind: FeatureKind = input.featureKind;
  const featureReference = providedReference || allocateFeatureReference();

  return {
    featureReference,
    featureKind,
    featureStatus,
    ...(contextReference !== undefined && contextReference.length > 0
      ? { contextReference }
      : {}),
    ...(actorReference !== undefined && actorReference.length > 0
      ? { actorReference }
      : {}),
    ...(entityReference !== undefined && entityReference.length > 0
      ? { entityReference }
      : {}),
    ...(entityKind !== undefined && entityKind.length > 0
      ? { entityKind }
      : {}),
    ...(settingsReference !== undefined && settingsReference.length > 0
      ? { [FEATURE_SETTINGS_REF_KEY]: settingsReference }
      : {}),
    ...(capabilityReference !== undefined && capabilityReference.length > 0
      ? { capabilityReference }
      : {}),
    ...(parentFeatureReference !== undefined &&
    parentFeatureReference.length > 0
      ? { parentFeatureReference }
      : {}),
    ...(input.metadata !== undefined ? { metadata: input.metadata } : {}),
  };
}

function allocateFeatureReference(): string {
  featureSequence += 1;
  return `feature-${featureSequence}`;
}

/** Test helper — reset opaque id sequence. */
export function resetFeatureReferenceSequence(): void {
  featureSequence = 0;
}
