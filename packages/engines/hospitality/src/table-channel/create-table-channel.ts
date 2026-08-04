import type {
  CreateTableChannelInput,
  HospitalityTableChannel,
  TableChannelKind,
  TableChannelStatus,
} from "./table-channel";
import {
  TABLE_CHANNEL_STATUSES,
  isTableChannelKind,
  isTableChannelStatus,
} from "./table-channel";

let tableChannelSequence = 0;

export interface CreateTableChannelOptions {
  /**
   * When set, table channel may only be created for this hospitality business
   * (cross-business isolation).
   */
  hospitalityReference?: string;
}

/**
 * Build a checked HospitalityTableChannel (in-memory — access mode only).
 * Does not emit codes, open tickets, open tills, or fork catalogs.
 */
export function createTableChannel(
  input: CreateTableChannelInput,
  options: CreateTableChannelOptions = {},
): HospitalityTableChannel {
  const hospitalityReference = input.hospitalityReference?.trim();
  const tableContextReference = input.tableContextReference?.trim();
  const tableReference = input.tableReference?.trim();
  const visitContextReference = input.visitContextReference?.trim();
  const experienceReference = input.experienceReference?.trim();
  const menuReference = input.menuReference?.trim();
  const parentChannelReference = input.parentChannelReference?.trim();
  const boundHospitality = options.hospitalityReference?.trim() || undefined;

  if (!isTableChannelKind(input.channelKind)) {
    throw new Error(
      `Unknown table-channel kind: ${String(input.channelKind)}`,
    );
  }

  const channelStatus: TableChannelStatus =
    input.channelStatus ?? TABLE_CHANNEL_STATUSES.Draft;
  if (!isTableChannelStatus(channelStatus)) {
    throw new Error(
      `Unknown table-channel status: ${String(input.channelStatus)}`,
    );
  }

  if (input.hospitalityReference !== undefined && !hospitalityReference) {
    throw new Error(
      "hospitalityReference must not be empty when provided",
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
  if (input.tableReference !== undefined && !tableReference) {
    throw new Error("tableReference must not be empty when provided");
  }
  if (
    input.visitContextReference !== undefined &&
    !visitContextReference
  ) {
    throw new Error(
      "visitContextReference must not be empty when provided",
    );
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
    input.parentChannelReference !== undefined &&
    !parentChannelReference
  ) {
    throw new Error(
      "parentChannelReference must not be empty when provided",
    );
  }

  if (
    boundHospitality !== undefined &&
    (hospitalityReference === undefined ||
      hospitalityReference !== boundHospitality)
  ) {
    throw new Error(
      "table channel does not apply to this hospitality business",
    );
  }

  const providedReference = input.channelReference?.trim() ?? "";
  if (input.channelReference !== undefined && !providedReference) {
    throw new Error(
      "channelReference must not be empty when provided",
    );
  }

  const channelKind: TableChannelKind = input.channelKind;
  const channelReference =
    providedReference || allocateTableChannelReference();

  return {
    channelReference,
    channelKind,
    channelStatus,
    ...(hospitalityReference !== undefined && hospitalityReference.length > 0
      ? { hospitalityReference }
      : {}),
    ...(tableContextReference !== undefined &&
    tableContextReference.length > 0
      ? { tableContextReference }
      : {}),
    ...(tableReference !== undefined && tableReference.length > 0
      ? { tableReference }
      : {}),
    ...(visitContextReference !== undefined &&
    visitContextReference.length > 0
      ? { visitContextReference }
      : {}),
    ...(experienceReference !== undefined && experienceReference.length > 0
      ? { experienceReference }
      : {}),
    ...(menuReference !== undefined && menuReference.length > 0
      ? { menuReference }
      : {}),
    ...(parentChannelReference !== undefined &&
    parentChannelReference.length > 0
      ? { parentChannelReference }
      : {}),
    ...(input.metadata !== undefined ? { metadata: input.metadata } : {}),
  };
}

function allocateTableChannelReference(): string {
  tableChannelSequence += 1;
  return `table-channel-${tableChannelSequence}`;
}

/** Test helper — reset opaque id sequence. */
export function resetTableChannelReferenceSequence(): void {
  tableChannelSequence = 0;
}
