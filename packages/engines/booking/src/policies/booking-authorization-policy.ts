/**
 * Booking Authorization Policy — access decisions for Booking operations.
 * Does not execute domain lifecycle rules (confirm/cancel transitions stay in BookingService).
 *
 * @see DEC-BOOKING-AUTH-001
 */

export const BOOKING_AUTH_OPERATIONS = [
  "create",
  "confirm",
  "cancel",
  "reschedule",
  "expire",
  "read",
  "list",
  "checkAvailability",
] as const;

export type BookingAuthOperation = (typeof BOOKING_AUTH_OPERATIONS)[number];

/** Opaque action strings used when consulting the general AuthorizationService. */
export const BOOKING_AUTH_ACTIONS = {
  create: "booking.create",
  confirm: "booking.confirm",
  cancel: "booking.cancel",
  reschedule: "booking.reschedule",
  expire: "booking.expire",
  read: "booking.read",
  list: "booking.list",
  checkAvailability: "booking.availability.check",
} as const satisfies Record<BookingAuthOperation, string>;

export type BookingAuthAction =
  (typeof BOOKING_AUTH_ACTIONS)[BookingAuthOperation];

/**
 * Optional Booking aggregate snapshot for resource-scoped decisions.
 * Status is informational only — lifecycle eligibility is NOT decided here.
 */
export interface BookingAuthorizationResourceContext {
  bookingReference: string;
  ownerUserId: string;
  resourceId: string;
  /** Present for documentation / future ABAC — not used for domain transitions. */
  status?: string;
}

export interface BookingAuthorizationRequest {
  actorReference: string;
  operation: BookingAuthOperation;
  resourceType: string;
  resourceReference: string;
  metadata?: Record<string, unknown>;
  booking?: BookingAuthorizationResourceContext;
}

export interface BookingAuthorizationDecision {
  allowed: boolean;
  reason?: string;
  /** Mirrors general decision vocabulary without importing @motanos/permissions. */
  code: "Allowed" | "Denied";
  action: BookingAuthAction;
  operation: BookingAuthOperation;
}

/**
 * Port to the platform AuthorizationService — implemented by Runtime / Application adapters.
 * Keeps @motanos/booking free of a permissions package dependency.
 */
export interface BookingAuthorizationGateway {
  authorize(input: {
    actorReference: string;
    action: BookingAuthAction;
    resourceType: string;
    resourceReference: string;
    metadata?: Record<string, unknown>;
  }): Promise<{ allowed: boolean; reason?: string }>;
}

/**
 * Booking-specific authorization decision boundary.
 */
export interface BookingAuthorizationPolicy {
  decide(
    request: BookingAuthorizationRequest,
  ): Promise<BookingAuthorizationDecision>;
}

export function isBookingAuthOperation(
  value: string,
): value is BookingAuthOperation {
  return (BOOKING_AUTH_OPERATIONS as readonly string[]).includes(value);
}

export function bookingAuthActionFor(
  operation: BookingAuthOperation,
): BookingAuthAction {
  return BOOKING_AUTH_ACTIONS[operation];
}
