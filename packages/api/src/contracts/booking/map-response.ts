import type { ApplicationResult } from "@motanos/application";
import type { ApiResponse, ApiResponseMetadata } from "../response";
import { toApiResponse } from "../../pipeline/execute";
import { defaultApiErrorMapper } from "../../mapping/error-mapper";
import type {
  CreateBookingResponse,
  CreateBookingResponseData,
} from "./create-booking";

/**
 * Maps ApplicationResult → ApiResponse for CreateBooking.
 * Uses existing data / error / metadata envelope (docs/25 `meta` → `metadata` in TS).
 */
export function toCreateBookingResponse(
  result: ApplicationResult<CreateBookingResponseData>,
  metadata?: ApiResponseMetadata,
): CreateBookingResponse {
  return toApiResponse(result, defaultApiErrorMapper, metadata);
}

export type { ApiResponse };
