import type { ApiError } from "./errors";

/**
 * Response metadata — mirrors Application metadata and docs/25 `meta` intent
 * (request_id, version, pagination later). Wire key naming (`meta` vs `metadata`)
 * is DECISION REQUIRED for HTTP adapters.
 */
export interface ApiResponseMetadata {
  requestReference?: string;
  version?: string;
  [key: string]: unknown;
}

/**
 * Transport-agnostic API response (success | failure).
 * Does not embed HTTP status codes.
 */
export type ApiResponse<T> = ApiSuccessResponse<T> | ApiFailureResponse;

export interface ApiSuccessResponse<T> {
  ok: true;
  data: T;
  metadata?: ApiResponseMetadata;
}

export interface ApiFailureResponse {
  ok: false;
  error: ApiError;
  metadata?: ApiResponseMetadata;
}

export function apiSuccess<T>(
  data: T,
  metadata?: ApiResponseMetadata,
): ApiSuccessResponse<T> {
  return metadata === undefined ? { ok: true, data } : { ok: true, data, metadata };
}

export function apiFailure(
  error: ApiError,
  metadata?: ApiResponseMetadata,
): ApiFailureResponse {
  return metadata === undefined
    ? { ok: false, error }
    : { ok: false, error, metadata };
}

export function isApiSuccess<T>(
  response: ApiResponse<T>,
): response is ApiSuccessResponse<T> {
  return response.ok === true;
}

export function isApiFailure<T>(
  response: ApiResponse<T>,
): response is ApiFailureResponse {
  return response.ok === false;
}
