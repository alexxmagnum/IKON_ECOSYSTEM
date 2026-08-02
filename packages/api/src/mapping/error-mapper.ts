import type { ApplicationError } from "@motanos/application";
import type { ApiError } from "../contracts/errors";

/**
 * Maps Application-layer errors to API-facing errors.
 * No HTTP status codes in this foundation.
 */
export interface ApiErrorMapper {
  map(error: ApplicationError): ApiError;
}

/**
 * Default 1:1 mapper — preserves ApplicationError vocabulary at the API boundary.
 */
export function mapApplicationError(error: ApplicationError): ApiError {
  return {
    code: error.code,
    message: error.message,
    ...(error.details !== undefined ? { details: error.details } : {}),
  };
}

export const defaultApiErrorMapper: ApiErrorMapper = {
  map: mapApplicationError,
};
