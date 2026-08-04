/**
 * Hospitality Channel — access point from which a guest starts an experience.
 * Boundary only: Channel → Customer Experience → Hospitality capabilities.
 *
 * @see DEC-HOSPITALITY-CHANNEL-CONTEXT-001
 */

/** Internal channel kinds — entry contexts, not duplicated domain catalogs. */
export const CHANNEL_KINDS = {
  /** Public business web entry. */
  PublicWeb: "channel.public_web",
  /** Physical table entry context. */
  TableQr: "channel.table_qr",
  /** Staff / floor tools entry. */
  Staff: "channel.staff",
  /** Future physical terminal / kiosk entry. */
  Terminal: "channel.terminal",
  /** Internal MotanOS hospitality channel. */
  Internal: "channel.internal",
} as const;

export type ChannelKind =
  (typeof CHANNEL_KINDS)[keyof typeof CHANNEL_KINDS];

export const CHANNEL_KIND_VALUES = Object.values(
  CHANNEL_KINDS,
) as readonly ChannelKind[];

/** Channel lifecycle status (existence labels only — no runtime). */
export const CHANNEL_STATUSES = {
  Draft: "draft",
  Active: "active",
  Inactive: "inactive",
  Archived: "archived",
  Cancelled: "cancelled",
} as const;

export type ChannelStatus =
  (typeof CHANNEL_STATUSES)[keyof typeof CHANNEL_STATUSES];

export const CHANNEL_STATUS_VALUES = Object.values(
  CHANNEL_STATUSES,
) as readonly ChannelStatus[];

/**
 * Opaque hospitality channel — access-point existence only.
 * Consumes the single Hospitality domain; does not fork menus or capabilities.
 * No page render, code emit, till, sign-in, or duplicate catalog payloads.
 */
export type HospitalityChannel = {
  /** Opaque unique channel reference. */
  channelReference: string;
  /** Internal channel kind. */
  channelKind: ChannelKind;
  /** Channel status. */
  channelStatus: ChannelStatus;
  /** Opaque hospitality business pointer when known. */
  hospitalityReference?: string;
  /** Opaque ambit pointer when known. */
  contextReference?: string;
  /** Opaque table pointer when known (e.g. table entry). */
  tableReference?: string;
  /** Opaque customer-experience pointer when known. */
  experienceReference?: string;
  /** Opaque location pointer when known. */
  locationReference?: string;
  /** Opaque parent channel pointer when nested. */
  parentChannelReference?: string;
  /** Controlled optional metadata — never secrets or PII. */
  metadata?: Record<string, unknown>;
};

/**
 * Outbound port for future channel adapters.
 * Not wired in this foundation — existence create/resolve only.
 */
export interface ChannelPort {
  createChannel(input: CreateChannelInput): Promise<HospitalityChannel>;
  resolveChannel(channel: HospitalityChannel): Promise<HospitalityChannel>;
}

export type CreateChannelInput = {
  channelKind: ChannelKind;
  channelStatus?: ChannelStatus;
  channelReference?: string;
  hospitalityReference?: string;
  contextReference?: string;
  tableReference?: string;
  experienceReference?: string;
  locationReference?: string;
  parentChannelReference?: string;
  metadata?: Record<string, unknown>;
};

export function isChannelKind(value: string): value is ChannelKind {
  return (CHANNEL_KIND_VALUES as readonly string[]).includes(value);
}

export function isChannelStatus(value: string): value is ChannelStatus {
  return (CHANNEL_STATUS_VALUES as readonly string[]).includes(value);
}

function optionalOpaqueOk(
  candidate: Record<string, unknown>,
  key: string,
): boolean {
  const raw = candidate[key];
  return (
    raw === undefined || (typeof raw === "string" && raw.length > 0)
  );
}

export function isHospitalityChannel(
  value: unknown,
): value is HospitalityChannel {
  if (value === null || typeof value !== "object") {
    return false;
  }
  const candidate = value as Record<string, unknown>;
  return (
    typeof candidate.channelReference === "string" &&
    candidate.channelReference.length > 0 &&
    optionalOpaqueOk(candidate, "hospitalityReference") &&
    optionalOpaqueOk(candidate, "contextReference") &&
    optionalOpaqueOk(candidate, "tableReference") &&
    optionalOpaqueOk(candidate, "experienceReference") &&
    optionalOpaqueOk(candidate, "locationReference") &&
    optionalOpaqueOk(candidate, "parentChannelReference") &&
    typeof candidate.channelKind === "string" &&
    isChannelKind(candidate.channelKind) &&
    typeof candidate.channelStatus === "string" &&
    isChannelStatus(candidate.channelStatus)
  );
}

export function isChannelPort(value: unknown): value is ChannelPort {
  return (
    value !== null &&
    typeof value === "object" &&
    typeof (value as ChannelPort).createChannel === "function" &&
    typeof (value as ChannelPort).resolveChannel === "function"
  );
}
