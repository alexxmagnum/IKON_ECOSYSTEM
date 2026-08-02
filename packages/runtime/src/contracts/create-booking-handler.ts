/**
 * API handler contracts for booking lifecycle / availability — not HTTP routes.
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
