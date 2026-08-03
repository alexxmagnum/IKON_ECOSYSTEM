import type { ApiService } from "@motanos/api";
import type {
  ApplicationService,
  CancelBookingUseCase,
  CheckAvailabilityUseCase,
  ConfirmBookingUseCase,
  CreateBookingUseCase,
  GetBookingUseCase,
  ListBookingsUseCase,
  RescheduleBookingUseCase,
  ExpireBookingHoldsUseCase,
} from "@motanos/application";
import type { BookingService } from "@motanos/booking-lifecycle";
import type { AuthorizationService } from "@motanos/permissions-lifecycle";
import type {
  CancelBookingHandler,
  CheckAvailabilityHandler,
  ConfirmBookingHandler,
  CreateBookingHandler,
  ExpireBookingHoldsHandler,
  GetBookingHandler,
  ListBookingsHandler,
  RescheduleBookingHandler,
} from "./create-booking-handler";

export const RUNTIME_SERVICE_TOKENS = {
  application: "motanos.application" as const,
  api: "motanos.api" as const,
  authorization: "motanos.authorization" as const,
  booking: "motanos.booking" as const,
  createBooking: "motanos.application.createBooking" as const,
  confirmBooking: "motanos.application.confirmBooking" as const,
  cancelBooking: "motanos.application.cancelBooking" as const,
  checkAvailability: "motanos.application.checkAvailability" as const,
  getBooking: "motanos.application.getBooking" as const,
  listBookings: "motanos.application.listBookings" as const,
  rescheduleBooking: "motanos.application.rescheduleBooking" as const,
  expireBookingHolds: "motanos.application.expireBookingHolds" as const,
  createBookingHandler: "motanos.api.createBookingHandler" as const,
  confirmBookingHandler: "motanos.api.confirmBookingHandler" as const,
  cancelBookingHandler: "motanos.api.cancelBookingHandler" as const,
  checkAvailabilityHandler: "motanos.api.checkAvailabilityHandler" as const,
  getBookingHandler: "motanos.api.getBookingHandler" as const,
  listBookingsHandler: "motanos.api.listBookingsHandler" as const,
  rescheduleBookingHandler: "motanos.api.rescheduleBookingHandler" as const,
  expireBookingHoldsHandler: "motanos.api.expireBookingHoldsHandler" as const,
} as const;

export interface RuntimeServices {
  application?: ApplicationService;
  api?: ApiService;
  authorization?: AuthorizationService;
  booking?: BookingService;
  createBooking?: CreateBookingUseCase;
  confirmBooking?: ConfirmBookingUseCase;
  cancelBooking?: CancelBookingUseCase;
  checkAvailability?: CheckAvailabilityUseCase;
  getBooking?: GetBookingUseCase;
  listBookings?: ListBookingsUseCase;
  rescheduleBooking?: RescheduleBookingUseCase;
  expireBookingHolds?: ExpireBookingHoldsUseCase;
  createBookingHandler?: CreateBookingHandler;
  confirmBookingHandler?: ConfirmBookingHandler;
  cancelBookingHandler?: CancelBookingHandler;
  checkAvailabilityHandler?: CheckAvailabilityHandler;
  getBookingHandler?: GetBookingHandler;
  listBookingsHandler?: ListBookingsHandler;
  rescheduleBookingHandler?: RescheduleBookingHandler;
  expireBookingHoldsHandler?: ExpireBookingHoldsHandler;
}
