import type {
  CreateRolloutInput,
  Rollout,
  RolloutKind,
  RolloutStatus,
} from "./rollout";
import {
  ROLLOUT_CAPACITY_REF_KEY,
  ROLLOUT_SETTINGS_REF_KEY,
  ROLLOUT_STATUSES,
  ROLLOUT_TRIAL_REF_KEY,
  isRolloutKind,
  isRolloutStatus,
} from "./rollout";

let rolloutSequence = 0;

export interface CreateRolloutOptions {
  /**
   * When set, rollout may only be created for this ambit
   * (cross-context isolation).
   */
  contextReference?: string;
}

/**
 * Build a checked Rollout (in-memory — distribution strategy existence only).
 * Does not distribute, publish versions, or open live distribution clients.
 */
export function createRollout(
  input: CreateRolloutInput,
  options: CreateRolloutOptions = {},
): Rollout {
  const contextReference = input.contextReference?.trim();
  const actorReference = input.actorReference?.trim();
  const entityReference = input.entityReference?.trim();
  const entityKind = input.entityKind?.trim();
  const capacityRaw = input[ROLLOUT_CAPACITY_REF_KEY];
  const capacityReference =
    typeof capacityRaw === "string" ? capacityRaw.trim() : undefined;
  const trialRaw = input[ROLLOUT_TRIAL_REF_KEY];
  const trialReference =
    typeof trialRaw === "string" ? trialRaw.trim() : undefined;
  const settingsRaw = input[ROLLOUT_SETTINGS_REF_KEY];
  const settingsReference =
    typeof settingsRaw === "string" ? settingsRaw.trim() : undefined;
  const scopeReference = input.scopeReference?.trim();
  const parentRolloutReference = input.parentRolloutReference?.trim();
  const boundContext = options.contextReference?.trim() || undefined;

  if (!isRolloutKind(input.rolloutKind)) {
    throw new Error(`Unknown rollout kind: ${String(input.rolloutKind)}`);
  }

  const rolloutStatus: RolloutStatus =
    input.rolloutStatus ?? ROLLOUT_STATUSES.Draft;
  if (!isRolloutStatus(rolloutStatus)) {
    throw new Error(`Unknown rollout status: ${String(input.rolloutStatus)}`);
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
  if (capacityRaw !== undefined && !capacityReference) {
    throw new Error(
      `${ROLLOUT_CAPACITY_REF_KEY} must not be empty when provided`,
    );
  }
  if (trialRaw !== undefined && !trialReference) {
    throw new Error(
      `${ROLLOUT_TRIAL_REF_KEY} must not be empty when provided`,
    );
  }
  if (settingsRaw !== undefined && !settingsReference) {
    throw new Error(
      `${ROLLOUT_SETTINGS_REF_KEY} must not be empty when provided`,
    );
  }
  if (input.scopeReference !== undefined && !scopeReference) {
    throw new Error("scopeReference must not be empty when provided");
  }
  if (
    input.parentRolloutReference !== undefined &&
    !parentRolloutReference
  ) {
    throw new Error(
      "parentRolloutReference must not be empty when provided",
    );
  }

  if (
    boundContext !== undefined &&
    (contextReference === undefined || contextReference !== boundContext)
  ) {
    throw new Error("rollout does not apply to this scope");
  }

  const providedReference = input.rolloutReference?.trim() ?? "";
  if (input.rolloutReference !== undefined && !providedReference) {
    throw new Error("rolloutReference must not be empty when provided");
  }

  const rolloutKind: RolloutKind = input.rolloutKind;
  const rolloutReference = providedReference || allocateRolloutReference();

  return {
    rolloutReference,
    rolloutKind,
    rolloutStatus,
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
    ...(capacityReference !== undefined && capacityReference.length > 0
      ? { [ROLLOUT_CAPACITY_REF_KEY]: capacityReference }
      : {}),
    ...(trialReference !== undefined && trialReference.length > 0
      ? { [ROLLOUT_TRIAL_REF_KEY]: trialReference }
      : {}),
    ...(settingsReference !== undefined && settingsReference.length > 0
      ? { [ROLLOUT_SETTINGS_REF_KEY]: settingsReference }
      : {}),
    ...(scopeReference !== undefined && scopeReference.length > 0
      ? { scopeReference }
      : {}),
    ...(parentRolloutReference !== undefined &&
    parentRolloutReference.length > 0
      ? { parentRolloutReference }
      : {}),
    ...(input.metadata !== undefined ? { metadata: input.metadata } : {}),
  };
}

function allocateRolloutReference(): string {
  rolloutSequence += 1;
  return `rollout-${rolloutSequence}`;
}

/** Test helper — reset opaque id sequence. */
export function resetRolloutReferenceSequence(): void {
  rolloutSequence = 0;
}
