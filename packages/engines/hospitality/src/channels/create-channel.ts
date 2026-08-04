import type {
  ChannelKind,
  ChannelStatus,
  CreateChannelInput,
  HospitalityChannel,
} from "./channel";
import {
  CHANNEL_STATUSES,
  isChannelKind,
  isChannelStatus,
} from "./channel";

let channelSequence = 0;

export interface CreateChannelOptions {
  /**
   * When set, channel may only be created for this hospitality business
   * (cross-business isolation).
   */
  hospitalityReference?: string;
}

/**
 * Build a checked HospitalityChannel (in-memory — access-point existence only).
 * Does not emit codes, render pages, open tills, or fork catalogs.
 */
export function createChannel(
  input: CreateChannelInput,
  options: CreateChannelOptions = {},
): HospitalityChannel {
  const hospitalityReference = input.hospitalityReference?.trim();
  const contextReference = input.contextReference?.trim();
  const tableReference = input.tableReference?.trim();
  const experienceReference = input.experienceReference?.trim();
  const locationReference = input.locationReference?.trim();
  const parentChannelReference = input.parentChannelReference?.trim();
  const boundHospitality = options.hospitalityReference?.trim() || undefined;

  if (!isChannelKind(input.channelKind)) {
    throw new Error(`Unknown channel kind: ${String(input.channelKind)}`);
  }

  const channelStatus: ChannelStatus =
    input.channelStatus ?? CHANNEL_STATUSES.Draft;
  if (!isChannelStatus(channelStatus)) {
    throw new Error(
      `Unknown channel status: ${String(input.channelStatus)}`,
    );
  }

  if (input.hospitalityReference !== undefined && !hospitalityReference) {
    throw new Error(
      "hospitalityReference must not be empty when provided",
    );
  }
  if (input.contextReference !== undefined && !contextReference) {
    throw new Error("contextReference must not be empty when provided");
  }
  if (input.tableReference !== undefined && !tableReference) {
    throw new Error("tableReference must not be empty when provided");
  }
  if (input.experienceReference !== undefined && !experienceReference) {
    throw new Error(
      "experienceReference must not be empty when provided",
    );
  }
  if (input.locationReference !== undefined && !locationReference) {
    throw new Error("locationReference must not be empty when provided");
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
      "channel does not apply to this hospitality business",
    );
  }

  const providedReference = input.channelReference?.trim() ?? "";
  if (input.channelReference !== undefined && !providedReference) {
    throw new Error(
      "channelReference must not be empty when provided",
    );
  }

  const channelKind: ChannelKind = input.channelKind;
  const channelReference =
    providedReference || allocateChannelReference();

  return {
    channelReference,
    channelKind,
    channelStatus,
    ...(hospitalityReference !== undefined && hospitalityReference.length > 0
      ? { hospitalityReference }
      : {}),
    ...(contextReference !== undefined && contextReference.length > 0
      ? { contextReference }
      : {}),
    ...(tableReference !== undefined && tableReference.length > 0
      ? { tableReference }
      : {}),
    ...(experienceReference !== undefined && experienceReference.length > 0
      ? { experienceReference }
      : {}),
    ...(locationReference !== undefined && locationReference.length > 0
      ? { locationReference }
      : {}),
    ...(parentChannelReference !== undefined &&
    parentChannelReference.length > 0
      ? { parentChannelReference }
      : {}),
    ...(input.metadata !== undefined ? { metadata: input.metadata } : {}),
  };
}

function allocateChannelReference(): string {
  channelSequence += 1;
  return `channel-${channelSequence}`;
}

/** Test helper — reset opaque id sequence. */
export function resetChannelReferenceSequence(): void {
  channelSequence = 0;
}
