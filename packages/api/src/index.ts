/**
 * @motanos/api — API / Backend Runtime foundation.
 *
 * External Request → API Runtime → Application Layer → Domains / Engines
 *
 * Contracts and pipeline only. No business endpoints, Auth, or database access.
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
