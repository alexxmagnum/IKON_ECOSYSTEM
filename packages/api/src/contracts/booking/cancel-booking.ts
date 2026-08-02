import type {
  CancelBookingInput,
  CancelBookingOutput,
} from "@motanos/application";
import type { ApiRequest } from "../request";
import type { ApiResponse } from "../response";

export interface CancelBookingRequest extends ApiRequest {
  bookingReference: string;
  reason?: string;
  metadata?: Record<string, unknown>;
}

export type CancelBookingResponseData = CancelBookingOutput;
export type CancelBookingResponse = ApiResponse<CancelBookingResponseData>;

export function toCancelBookingInput(
  request: CancelBookingRequest,
): CancelBookingInput {
  return {
    bookingReference: request.bookingReference,
    ...(request.reason !== undefined ? { reason: request.reason } : {}),
    ...(request.metadata !== undefined ? { metadata: request.metadata } : {}),
  };
}
