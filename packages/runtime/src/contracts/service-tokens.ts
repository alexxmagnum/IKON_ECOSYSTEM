import type { ApiService } from "@motanos/api";
import type {
  ApplicationService,
  CancelBookingUseCase,
  CheckAvailabilityUseCase,
  ConfirmBookingUseCase,
  CreateBookingUseCase,
  GetBookingUseCase,
  ListBookingsUseCase,
} from "@motanos/application";
import type { BookingService } from "@motanos/booking";
import type { AuthorizationService } from "@motanos/permissions";
import type {
  CancelBookingHandler,
  CheckAvailabilityHandler,
  ConfirmBookingHandler,
  CreateBookingHandler,
  GetBookingHandler,
  ListBookingsHandler,
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
  createBookingHandler: "motanos.api.createBookingHandler" as const,
  confirmBookingHandler: "motanos.api.confirmBookingHandler" as const,
  cancelBookingHandler: "motanos.api.cancelBookingHandler" as const,
  checkAvailabilityHandler: "motanos.api.checkAvailabilityHandler" as const,
  getBookingHandler: "motanos.api.getBookingHandler" as const,
  listBookingsHandler: "motanos.api.listBookingsHandler" as const,
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
  createBookingHandler?: CreateBookingHandler;
  confirmBookingHandler?: ConfirmBookingHandler;
  cancelBookingHandler?: CancelBookingHandler;
  checkAvailabilityHandler?: CheckAvailabilityHandler;
  getBookingHandler?: GetBookingHandler;
  listBookingsHandler?: ListBookingsHandler;
}
