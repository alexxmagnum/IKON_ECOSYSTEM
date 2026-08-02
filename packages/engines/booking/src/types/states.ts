/**
 * BOOKING + RESOURCE lifecycle states from docs/rules/state-machines.md.
 * Do not invent statuses outside official SoT.
 */

/** Canonical BOOKING statuses (state-machines.md §1). */
export const BOOKING_STATUSES = [
  "Draft",
  "Pending",
  "Waitlisted",
  "PaymentPending",
  "Confirmed",
  "CheckedIn",
  "InProgress",
  "Completed",
  "Cancelled",
  "NoShow",
  "Expired",
] as const;

export type BookingStatus = (typeof BOOKING_STATUSES)[number];

/** Terminal BOOKING statuses. */
export const BOOKING_FINAL_STATUSES = [
  "Completed",
  "Cancelled",
  "NoShow",
  "Expired",
] as const satisfies readonly BookingStatus[];

export type BookingFinalStatus = (typeof BOOKING_FINAL_STATUSES)[number];

/**
 * Availability-blocking statuses (BR-0031 / state-machines.md).
 * These occupy the resource slot and must not overlap on the same resource.
 */
export const AVAILABILITY_BLOCKING_STATUSES = [
  "Draft",
  "Pending",
  "PaymentPending",
  "Confirmed",
  "CheckedIn",
  "InProgress",
] as const satisfies readonly BookingStatus[];

export type AvailabilityBlockingStatus =
  (typeof AVAILABILITY_BLOCKING_STATUSES)[number];

/** Non-blocking statuses (BR-0031). */
export const NON_BLOCKING_STATUSES = [
  "Waitlisted",
  "Completed",
  "Cancelled",
  "NoShow",
  "Expired",
] as const satisfies readonly BookingStatus[];

/**
 * Canonical BOOKING transition events (state-machines.md).
 * Used by future workflow implementations — not wired to persistence yet.
 */
export const BOOKING_EVENTS = [
  "booking.submitted",
  "booking.waitlist_joined",
  "booking.payment_required",
  "booking.confirmed_without_payment",
  "booking.hold_expired",
  "booking.cancelled_by_user",
  "booking.cancelled_by_system",
  "booking.cancelled_by_staff",
  "booking.confirmed",
  "booking.moved_to_waitlist",
  "booking.expired",
  "waitlist.offer_accepted_payment_required",
  "waitlist.offer_accepted",
  "waitlist.offer_expired",
  "waitlist.left",
  "payment.captured",
  "payment.failed",
  "payment.timeout",
  "booking.checked_in",
  "booking.marked_no_show",
  "booking.started",
  "booking.completed",
] as const;

export type BookingEvent = (typeof BOOKING_EVENTS)[number];

/** Valid (from → to) edges for the BOOKING machine. */
export const BOOKING_TRANSITIONS: ReadonlyArray<{
  from: BookingStatus;
  to: BookingStatus;
  event: BookingEvent;
}> = [
  { from: "Draft", to: "Pending", event: "booking.submitted" },
  { from: "Draft", to: "Waitlisted", event: "booking.waitlist_joined" },
  { from: "Draft", to: "PaymentPending", event: "booking.payment_required" },
  {
    from: "Draft",
    to: "Confirmed",
    event: "booking.confirmed_without_payment",
  },
  { from: "Draft", to: "Expired", event: "booking.hold_expired" },
  { from: "Draft", to: "Cancelled", event: "booking.cancelled_by_user" },
  { from: "Draft", to: "Cancelled", event: "booking.cancelled_by_system" },

  { from: "Pending", to: "PaymentPending", event: "booking.payment_required" },
  { from: "Pending", to: "Confirmed", event: "booking.confirmed" },
  { from: "Pending", to: "Waitlisted", event: "booking.moved_to_waitlist" },
  { from: "Pending", to: "Cancelled", event: "booking.cancelled_by_user" },
  { from: "Pending", to: "Cancelled", event: "booking.cancelled_by_system" },
  { from: "Pending", to: "Cancelled", event: "booking.cancelled_by_staff" },
  { from: "Pending", to: "Expired", event: "booking.expired" },

  {
    from: "Waitlisted",
    to: "PaymentPending",
    event: "waitlist.offer_accepted_payment_required",
  },
  { from: "Waitlisted", to: "Confirmed", event: "waitlist.offer_accepted" },
  { from: "Waitlisted", to: "Expired", event: "waitlist.offer_expired" },
  { from: "Waitlisted", to: "Cancelled", event: "waitlist.left" },
  { from: "Waitlisted", to: "Cancelled", event: "booking.cancelled_by_user" },
  { from: "Waitlisted", to: "Cancelled", event: "booking.cancelled_by_system" },

  { from: "PaymentPending", to: "Confirmed", event: "payment.captured" },
  { from: "PaymentPending", to: "Cancelled", event: "payment.failed" },
  { from: "PaymentPending", to: "Cancelled", event: "payment.timeout" },
  { from: "PaymentPending", to: "Expired", event: "payment.timeout" },
  {
    from: "PaymentPending",
    to: "Cancelled",
    event: "booking.cancelled_by_user",
  },
  {
    from: "PaymentPending",
    to: "Cancelled",
    event: "booking.cancelled_by_system",
  },
  {
    from: "PaymentPending",
    to: "Cancelled",
    event: "booking.cancelled_by_staff",
  },

  { from: "Confirmed", to: "CheckedIn", event: "booking.checked_in" },
  { from: "Confirmed", to: "Cancelled", event: "booking.cancelled_by_user" },
  { from: "Confirmed", to: "Cancelled", event: "booking.cancelled_by_system" },
  { from: "Confirmed", to: "Cancelled", event: "booking.cancelled_by_staff" },
  { from: "Confirmed", to: "NoShow", event: "booking.marked_no_show" },

  { from: "CheckedIn", to: "InProgress", event: "booking.started" },
  { from: "CheckedIn", to: "Cancelled", event: "booking.cancelled_by_staff" },
  { from: "CheckedIn", to: "NoShow", event: "booking.marked_no_show" },

  { from: "InProgress", to: "Completed", event: "booking.completed" },
  { from: "InProgress", to: "Cancelled", event: "booking.cancelled_by_staff" },
];

