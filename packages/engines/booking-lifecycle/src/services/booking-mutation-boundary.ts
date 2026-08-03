import type { Booking } from "../domain/booking";
import type { BookingDomainEvent } from "../events";

/**
 * Booking Mutation Boundary — conceptual consistency unit (foundation).
 *
 * Coordinator: BookingService (via createBookingService).
 * Not a DB transaction, Unit of Work, Outbox, or EventBus.
 *
 * Ordered phases for every mutable operation
 * (create | confirm | cancel | reschedule | expire hold):
 *
 * 1. Domain validation (transitions, conflicts, eligibility)
 * 2. Aggregate state change (in-memory next Booking)
 * 3. Repository persistence (create / update) — must succeed
 * 4. Domain event production — only after persistence succeeds
 *
 * An operation is complete when persistence has succeeded and the
 * result (with optional events) is returned to the caller.
 * An event is valid only if it was produced after a successful persist
 * of the aggregate version that the event describes.
 *
 * @see DEC-BOOKING-TRANSACTION-001
 */

export type BookingMutationPhase =
  | "validate"
  | "mutate"
  | "persist"
  | "emit";

export interface BookingMutationCommitResult<
  TEvent extends BookingDomainEvent = BookingDomainEvent,
> {
  booking: Booking;
  events: TEvent[];
}

/**
 * Persist first, then produce events from the stored aggregate.
 * If `persist` throws, no events are produced.
 */
export async function commitBookingMutation<
  TEvent extends BookingDomainEvent = BookingDomainEvent,
>(
  persist: () => Promise<Booking>,
  produceEvents: (persisted: Booking) => TEvent | readonly TEvent[],
): Promise<BookingMutationCommitResult<TEvent>> {
  const booking = await persist();
  const produced = produceEvents(booking);
  const events = (Array.isArray(produced) ? produced : [produced]) as TEvent[];
  return { booking, events };
}
