import type {
  CreateTableInteractionInput,
  HospitalityTableInteraction,
  TableInteractionKind,
  TableInteractionStatus,
} from "./table-interaction";
import {
  TABLE_INTERACTION_STATUSES,
  isTableInteractionKind,
  isTableInteractionStatus,
} from "./table-interaction";

let tableInteractionSequence = 0;

export interface CreateTableInteractionOptions {
  /**
   * When set, table interaction may only be created for this hospitality business
   * (cross-business isolation).
   */
  hospitalityReference?: string;
}

/**
 * Build a checked HospitalityTableInteraction (in-memory — contextual action only).
 * Does not open carts, create orders, process payments, or call kitchen.
 */
export function createTableInteraction(
  input: CreateTableInteractionInput,
  options: CreateTableInteractionOptions = {},
): HospitalityTableInteraction {
  const hospitalityReference = input.hospitalityReference?.trim();
  const tableChannelReference = input.tableChannelReference?.trim();
  const tableContextReference = input.tableContextReference?.trim();
  const visitContextReference = input.visitContextReference?.trim();
  const visitReference = input.visitReference?.trim();
  const actorReference = input.actorReference?.trim();
  const experienceReference = input.experienceReference?.trim();
  const menuReference = input.menuReference?.trim();
  const parentInteractionReference =
    input.parentInteractionReference?.trim();
  const boundHospitality = options.hospitalityReference?.trim() || undefined;

  if (!isTableInteractionKind(input.interactionKind)) {
    throw new Error(
      `Unknown table-interaction kind: ${String(input.interactionKind)}`,
    );
  }

  const interactionStatus: TableInteractionStatus =
    input.interactionStatus ?? TABLE_INTERACTION_STATUSES.Draft;
  if (!isTableInteractionStatus(interactionStatus)) {
    throw new Error(
      `Unknown table-interaction status: ${String(input.interactionStatus)}`,
    );
  }

  if (input.hospitalityReference !== undefined && !hospitalityReference) {
    throw new Error(
      "hospitalityReference must not be empty when provided",
    );
  }
  if (
    input.tableChannelReference !== undefined &&
    !tableChannelReference
  ) {
    throw new Error(
      "tableChannelReference must not be empty when provided",
    );
  }
  if (
    input.tableContextReference !== undefined &&
    !tableContextReference
  ) {
    throw new Error(
      "tableContextReference must not be empty when provided",
    );
  }
  if (
    input.visitContextReference !== undefined &&
    !visitContextReference
  ) {
    throw new Error(
      "visitContextReference must not be empty when provided",
    );
  }
  if (input.visitReference !== undefined && !visitReference) {
    throw new Error("visitReference must not be empty when provided");
  }
  if (input.actorReference !== undefined && !actorReference) {
    throw new Error("actorReference must not be empty when provided");
  }
  if (input.experienceReference !== undefined && !experienceReference) {
    throw new Error(
      "experienceReference must not be empty when provided",
    );
  }
  if (input.menuReference !== undefined && !menuReference) {
    throw new Error("menuReference must not be empty when provided");
  }
  if (
    input.parentInteractionReference !== undefined &&
    !parentInteractionReference
  ) {
    throw new Error(
      "parentInteractionReference must not be empty when provided",
    );
  }

  if (
    boundHospitality !== undefined &&
    (hospitalityReference === undefined ||
      hospitalityReference !== boundHospitality)
  ) {
    throw new Error(
      "table interaction does not apply to this hospitality business",
    );
  }

  const providedReference = input.interactionReference?.trim() ?? "";
  if (input.interactionReference !== undefined && !providedReference) {
    throw new Error(
      "interactionReference must not be empty when provided",
    );
  }

  const interactionKind: TableInteractionKind = input.interactionKind;
  const interactionReference =
    providedReference || allocateTableInteractionReference();

  return {
    interactionReference,
    interactionKind,
    interactionStatus,
    ...(hospitalityReference !== undefined && hospitalityReference.length > 0
      ? { hospitalityReference }
      : {}),
    ...(tableChannelReference !== undefined &&
    tableChannelReference.length > 0
      ? { tableChannelReference }
      : {}),
    ...(tableContextReference !== undefined &&
    tableContextReference.length > 0
      ? { tableContextReference }
      : {}),
    ...(visitContextReference !== undefined &&
    visitContextReference.length > 0
      ? { visitContextReference }
      : {}),
    ...(visitReference !== undefined && visitReference.length > 0
      ? { visitReference }
      : {}),
    ...(actorReference !== undefined && actorReference.length > 0
      ? { actorReference }
      : {}),
    ...(experienceReference !== undefined && experienceReference.length > 0
      ? { experienceReference }
      : {}),
    ...(menuReference !== undefined && menuReference.length > 0
      ? { menuReference }
      : {}),
    ...(parentInteractionReference !== undefined &&
    parentInteractionReference.length > 0
      ? { parentInteractionReference }
      : {}),
    ...(input.metadata !== undefined ? { metadata: input.metadata } : {}),
  };
}

function allocateTableInteractionReference(): string {
  tableInteractionSequence += 1;
  return `table-interaction-${tableInteractionSequence}`;
}

/** Test helper — reset opaque id sequence. */
export function resetTableInteractionReferenceSequence(): void {
  tableInteractionSequence = 0;
}