/** RESOURCE operational statuses (state-machines.md Appendix A). */
export const RESOURCE_STATUSES = [
  "Available",
  "Reserved",
  "Occupied",
  "Blocked",
  "Maintenance",
  "OutOfService",
] as const;

export type ResourceStatus = (typeof RESOURCE_STATUSES)[number];

/** Default hold TTL minutes (BR-0037). Club-configurable later. */
export const DEFAULT_HOLD_TTL_MINUTES = 15 as const;

/** Default waitlist offer TTL minutes (BR-0035). Club-configurable later. */
export const DEFAULT_WAITLIST_OFFER_TTL_MINUTES = 15 as const;

export function isBookingStatus(value: string): value is BookingStatus {
  return (BOOKING_STATUSES as readonly string[]).includes(value);
}

export function isAvailabilityBlocking(
  status: BookingStatus,
): status is AvailabilityBlockingStatus {
  return (AVAILABILITY_BLOCKING_STATUSES as readonly BookingStatus[]).includes(
    status,
  );
}

export function isBookingFinal(status: BookingStatus): boolean {
  return (BOOKING_FINAL_STATUSES as readonly BookingStatus[]).includes(status);
}

/**
 * Statuses that may change time window without a status transition (interim).
 * Reschedule is not a SoT status edge — see DEC-BOOKING-RESCHEDULE-001.
 * Cancelled / final / CheckedIn / InProgress are rejected.
 */
export const RESCHEDULABLE_BOOKING_STATUSES = [
  "Draft",
  "Pending",
  "Waitlisted",
  "PaymentPending",
  "Confirmed",
] as const satisfies readonly BookingStatus[];

export type ReschedulableBookingStatus =
  (typeof RESCHEDULABLE_BOOKING_STATUSES)[number];

/**
 * Whether a booking may be rescheduled (time window update, BR-0033).
 * Does not invent SoT transitions — status is unchanged on success.
 */
export function canRescheduleBooking(status: BookingStatus): boolean {
  if (status === "Cancelled" || isBookingFinal(status)) {
    return false;
  }
  return (RESCHEDULABLE_BOOKING_STATUSES as readonly BookingStatus[]).includes(
    status,
  );
}

/**
 * Whether a Draft hold should expire at `now` (BR-0037).
 * Requires holdExpiresAt and Draft → Expired via booking.hold_expired.
 */
export function shouldExpireBookingHold(
  booking: {
    status: BookingStatus;
    holdExpiresAt?: string;
  },
  now: string,
): boolean {
  if (booking.status !== "Draft") {
    return false;
  }
  if (!booking.holdExpiresAt) {
    return false;
  }
  const expiresAt = Date.parse(booking.holdExpiresAt);
  const nowMs = Date.parse(now);
  if (Number.isNaN(expiresAt) || Number.isNaN(nowMs)) {
    return false;
  }
  if (expiresAt > nowMs) {
    return false;
  }
  return canTransitionBooking(
    booking.status,
    "Expired",
    "booking.hold_expired",
  );
}

/**
 * Returns whether a BOOKING transition is allowed for the given event.
 * Foundation helper — no side effects or persistence.
 */
export function canTransitionBooking(
  from: BookingStatus,
  to: BookingStatus,
  event: BookingEvent,
): boolean {
  if (isBookingFinal(from)) {
    return false;
  }

  return BOOKING_TRANSITIONS.some(
    (edge) => edge.from === from && edge.to === to && edge.event === event,
  );
}

/** Lists allowed target statuses from a given status (any matching event). */
export function allowedBookingTargets(
  from: BookingStatus,
): readonly BookingStatus[] {
  const targets = new Set<BookingStatus>();
  for (const edge of BOOKING_TRANSITIONS) {
    if (edge.from === from) {
      targets.add(edge.to);
    }
  }
  return [...targets];
}
