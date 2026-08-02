import type {
  BookingQueryService,
  BookingRepository,
  BookingService,
} from "@motanos/booking";
import {
  createBookingQueryService,
  createBookingService,
  createInMemoryBookingRepository,
} from "@motanos/booking";

/**
 * Runtime wiring: shared InMemory repository → command + query services.
 */
export function createInMemoryBookingService(): BookingService {
  return createBookingService(createInMemoryBookingRepository());
}

export function createInMemoryBookingStack(): {
  repository: BookingRepository;
  booking: BookingService;
  bookingQuery: BookingQueryService;
} {
  const repository = createInMemoryBookingRepository();
  const booking = createBookingService(repository);
  const bookingQuery = createBookingQueryService(repository);
  return { repository, booking, bookingQuery };
}
