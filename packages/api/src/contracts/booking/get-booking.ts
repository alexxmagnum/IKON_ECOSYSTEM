import type { GetBookingInput, GetBookingOutput } from "@motanos/application";
import type { ApiRequest } from "../request";
import type { ApiResponse } from "../response";

export interface GetBookingRequest extends ApiRequest {
  bookingReference: string;
  metadata?: Record<string, unknown>;
}

export type GetBookingResponseData = GetBookingOutput;
export type GetBookingResponse = ApiResponse<GetBookingResponseData>;

export function toGetBookingInput(
  request: GetBookingRequest,
): GetBookingInput {
  return {
    bookingReference: request.bookingReference.trim(),
    ...(request.metadata !== undefined ? { metadata: request.metadata } : {}),
  };
}
