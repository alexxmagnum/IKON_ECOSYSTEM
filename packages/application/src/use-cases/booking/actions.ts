/**
 * Application-layer action strings for booking orchestration.
 * Domain-agnostic PermissionAction values — not an official permissions catalog.
 */
export const CREATE_BOOKING_ACTION = "booking.create" as const;
export const CONFIRM_BOOKING_ACTION = "booking.confirm" as const;
export const CANCEL_BOOKING_ACTION = "booking.cancel" as const;
export const CHECK_AVAILABILITY_ACTION = "booking.availability.check" as const;
export const READ_BOOKING_ACTION = "booking.read" as const;
export const LIST_BOOKINGS_ACTION = "booking.list" as const;
export const RESCHEDULE_BOOKING_ACTION = "booking.reschedule" as const;
export const EXPIRE_BOOKING_HOLDS_ACTION = "booking.expire" as const;

export type CreateBookingAction = typeof CREATE_BOOKING_ACTION;
export type ConfirmBookingAction = typeof CONFIRM_BOOKING_ACTION;
export type CancelBookingAction = typeof CANCEL_BOOKING_ACTION;
export type CheckAvailabilityAction = typeof CHECK_AVAILABILITY_ACTION;
export type ReadBookingAction = typeof READ_BOOKING_ACTION;
export type ListBookingsAction = typeof LIST_BOOKINGS_ACTION;
export type RescheduleBookingAction = typeof RESCHEDULE_BOOKING_ACTION;
export type ExpireBookingHoldsAction = typeof EXPIRE_BOOKING_HOLDS_ACTION;
