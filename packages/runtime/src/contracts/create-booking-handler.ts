/**
 * API handler contracts for booking lifecycle — not HTTP routes.
 */
import type {
  ApiContext,
  CancelBookingRequest,
  CancelBookingResponse,
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
