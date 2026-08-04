import type {
  Actor,
  ActorKind,
  ActorStatus,
  CreateActorInput,
} from "./actor";
import {
  ACTOR_STATUSES,
  ACTOR_WHO_REF_KEY,
  isActorKind,
  isActorStatus,
} from "./actor";

let actorSequence = 0;

export interface CreateActorOptions {
  /**
   * When set, actor may only be created for this scope
   * (cross-context isolation).
   */
  tenantReference?: string;
}

/**
 * Build a checked Actor (in-memory — participant representation only).
 * Does not create existence records, prove who they are, open presence,
 * grant capacity, or run domain processes.
 */
export function createActor(
  input: CreateActorInput,
  options: CreateActorOptions = {},
): Actor {
  const whoRaw = input[ACTOR_WHO_REF_KEY];
  const whoReference =
    typeof whoRaw === "string" ? whoRaw.trim() : undefined;
  const tenantReference = input.tenantReference?.trim();
  const organizationReference = input.organizationReference?.trim();
  const contextReference = input.contextReference?.trim();
  const parentActorReference = input.parentActorReference?.trim();
  const boundScope = options.tenantReference?.trim() || undefined;

  if (!isActorKind(input.actorKind)) {
    throw new Error(`Unknown actor kind: ${String(input.actorKind)}`);
  }

  const actorStatus: ActorStatus =
    input.actorStatus ?? ACTOR_STATUSES.Draft;
  if (!isActorStatus(actorStatus)) {
    throw new Error(`Unknown actor status: ${String(input.actorStatus)}`);
  }

  if (whoRaw !== undefined && !whoReference) {
    throw new Error(
      `${ACTOR_WHO_REF_KEY} must not be empty when provided`,
    );
  }
  if (input.tenantReference !== undefined && !tenantReference) {
    throw new Error("tenantReference must not be empty when provided");
  }
  if (input.organizationReference !== undefined && !organizationReference) {
    throw new Error("organizationReference must not be empty when provided");
  }
  if (input.contextReference !== undefined && !contextReference) {
    throw new Error("contextReference must not be empty when provided");
  }
  if (input.parentActorReference !== undefined && !parentActorReference) {
    throw new Error("parentActorReference must not be empty when provided");
  }

  if (
    boundScope !== undefined &&
    (tenantReference === undefined || tenantReference !== boundScope)
  ) {
    throw new Error("actor does not apply to this scope");
  }

  const providedReference = input.actorReference?.trim() ?? "";
  if (input.actorReference !== undefined && !providedReference) {
    throw new Error("actorReference must not be empty when provided");
  }

  const actorKind: ActorKind = input.actorKind;
  const actorReference = providedReference || allocateActorReference();

  return {
    actorReference,
    actorKind,
    actorStatus,
    ...(whoReference !== undefined && whoReference.length > 0
      ? { [ACTOR_WHO_REF_KEY]: whoReference }
      : {}),
    ...(tenantReference !== undefined && tenantReference.length > 0
      ? { tenantReference }
      : {}),
    ...(organizationReference !== undefined && organizationReference.length > 0
      ? { organizationReference }
      : {}),
    ...(contextReference !== undefined && contextReference.length > 0
      ? { contextReference }
      : {}),
    ...(parentActorReference !== undefined && parentActorReference.length > 0
      ? { parentActorReference }
      : {}),
    ...(input.metadata !== undefined ? { metadata: input.metadata } : {}),
  };
}

function allocateActorReference(): string {
  actorSequence += 1;
  return `actor-${actorSequence}`;
}

/** Test helper — reset opaque id sequence. */
export function resetActorReferenceSequence(): void {
  actorSequence = 0;
}
