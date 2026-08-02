import type { GetBookingInput, GetBookingOutput } from "@motanos/application";
import type { ApiRequest } from "../request";
import type { ApiResponse } from "../response";

export interface GetBookingRequest extends ApiRequest {
  tenantReference: string;
  bookingReference: string;
  metadata?: Record<string, unknown>;
}

export type GetBookingResponseData = GetBookingOutput;
export type GetBookingResponse = ApiResponse<GetBookingResponseData>;

export function toGetBookingInput(
  request: GetBookingRequest,
): GetBookingInput {
  return {
    tenantReference: request.tenantReference.trim(),
    bookingReference: request.bookingReference.trim(),
    ...(request.metadata !== undefined ? { metadata: request.metadata } : {}),
  };
}
