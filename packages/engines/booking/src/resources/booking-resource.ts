/**
 * Booking Resource Boundary — reservable resource identity (not inventory CRUD).
 * Distinct from `domain/resource` aggregate helpers (`Resource` / `RESOURCE_TYPES`).
 *
 * @see DEC-BOOKING-RESOURCE-001
 */

/** Internal resource kinds — not restaurant/golf/hotel domain modules. */
export const BOOKING_RESOURCE_KINDS = {
  Table: "booking.table",
  Court: "booking.court",
  Room: "booking.room",
  Seat: "booking.seat",
  Equipment: "booking.equipment",
} as const;

export type BookingResourceKind =
  (typeof BOOKING_RESOURCE_KINDS)[keyof typeof BOOKING_RESOURCE_KINDS];

export const BOOKING_RESOURCE_KIND_VALUES = Object.values(
  BOOKING_RESOURCE_KINDS,
) as readonly BookingResourceKind[];

/**
 * Opaque identity of a reservable resource within Booking.
 * No inventory rows, ERP ids, or external facility payloads.
 */
export interface BookingResource {
  /** Opaque unique resource reference. */
  resourceReference: string;
  /** Explicit tenant scope. */
  tenantReference: string;
  /** Internal resource kind. */
  resourceKind: BookingResourceKind;
  /** Optional display label — never secrets or PII dumps. */
  resourceName?: string;
  /** Controlled optional metadata — never credentials. */
  metadata?: Record<string, unknown>;
}

/**
 * Outbound port for future resource providers (Runtime adapters).
 * Not wired in this foundation — no inventory SDK.
 */
export interface BookingResourcePort {
  getResource(input: {
    tenantReference: string;
    resourceReference: string;
  }): Promise<BookingResource | null>;
}

export interface CreateBookingResourceInput {
  tenantReference: string;
  resourceKind: BookingResourceKind;
  resourceReference?: string;
  resourceName?: string;
  metadata?: Record<string, unknown>;
}

export function isBookingResourceKind(
  value: string,
): value is BookingResourceKind {
  return (BOOKING_RESOURCE_KIND_VALUES as readonly string[]).includes(value);
}

export function isBookingResource(value: unknown): value is BookingResource {
  if (value === null || typeof value !== "object") {
    return false;
  }
  const candidate = value as Record<string, unknown>;
  const nameOk =
    candidate.resourceName === undefined ||
    (typeof candidate.resourceName === "string" &&
      candidate.resourceName.length > 0);
  return (
    typeof candidate.resourceReference === "string" &&
    candidate.resourceReference.length > 0 &&
    typeof candidate.tenantReference === "string" &&
    candidate.tenantReference.length > 0 &&
    typeof candidate.resourceKind === "string" &&
    isBookingResourceKind(candidate.resourceKind) &&
    nameOk
  );
}

export function isBookingResourcePort(
  value: unknown,
): value is BookingResourcePort {
  return (
    value !== null &&
    typeof value === "object" &&
    typeof (value as BookingResourcePort).getResource === "function"
  );
}
