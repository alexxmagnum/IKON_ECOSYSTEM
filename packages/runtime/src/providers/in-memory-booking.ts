import type { BookingService } from "@motanos/booking";
import {
  createBookingService,
  createInMemoryBookingRepository,
} from "@motanos/booking";

/**
 * Runtime wiring: InMemoryBookingRepository → BookingService.
 * Storage lives in the repository adapter; service owns domain rules.
 */
export function createInMemoryBookingService(): BookingService {
  return createBookingService(createInMemoryBookingRepository());
}

export function createInMemoryBookingStack(): {
  repository: ReturnType<typeof createInMemoryBookingRepository>;
  booking: BookingService;
} {
  const repository = createInMemoryBookingRepository();
  const booking = createBookingService(repository);
  return { repository, booking };
}
