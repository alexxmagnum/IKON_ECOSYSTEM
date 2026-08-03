import type { Booking, BookingId } from "../domain/booking";
import type { ListBookingsQuery } from "../contracts";
import type { BookingTenantContext } from "../context/booking-tenant-context";
import {
  requireTenantReference,
  sameTenant,
} from "../context/booking-tenant-context";
import {
  bookingsConflict,
  intervalsOverlap,
} from "../domain/availability";
import type {
  BookingRepository,
  FindBookingConflictsQuery,
} from "./booking-repository";

/**
 * In-memory BookingRepository — tenant-scoped foundation adapter.
 */
export function createInMemoryBookingRepository(): BookingRepository {
  const bookings = new Map<string, Booking>();

  return {
    async create(tenant, booking) {
      const tenantReference = requireTenantReference(tenant);
      if (booking.tenantReference !== tenantReference) {
        throw new Error("Booking tenantReference does not match tenant context");
      }
      if (bookings.has(booking.id)) {
        throw new Error(`Booking already exists: ${booking.id}`);
      }
      const stored: Booking = { ...booking };
      bookings.set(stored.id, stored);
      return { ...stored };
    },

    async getById(tenant, bookingId) {
      const tenantReference = requireTenantReference(tenant);
      const booking = bookings.get(bookingId);
      if (!booking || booking.tenantReference !== tenantReference) {
        return null;
      }
      return { ...booking };
    },

    async list(tenant, query: ListBookingsQuery = {}) {
      const tenantReference = requireTenantReference(tenant);
      return [...bookings.values()]
        .filter((booking) => booking.tenantReference === tenantReference)
        .filter((booking) => matchesListQuery(booking, query))
        .map((booking) => ({ ...booking }));
    },

    async update(tenant, booking) {
      const tenantReference = requireTenantReference(tenant);
      if (booking.tenantReference !== tenantReference) {
        throw new Error("Booking tenantReference does not match tenant context");
      }
      const existing = bookings.get(booking.id);
      if (!existing || existing.tenantReference !== tenantReference) {
        throw new Error(`Booking not found: ${booking.id}`);
      }
      const stored: Booking = { ...booking };
      bookings.set(stored.id, stored);
      return { ...stored };
    },

    async findConflicts(tenant, query: FindBookingConflictsQuery) {
      const tenantReference = requireTenantReference(tenant);
      const probe: Booking = {
        id: query.excludeBookingId ?? "__conflict-probe__",
        tenantReference,
        resourceId: query.resourceId,
        ownerUserId: "__probe__",
        startsAt: query.range.startsAt,
        endsAt: query.range.endsAt,
        status: "Draft",
      };

      return [...bookings.values()]
        .filter((booking) => booking.tenantReference === tenantReference)
        .filter((booking) => {
          if (
            query.excludeBookingId !== undefined &&
            booking.id === query.excludeBookingId
          ) {
            return false;
          }
          return bookingsConflict(probe, booking);
        })
        .map((booking) => ({ ...booking }));
    },
  };
}

function matchesListQuery(
  booking: Booking,
  query: ListBookingsQuery,
): boolean {
  if (query.resourceId && booking.resourceId !== query.resourceId) {
    return false;
  }
  if (query.ownerUserId && booking.ownerUserId !== query.ownerUserId) {
    return false;
  }
  if (query.status) {
    const statuses = Array.isArray(query.status)
      ? query.status
      : [query.status];
    if (!statuses.includes(booking.status)) {
      return false;
    }
  }
  if (query.range && !intervalsOverlap(booking, query.range)) {
    return false;
  }
  return true;
}

/** Test helper — mutate holdExpiresAt within a tenant scope. */
export function patchInMemoryHoldExpiresAt(
  repository: BookingRepository,
  tenant: BookingTenantContext,
  bookingId: BookingId,
  holdExpiresAt: string,
): Promise<Booking | null> {
  return repository.getById(tenant, bookingId).then(async (booking) => {
    if (!booking) return null;
    if (!sameTenant(tenant, booking)) return null;
    return repository.update(tenant, { ...booking, holdExpiresAt });
  });
}
