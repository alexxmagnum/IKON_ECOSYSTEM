/**
 * API handler contracts for booking operations — not HTTP routes.
 */
import type {
  ApiContext,
  CancelBookingRequest,
  CancelBookingResponse,
  CheckAvailabilityRequest,
  CheckAvailabilityResponse,
  ConfirmBookingRequest,
  ConfirmBookingResponse,
  CreateBookingRequest,
  CreateBookingResponse,
  GetBookingRequest,
  GetBookingResponse,
  ListBookingsRequest,
  ListBookingsResponse,
} from "@motanos/api";

export interface CreateBookingHandler {
  handle(
    request: CreateBookingRequest,
    context?: ApiContext,
  ): Promise<CreateBookingResponse>;
}

export interface ConfirmBookingHandler {
  handle(
    request: ConfirmBookingRequest,
    context?: ApiContext,
  ): Promise<ConfirmBookingResponse>;
}

export interface CancelBookingHandler {
  handle(
    request: CancelBookingRequest,
    context?: ApiContext,
  ): Promise<CancelBookingResponse>;
}

export interface CheckAvailabilityHandler {
  handle(
    request: CheckAvailabilityRequest,
    context?: ApiContext,
  ): Promise<CheckAvailabilityResponse>;
}

export interface GetBookingHandler {
  handle(
    request: GetBookingRequest,
    context?: ApiContext,
  ): Promise<GetBookingResponse>;
}

export interface ListBookingsHandler {
  handle(
    request: ListBookingsRequest,
    context?: ApiContext,
  ): Promise<ListBookingsResponse>;
}
