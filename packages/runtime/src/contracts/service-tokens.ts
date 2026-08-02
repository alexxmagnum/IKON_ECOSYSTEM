import type { ApiService } from "@motanos/api";
import type {
  ApplicationService,
  CancelBookingUseCase,
  ConfirmBookingUseCase,
  CreateBookingUseCase,
} from "@motanos/application";
import type { BookingService } from "@motanos/booking";
import type { AuthorizationService } from "@motanos/permissions";
import type {
  CancelBookingHandler,
  ConfirmBookingHandler,
  CreateBookingHandler,
} from "./create-booking-handler";

export const RUNTIME_SERVICE_TOKENS = {
  application: "motanos.application" as const,
  api: "motanos.api" as const,
  authorization: "motanos.authorization" as const,
  booking: "motanos.booking" as const,
  createBooking: "motanos.application.createBooking" as const,
  confirmBooking: "motanos.application.confirmBooking" as const,
  cancelBooking: "motanos.application.cancelBooking" as const,
  createBookingHandler: "motanos.api.createBookingHandler" as const,
  confirmBookingHandler: "motanos.api.confirmBookingHandler" as const,
  cancelBookingHandler: "motanos.api.cancelBookingHandler" as const,
} as const;

export interface RuntimeServices {
  application?: ApplicationService;
  api?: ApiService;
  authorization?: AuthorizationService;
  booking?: BookingService;
  createBooking?: CreateBookingUseCase;
  confirmBooking?: ConfirmBookingUseCase;
  cancelBooking?: CancelBookingUseCase;
  createBookingHandler?: CreateBookingHandler;
  confirmBookingHandler?: ConfirmBookingHandler;
  cancelBookingHandler?: CancelBookingHandler;
}
