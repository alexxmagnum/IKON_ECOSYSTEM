import type { ApiService } from "@motanos/api";
import type {
  ApplicationService,
  CreateBookingUseCase,
} from "@motanos/application";
import type { BookingService } from "@motanos/booking";
import type { AuthorizationService } from "@motanos/permissions";
import type { CreateBookingHandler } from "./create-booking-handler";

/**
 * Well-known composition tokens for MotanOS platform layers.
 */
export const RUNTIME_SERVICE_TOKENS = {
  application: "motanos.application" as const,
  api: "motanos.api" as const,
  authorization: "motanos.authorization" as const,
  booking: "motanos.booking" as const,
  createBooking: "motanos.application.createBooking" as const,
  createBookingHandler: "motanos.api.createBookingHandler" as const,
} as const;

/**
 * Typed service handles that may be attached to a runtime.
 */
export interface RuntimeServices {
  application?: ApplicationService;
  api?: ApiService;
  authorization?: AuthorizationService;
  booking?: BookingService;
  createBooking?: CreateBookingUseCase;
  createBookingHandler?: CreateBookingHandler;
}
