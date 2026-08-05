/**
 * Hospitality Table Interaction — customer actions within a table context.
 * Bridge only: Table Channel → Table Context → Table Interaction → Experience.
 *
 * Distinct from Order / Cart / Payment (future operational capabilities).
 *
 * @see DEC-HOSPITALITY-TABLE-INTERACTION-CONTEXT-001
 */

/** Internal table-interaction kinds — contextual actions, not orders. */
export const TABLE_INTERACTION_KINDS = {
  /** Discovery (events, club, activities). */
  Discovery: "interaction.discovery",
  /** Catalog interaction (open menu, explore products — no order yet). */
  Menu: "interaction.menu",
  /** Service request (attention, information). */
  Service: "interaction.service",
  /** Experience participation (activity, event). */
  Experience: "interaction.experience",
  /** Social / community interaction. */
  Community: "interaction.community",
  /** Internal MotanOS hospitality table interaction. */
  Internal: "interaction.internal",
} as const;

export type TableInteractionKind =
  (typeof TABLE_INTERACTION_KINDS)[keyof typeof TABLE_INTERACTION_KINDS];

export const TABLE_INTERACTION_KIND_VALUES = Object.values(
  TABLE_INTERACTION_KINDS,
) as readonly TableInteractionKind[];

/** Table-interaction lifecycle status (existence labels only — no order/cart ops). */
export const TABLE_INTERACTION_STATUSES = {
  Draft: "draft",
  Available: "available",
  Started: "started",
  Active: "active",
  Completed: "completed",
  Cancelled: "cancelled",
  Archived: "archived",
} as const;

export type TableInteractionStatus =
  (typeof TABLE_INTERACTION_STATUSES)[keyof typeof TABLE_INTERACTION_STATUSES];

export const TABLE_INTERACTION_STATUS_VALUES = Object.values(
  TABLE_INTERACTION_STATUSES,
) as readonly TableInteractionStatus[];

/**
 * Opaque hospitality table interaction — contextual action existence only.
 * Belongs to a table context; may reference channel / visit / experience.
 * No order, payment, cart, kitchen, or pricing payloads.
 */
export type HospitalityTableInteraction = {
  /** Opaque unique interaction reference. */
  interactionReference: string;
  /** Internal table-interaction kind. */
  interactionKind: TableInteractionKind;
  /** Table-interaction status. */
  interactionStatus: TableInteractionStatus;
  /** Opaque hospitality business pointer when known. */
  hospitalityReference?: string;
  /** Opaque table-channel pointer when known. */
  tableChannelReference?: string;
  /** Opaque table-context pointer when known. */
  tableContextReference?: string;
  /** Opaque visit-context pointer when known. */
  visitContextReference?: string;
  /** Opaque visit pointer when known. */
  visitReference?: string;
  /** Opaque actor pointer when known. */
  actorReference?: string;
  /** Opaque experience pointer when known. */
  experienceReference?: string;
  /** Opaque shared menu catalog pointer when known. */
  menuReference?: string;
  /** Opaque parent interaction pointer when nested. */
  parentInteractionReference?: string;
  /** Controlled optional metadata — never secrets or PII. */
  metadata?: Record<string, unknown>;
};

/**
 * Outbound port for future table-interaction adapters.
 * Not wired in this foundation — existence create/resolve only.
 */
export interface TableInteractionPort {
  createTableInteraction(
    input: CreateTableInteractionInput,
  ): Promise<HospitalityTableInteraction>;
  resolveTableInteraction(
    interaction: HospitalityTableInteraction,
  ): Promise<HospitalityTableInteraction>;
}

export type CreateTableInteractionInput = {
  interactionKind: TableInteractionKind;
  interactionStatus?: TableInteractionStatus;
  interactionReference?: string;
  hospitalityReference?: string;
  tableChannelReference?: string;
  tableContextReference?: string;
  visitContextReference?: string;
  visitReference?: string;
  actorReference?: string;
  experienceReference?: string;
  menuReference?: string;
  parentInteractionReference?: string;
  metadata?: Record<string, unknown>;
};

export function isTableInteractionKind(
  value: string,
): value is TableInteractionKind {
  return (TABLE_INTERACTION_KIND_VALUES as readonly string[]).includes(value);
}

export function isTableInteractionStatus(
  value: string,
): value is TableInteractionStatus {
  return (TABLE_INTERACTION_STATUS_VALUES as readonly string[]).includes(value);
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

export function isHospitalityTableInteraction(
  value: unknown,
): value is HospitalityTableInteraction {
  if (value === null || typeof value !== "object") {
    return false;
  }
  const candidate = value as Record<string, unknown>;
  return (
    typeof candidate.interactionReference === "string" &&
    candidate.interactionReference.length > 0 &&
    optionalOpaqueOk(candidate, "hospitalityReference") &&
    optionalOpaqueOk(candidate, "tableChannelReference") &&
    optionalOpaqueOk(candidate, "tableContextReference") &&
    optionalOpaqueOk(candidate, "visitContextReference") &&
    optionalOpaqueOk(candidate, "visitReference") &&
    optionalOpaqueOk(candidate, "actorReference") &&
    optionalOpaqueOk(candidate, "experienceReference") &&
    optionalOpaqueOk(candidate, "menuReference") &&
    optionalOpaqueOk(candidate, "parentInteractionReference") &&
    typeof candidate.interactionKind === "string" &&
    isTableInteractionKind(candidate.interactionKind) &&
    typeof candidate.interactionStatus === "string" &&
    isTableInteractionStatus(candidate.interactionStatus)
  );
}

export function isTableInteractionPort(
  value: unknown,
): value is TableInteractionPort {
  return (
    value !== null &&
    typeof value === "object" &&
    typeof (value as TableInteractionPort).createTableInteraction ===
      "function" &&
    typeof (value as TableInteractionPort).resolveTableInteraction ===
      "function"
  );
}
