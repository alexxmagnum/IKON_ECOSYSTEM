/**
 * CreateBooking handler contract — not an HTTP route.
 * Maps API request → Application UseCase → API response.
 */
import type {
  ApiContext,
  CreateBookingRequest,
  CreateBookingResponse,
} from "@motanos/api";

export interface CreateBookingHandler {
  handle(
    request: CreateBookingRequest,
    context?: ApiContext,
  ): Promise<CreateBookingResponse>;
}
