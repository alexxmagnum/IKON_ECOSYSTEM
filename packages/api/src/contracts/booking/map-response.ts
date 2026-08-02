import type { ApplicationResult } from "@motanos/application";
import type { ApiResponse, ApiResponseMetadata } from "../response";
import { toApiResponse } from "../../pipeline/execute";
import { defaultApiErrorMapper } from "../../mapping/error-mapper";
import type {
  CancelBookingResponse,
  CancelBookingResponseData,
} from "./cancel-booking";
import type {
  ConfirmBookingResponse,
  ConfirmBookingResponseData,
} from "./confirm-booking";
import type {
  CreateBookingResponse,
  CreateBookingResponseData,
} from "./create-booking";

/**
 * Maps ApplicationResult → ApiResponse for booking lifecycle operations.
 */
export function toCreateBookingResponse(
  result: ApplicationResult<CreateBookingResponseData>,
  metadata?: ApiResponseMetadata,
): CreateBookingResponse {
  return toApiResponse(result, defaultApiErrorMapper, metadata);
}

export function toConfirmBookingResponse(
  result: ApplicationResult<ConfirmBookingResponseData>,
  metadata?: ApiResponseMetadata,
): ConfirmBookingResponse {
  return toApiResponse(result, defaultApiErrorMapper, metadata);
}

export function toCancelBookingResponse(
  result: ApplicationResult<CancelBookingResponseData>,
  metadata?: ApiResponseMetadata,
): CancelBookingResponse {
  return toApiResponse(result, defaultApiErrorMapper, metadata);
}

export type { ApiResponse };
