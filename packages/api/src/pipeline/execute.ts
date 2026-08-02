import type {
  ApplicationResult,
  ApplicationService,
  ExecutionContext,
  UseCase,
} from "@motanos/application";
import type { ApiRequest } from "../contracts/request";
import type {
  ApiResponse,
  ApiResponseMetadata,
} from "../contracts/response";
import { apiFailure, apiSuccess } from "../contracts/response";
import type { ApiContext } from "../context/api-context";
import type { ApiErrorMapper } from "../mapping/error-mapper";

/**
 * Builds Application ExecutionContext from ApiContext (+ optional request).
 */
export function toExecutionContext(
  context?: ApiContext,
  request?: ApiRequest,
): ExecutionContext {
  const requestReference =
    context?.requestReference ?? request?.requestReference;
  const metadata = {
    ...(request?.metadata ?? {}),
    ...(context?.metadata ?? {}),
  };

  return {
    ...(requestReference !== undefined ? { requestReference } : {}),
    ...(context?.actorReference !== undefined
      ? { actorReference: context.actorReference }
      : {}),
    ...(Object.keys(metadata).length > 0 ? { metadata } : {}),
  };
}

/**
 * Pipeline: request → context → application execution → response.
 * Contracts only — no concrete product handlers.
 */
export interface ApiExecutionPipeline {
  execute<TInput, TOutput>(args: {
    request: ApiRequest;
    input: TInput;
    useCase: UseCase<TInput, TOutput>;
    context?: ApiContext;
  }): Promise<ApiResponse<TOutput>>;
}

/**
 * Optional wiring surface for a pipeline that owns ApplicationService + mapper.
 */
export interface ApiPipelineDependencies {
  application: ApplicationService;
  errorMapper: ApiErrorMapper;
}

/**
 * Turns an ApplicationResult into an ApiResponse (no transport / HTTP).
 */
export function toApiResponse<T>(
  result: ApplicationResult<T>,
  errorMapper: ApiErrorMapper,
  metadata?: ApiResponseMetadata,
): ApiResponse<T> {
  const merged =
    result.metadata !== undefined || metadata !== undefined
      ? { ...(result.metadata ?? {}), ...(metadata ?? {}) }
      : undefined;

  if (result.ok) {
    return apiSuccess(result.data, merged);
  }

  return apiFailure(errorMapper.map(result.error), merged);
}
