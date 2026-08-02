import type { ApplicationResult } from "@motanos/application";
import type { ApiResponse, ApiResponseMetadata } from "../response";
import { toApiResponse } from "../../pipeline/execute";
import { defaultApiErrorMapper } from "../../mapping/error-mapper";
import type {
  CancelBookingResponse,
  CancelBookingResponseData,
} from "./cancel-booking";
import type {
  CheckAvailabilityResponse,
  CheckAvailabilityResponseData,
} from "./check-availability";
import type {
  ConfirmBookingResponse,
  ConfirmBookingResponseData,
} from "./confirm-booking";
import type {
  CreateBookingResponse,
  CreateBookingResponseData,
} from "./create-booking";
import type {
  GetBookingResponse,
  GetBookingResponseData,
} from "./get-booking";
import type {
  ListBookingsResponse,
  ListBookingsResponseData,
} from "./list-bookings";
import type {
  RescheduleBookingResponse,
  RescheduleBookingResponseData,
} from "./reschedule-booking";
import type {
  ExpireBookingHoldsResponse,
  ExpireBookingHoldsResponseData,
} from "./expire-booking-holds";

function mapResult<T>(
  result: ApplicationResult<T>,
  metadata?: ApiResponseMetadata,
): ApiResponse<T> {
  return toApiResponse(result, defaultApiErrorMapper, metadata);
}

export function toCreateBookingResponse(
  result: ApplicationResult<CreateBookingResponseData>,
  metadata?: ApiResponseMetadata,
): CreateBookingResponse {
  return mapResult(result, metadata);
}

export function toConfirmBookingResponse(
  result: ApplicationResult<ConfirmBookingResponseData>,
  metadata?: ApiResponseMetadata,
): ConfirmBookingResponse {
  return mapResult(result, metadata);
}

export function toCancelBookingResponse(
  result: ApplicationResult<CancelBookingResponseData>,
  metadata?: ApiResponseMetadata,
): CancelBookingResponse {
  return mapResult(result, metadata);
}

export function toCheckAvailabilityResponse(
  result: ApplicationResult<CheckAvailabilityResponseData>,
  metadata?: ApiResponseMetadata,
): CheckAvailabilityResponse {
  return mapResult(result, metadata);
}

export function toGetBookingResponse(
  result: ApplicationResult<GetBookingResponseData>,
  metadata?: ApiResponseMetadata,
): GetBookingResponse {
  return mapResult(result, metadata);
}

export function toListBookingsResponse(
  result: ApplicationResult<ListBookingsResponseData>,
  metadata?: ApiResponseMetadata,
): ListBookingsResponse {
  return mapResult(result, metadata);
}

export function toRescheduleBookingResponse(
  result: ApplicationResult<RescheduleBookingResponseData>,
  metadata?: ApiResponseMetadata,
): RescheduleBookingResponse {
  return mapResult(result, metadata);
}

export function toExpireBookingHoldsResponse(
  result: ApplicationResult<ExpireBookingHoldsResponseData>,
  metadata?: ApiResponseMetadata,
): ExpireBookingHoldsResponse {
  return mapResult(result, metadata);
}

export type { ApiResponse };
