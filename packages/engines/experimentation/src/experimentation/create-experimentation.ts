import type {
  CreateExperimentationInput,
  Experimentation,
  ExperimentationKind,
  ExperimentationStatus,
} from "./experimentation";
import {
  EXPERIMENTATION_SETTINGS_REF_KEY,
  EXPERIMENTATION_STATUSES,
  isExperimentationKind,
  isExperimentationStatus,
} from "./experimentation";

let experimentationSequence = 0;

export interface CreateExperimentationOptions {
  /**
   * When set, experimentation may only be created for this ambit
   * (cross-context isolation).
   */
  contextReference?: string;
}

/**
 * Build a checked Experimentation (in-memory — trial existence only).
 * Does not run trials, split users, or open live trial clients.
 */
export function createExperimentation(
  input: CreateExperimentationInput,
  options: CreateExperimentationOptions = {},
): Experimentation {
  const contextReference = input.contextReference?.trim();
  const actorReference = input.actorReference?.trim();
  const entityReference = input.entityReference?.trim();
  const entityKind = input.entityKind?.trim();
  const featureReference = input.featureReference?.trim();
  const settingsRaw = input[EXPERIMENTATION_SETTINGS_REF_KEY];
  const settingsReference =
    typeof settingsRaw === "string" ? settingsRaw.trim() : undefined;
  const hypothesisReference = input.hypothesisReference?.trim();
  const parentExperimentationReference =
    input.parentExperimentationReference?.trim();
  const boundContext = options.contextReference?.trim() || undefined;

  if (!isExperimentationKind(input.experimentationKind)) {
    throw new Error(
      `Unknown experimentation kind: ${String(input.experimentationKind)}`,
    );
  }

  const experimentationStatus: ExperimentationStatus =
    input.experimentationStatus ?? EXPERIMENTATION_STATUSES.Draft;
  if (!isExperimentationStatus(experimentationStatus)) {
    throw new Error(
      `Unknown experimentation status: ${String(input.experimentationStatus)}`,
    );
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
  if (input.featureReference !== undefined && !featureReference) {
    throw new Error("featureReference must not be empty when provided");
  }
  if (settingsRaw !== undefined && !settingsReference) {
    throw new Error(
      `${EXPERIMENTATION_SETTINGS_REF_KEY} must not be empty when provided`,
    );
  }
  if (input.hypothesisReference !== undefined && !hypothesisReference) {
    throw new Error("hypothesisReference must not be empty when provided");
  }
  if (
    input.parentExperimentationReference !== undefined &&
    !parentExperimentationReference
  ) {
    throw new Error(
      "parentExperimentationReference must not be empty when provided",
    );
  }

  if (
    boundContext !== undefined &&
    (contextReference === undefined || contextReference !== boundContext)
  ) {
    throw new Error("experimentation does not apply to this scope");
  }

  const providedReference = input.experimentationReference?.trim() ?? "";
  if (input.experimentationReference !== undefined && !providedReference) {
    throw new Error(
      "experimentationReference must not be empty when provided",
    );
  }

  const experimentationKind: ExperimentationKind = input.experimentationKind;
  const experimentationReference =
    providedReference || allocateExperimentationReference();

  return {
    experimentationReference,
    experimentationKind,
    experimentationStatus,
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
    ...(featureReference !== undefined && featureReference.length > 0
      ? { featureReference }
      : {}),
    ...(settingsReference !== undefined && settingsReference.length > 0
      ? { [EXPERIMENTATION_SETTINGS_REF_KEY]: settingsReference }
      : {}),
    ...(hypothesisReference !== undefined && hypothesisReference.length > 0
      ? { hypothesisReference }
      : {}),
    ...(parentExperimentationReference !== undefined &&
    parentExperimentationReference.length > 0
      ? { parentExperimentationReference }
      : {}),
    ...(input.metadata !== undefined ? { metadata: input.metadata } : {}),
  };
}

function allocateExperimentationReference(): string {
  experimentationSequence += 1;
  return `experimentation-${experimentationSequence}`;
}

/** Test helper — reset opaque id sequence. */
export function resetExperimentationReferenceSequence(): void {
  experimentationSequence = 0;
}
