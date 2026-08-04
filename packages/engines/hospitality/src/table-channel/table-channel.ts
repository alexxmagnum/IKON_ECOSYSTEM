/**
 * Hospitality Table Channel — access channel for a table experience.
 * Bridge only: Menu (shared) → Table Channel → Table Context → future ops.
 *
 * Distinct from HospitalityChannel (general entry under src/channels).
 * One menu catalog; channels differ — never fork qr/web menus.
 *
 * @see DEC-HOSPITALITY-TABLE-CHANNEL-CONTEXT-001
 */

/** Internal table-channel kinds — access modes, not forked catalogs. */
export const TABLE_CHANNEL_KINDS = {
  /** Public web access (discovery / info). */
  Public: "table-channel.public",
  /** Contextual table QR access (future ops). */
  Qr: "table-channel.qr",
  /** Staff / floor access. */
  Staff: "table-channel.staff",
  /** Internal MotanOS hospitality table channel. */
  Internal: "table-channel.internal",
} as const;

export type TableChannelKind =
  (typeof TABLE_CHANNEL_KINDS)[keyof typeof TABLE_CHANNEL_KINDS];

export const TABLE_CHANNEL_KIND_VALUES = Object.values(
  TABLE_CHANNEL_KINDS,
) as readonly TableChannelKind[];

/** Table-channel lifecycle status (existence labels only — no code emit). */
export const TABLE_CHANNEL_STATUSES = {
  Draft: "draft",
  Active: "active",
  Inactive: "inactive",
  Archived: "archived",
  Cancelled: "cancelled",
} as const;

export type TableChannelStatus =
  (typeof TABLE_CHANNEL_STATUSES)[keyof typeof TABLE_CHANNEL_STATUSES];

export const TABLE_CHANNEL_STATUS_VALUES = Object.values(
  TABLE_CHANNEL_STATUSES,
) as readonly TableChannelStatus[];

/**
 * Opaque hospitality table channel — access-mode existence only.
 * menuReference points at the shared hospitality catalog — never forked.
 * No till, ticket rails, prep rails, tariff, alert, or score payloads.
 */
export type HospitalityTableChannel = {
  /** Opaque unique channel reference. */
  channelReference: string;
  /** Internal table-channel kind. */
  channelKind: TableChannelKind;
  /** Table-channel status. */
  channelStatus: TableChannelStatus;
  /** Opaque hospitality business pointer when known. */
  hospitalityReference?: string;
  /** Opaque table-context pointer when known. */
  tableContextReference?: string;
  /** Opaque physical table pointer when known. */
  tableReference?: string;
  /** Opaque visit-context pointer when known. */
  visitContextReference?: string;
  /** Opaque experience pointer when known. */
  experienceReference?: string;
  /** Opaque shared menu catalog pointer when known. */
  menuReference?: string;
  /** Opaque parent channel pointer when nested. */
  parentChannelReference?: string;
  /** Controlled optional metadata — never secrets or PII. */
  metadata?: Record<string, unknown>;
};

/**
 * Outbound port for future table-channel adapters.
 * Not wired in this foundation — existence create/resolve only.
 */
export interface TableChannelPort {
  createTableChannel(
    input: CreateTableChannelInput,
  ): Promise<HospitalityTableChannel>;
  resolveTableChannel(
    channel: HospitalityTableChannel,
  ): Promise<HospitalityTableChannel>;
}

export type CreateTableChannelInput = {
  channelKind: TableChannelKind;
  channelStatus?: TableChannelStatus;
  channelReference?: string;
  hospitalityReference?: string;
  tableContextReference?: string;
  tableReference?: string;
  visitContextReference?: string;
  experienceReference?: string;
  menuReference?: string;
  parentChannelReference?: string;
  metadata?: Record<string, unknown>;
};

export function isTableChannelKind(value: string): value is TableChannelKind {
  return (TABLE_CHANNEL_KIND_VALUES as readonly string[]).includes(value);
}

export function isTableChannelStatus(
  value: string,
): value is TableChannelStatus {
  return (TABLE_CHANNEL_STATUS_VALUES as readonly string[]).includes(value);
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

export function isHospitalityTableChannel(
  value: unknown,
): value is HospitalityTableChannel {
  if (value === null || typeof value !== "object") {
    return false;
  }
  const candidate = value as Record<string, unknown>;
  return (
    typeof candidate.channelReference === "string" &&
    candidate.channelReference.length > 0 &&
    optionalOpaqueOk(candidate, "hospitalityReference") &&
    optionalOpaqueOk(candidate, "tableContextReference") &&
    optionalOpaqueOk(candidate, "tableReference") &&
    optionalOpaqueOk(candidate, "visitContextReference") &&
    optionalOpaqueOk(candidate, "experienceReference") &&
    optionalOpaqueOk(candidate, "menuReference") &&
    optionalOpaqueOk(candidate, "parentChannelReference") &&
    typeof candidate.channelKind === "string" &&
    isTableChannelKind(candidate.channelKind) &&
    typeof candidate.channelStatus === "string" &&
    isTableChannelStatus(candidate.channelStatus)
  );
}

export function isTableChannelPort(value: unknown): value is TableChannelPort {
  return (
    value !== null &&
    typeof value === "object" &&
    typeof (value as TableChannelPort).createTableChannel === "function" &&
    typeof (value as TableChannelPort).resolveTableChannel === "function"
  );
}
