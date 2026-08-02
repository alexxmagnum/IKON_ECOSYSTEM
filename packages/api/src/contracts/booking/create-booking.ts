import type {
  CreateBookingInput,
  CreateBookingOutput,
} from "@motanos/application";
import type { ApiRequest } from "../request";
import type { ApiResponse } from "../response";

/**
 * External CreateBooking request (docs/25 envelope-compatible via ApiResponse).
 * API maps this to Application CreateBookingInput — no Booking engine types here.
 */
export interface CreateBookingRequest extends ApiRequest {
  resourceReference: string;
  customerReference: string;
  startAt: string;
  endAt: string;
  metadata?: Record<string, unknown>;
}

/** Success payload for CreateBooking API responses. */
export type CreateBookingResponseData = CreateBookingOutput;

export type CreateBookingResponse = ApiResponse<CreateBookingResponseData>;

/**
 * Maps API request → Application input.
 */
export function toCreateBookingInput(
  request: CreateBookingRequest,
): CreateBookingInput {
  return {
    resourceReference: request.resourceReference,
    customerReference: request.customerReference,
    startAt: request.startAt,
    endAt: request.endAt,
    ...(request.metadata !== undefined ? { metadata: request.metadata } : {}),
  };
}
