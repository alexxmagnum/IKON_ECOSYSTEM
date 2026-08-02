/**
 * Application-layer action strings for booking orchestration.
 * Sourced from Booking Authorization Policy action catalog.
 */
import { BOOKING_AUTH_ACTIONS } from "@motanos/booking";

export const CREATE_BOOKING_ACTION = BOOKING_AUTH_ACTIONS.create;
export const CONFIRM_BOOKING_ACTION = BOOKING_AUTH_ACTIONS.confirm;
export const CANCEL_BOOKING_ACTION = BOOKING_AUTH_ACTIONS.cancel;
export const CHECK_AVAILABILITY_ACTION = BOOKING_AUTH_ACTIONS.checkAvailability;
export const READ_BOOKING_ACTION = BOOKING_AUTH_ACTIONS.read;
export const LIST_BOOKINGS_ACTION = BOOKING_AUTH_ACTIONS.list;
export const RESCHEDULE_BOOKING_ACTION = BOOKING_AUTH_ACTIONS.reschedule;
export const EXPIRE_BOOKING_HOLDS_ACTION = BOOKING_AUTH_ACTIONS.expire;

export type CreateBookingAction = typeof CREATE_BOOKING_ACTION;
export type ConfirmBookingAction = typeof CONFIRM_BOOKING_ACTION;
export type CancelBookingAction = typeof CANCEL_BOOKING_ACTION;
export type CheckAvailabilityAction = typeof CHECK_AVAILABILITY_ACTION;
export type ReadBookingAction = typeof READ_BOOKING_ACTION;
export type ListBookingsAction = typeof LIST_BOOKINGS_ACTION;
export type RescheduleBookingAction = typeof RESCHEDULE_BOOKING_ACTION;
export type ExpireBookingHoldsAction = typeof EXPIRE_BOOKING_HOLDS_ACTION;
