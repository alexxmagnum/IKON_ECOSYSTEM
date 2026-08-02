/**
 * Application-layer action strings for booking orchestration.
 * Domain-agnostic PermissionAction values — not an official permissions catalog.
 */
export const CREATE_BOOKING_ACTION = "booking.create" as const;

export type CreateBookingAction = typeof CREATE_BOOKING_ACTION;
