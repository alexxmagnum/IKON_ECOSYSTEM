import type {
  ExpireBookingHoldsInput,
  ExpireBookingHoldsOutput,
} from "@motanos/application";
import type { ApiRequest } from "../request";
import type { ApiResponse } from "../response";

export interface ExpireBookingHoldsRequest extends ApiRequest {
  now: string;
  bookingReferences?: string[];
  metadata?: Record<string, unknown>;
}

export type ExpireBookingHoldsResponseData = ExpireBookingHoldsOutput;
export type ExpireBookingHoldsResponse =
  ApiResponse<ExpireBookingHoldsResponseData>;

export function toExpireBookingHoldsInput(
  request: ExpireBookingHoldsRequest,
): ExpireBookingHoldsInput {
  const bookingReferences = request.bookingReferences
    ?.map((ref) => ref.trim())
    .filter((ref) => ref.length > 0);

  return {
    now: request.now.trim(),
    ...(bookingReferences !== undefined && bookingReferences.length > 0
      ? { bookingReferences }
      : {}),
    ...(request.metadata !== undefined ? { metadata: request.metadata } : {}),
  };
}
