import type {
  RescheduleBookingInput,
  RescheduleBookingOutput,
} from "@motanos/application";
import type { ApiRequest } from "../request";
import type { ApiResponse } from "../response";

export interface RescheduleBookingRequest extends ApiRequest {
  tenantReference: string;
  bookingReference: string;
  newStartAt: string;
  newEndAt: string;
  metadata?: Record<string, unknown>;
}

export type RescheduleBookingResponseData = RescheduleBookingOutput;
export type RescheduleBookingResponse =
  ApiResponse<RescheduleBookingResponseData>;

export function toRescheduleBookingInput(
  request: RescheduleBookingRequest,
): RescheduleBookingInput {
  return {
    tenantReference: request.tenantReference.trim(),
    bookingReference: request.bookingReference.trim(),
    newStartAt: request.newStartAt.trim(),
    newEndAt: request.newEndAt.trim(),
    ...(request.metadata !== undefined ? { metadata: request.metadata } : {}),
  };
}
