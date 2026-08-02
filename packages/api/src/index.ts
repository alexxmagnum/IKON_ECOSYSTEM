/**
 * @motanos/api — API / Backend Runtime foundation.
 *
 * External Request → API Runtime → Application Layer → Domains / Engines
 *
 * Contracts and pipeline only. No business endpoints, Auth, or persistence adapters.
 */

export const API_LAYER = "@motanos/api" as const;

export type { ApiRequest } from "./contracts/request";
export type { ApiError } from "./contracts/errors";
export type {
  ApiFailureResponse,
  ApiResponse,
  ApiResponseMetadata,
  ApiSuccessResponse,
} from "./contracts/response";
export {
  apiFailure,
  apiSuccess,
  isApiFailure,
  isApiSuccess,
} from "./contracts/response";

export type {
  ApiActorReference,
  ApiContext,
  ApiRequestReference,
} from "./context/api-context";

export type { ApiErrorMapper } from "./mapping/error-mapper";
export {
  defaultApiErrorMapper,
  mapApplicationError,
} from "./mapping/error-mapper";

export type {
  ApiExecutionPipeline,
  ApiPipelineDependencies,
} from "./pipeline/execute";
export { toApiResponse, toExecutionContext } from "./pipeline/execute";

export type { ApiService } from "./services/api-service";

export type {
  CancelBookingRequest,
  CancelBookingResponse,
  CancelBookingResponseData,
  CheckAvailabilityRequest,
  CheckAvailabilityResponse,
  CheckAvailabilityResponseData,
  ConfirmBookingRequest,
  ConfirmBookingResponse,
  ConfirmBookingResponseData,
  CreateBookingRequest,
  CreateBookingResponse,
  CreateBookingResponseData,
  GetBookingRequest,
  GetBookingResponse,
  GetBookingResponseData,
  ListBookingsRequest,
  ListBookingsResponse,
  ListBookingsResponseData,
  RescheduleBookingRequest,
  RescheduleBookingResponse,
  RescheduleBookingResponseData,
  ExpireBookingHoldsRequest,
  ExpireBookingHoldsResponse,
  ExpireBookingHoldsResponseData,
} from "./contracts/booking";
export {
  toCancelBookingInput,
  toCancelBookingResponse,
  toCheckAvailabilityInput,
  toCheckAvailabilityResponse,
  toConfirmBookingInput,
  toConfirmBookingResponse,
  toCreateBookingInput,
  toCreateBookingResponse,
  toExpireBookingHoldsInput,
  toExpireBookingHoldsResponse,
  toGetBookingInput,
  toGetBookingResponse,
  toListBookingsInput,
  toListBookingsResponse,
  toRescheduleBookingInput,
  toRescheduleBookingResponse,
} from "./contracts/booking";
