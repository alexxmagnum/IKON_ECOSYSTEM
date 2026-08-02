import type {
  ConfirmBookingInput,
  ConfirmBookingOutput,
} from "@motanos/application";
import type { ApiRequest } from "../request";
import type { ApiResponse } from "../response";

export interface ConfirmBookingRequest extends ApiRequest {
  bookingReference: string;
  metadata?: Record<string, unknown>;
}

export type ConfirmBookingResponseData = ConfirmBookingOutput;
export type ConfirmBookingResponse = ApiResponse<ConfirmBookingResponseData>;

export function toConfirmBookingInput(
  request: ConfirmBookingRequest,
): ConfirmBookingInput {
  return {
    bookingReference: request.bookingReference,
    ...(request.metadata !== undefined ? { metadata: request.metadata } : {}),
  };
}
