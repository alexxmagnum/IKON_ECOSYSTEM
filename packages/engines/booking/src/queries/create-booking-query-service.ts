import type {
  AvailabilityCheckInput,
  AvailabilityCheckResult,
  ListBookingsQuery,
} from "../contracts";
import type { BookingId } from "../domain/booking";
import { createBookingTenantContext } from "../context/booking-tenant-context";
import type { BookingRepository } from "../repositories/booking-repository";
import type { BookingQueryService } from "./booking-query-service";

/**
 * BookingQueryService over the shared BookingRepository (tenant-scoped).
 */
export function createBookingQueryService(
  repository: BookingRepository,
): BookingQueryService {
  return {
    async getBooking(tenantReference: string, bookingId: BookingId) {
      const tenant = createBookingTenantContext(tenantReference);
      return repository.getById(tenant, bookingId);
    },

    async listBookings(
      tenantReference: string,
      query: ListBookingsQuery = {},
    ) {
      const tenant = createBookingTenantContext(tenantReference);
      return repository.list(tenant, query);
    },

    async checkAvailability(
      input: AvailabilityCheckInput,
    ): Promise<AvailabilityCheckResult> {
      const tenant = createBookingTenantContext(input.tenantReference);
      const conflicts = await repository.findConflicts(tenant, {
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
