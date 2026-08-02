import type {
  AvailabilityCheckInput,
  AvailabilityCheckResult,
  ListBookingsQuery,
} from "../contracts";
import type { BookingId } from "../domain/booking";
import type { BookingRepository } from "../repositories/booking-repository";
import type { BookingQueryService } from "./booking-query-service";

/**
 * BookingQueryService over the shared BookingRepository.
 * Same store as commands for now — no separate query repository (DEC-BOOKING-QUERY-002).
 */
export function createBookingQueryService(
  repository: BookingRepository,
): BookingQueryService {
  return {
    async getBooking(bookingId: BookingId) {
      return repository.getById(bookingId);
    },

    async listBookings(query: ListBookingsQuery = {}) {
      return repository.list(query);
    },

    async checkAvailability(
      input: AvailabilityCheckInput,
    ): Promise<AvailabilityCheckResult> {
      const conflicts = await repository.findConflicts({
        resourceId: input.resourceId,
        range: { startsAt: input.startsAt, endsAt: input.endsAt },
      });
      if (conflicts.length > 0) {
        return {
          available: false,
          reason: `overlap:${conflicts[0]!.id}`,
          resourceId: input.resourceId,
          startsAt: input.startsAt,
          endsAt: input.endsAt,
        };
      }
      return {
        available: true,
        resourceId: input.resourceId,
        startsAt: input.startsAt,
        endsAt: input.endsAt,
      };
    },
  };
}
