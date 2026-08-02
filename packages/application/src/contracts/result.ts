import type { ApplicationError } from "./errors";

/**
 * Discriminated application result — business outcomes as data, not thrown exceptions.
 */
export type ApplicationResult<T> =
  | ApplicationSuccess<T>
  | ApplicationFailure;

export interface ApplicationSuccess<T> {
  ok: true;
  data: T;
  metadata?: Record<string, unknown>;
}

export interface ApplicationFailure {
  ok: false;
  error: ApplicationError;
  metadata?: Record<string, unknown>;
}

export function success<T>(
  data: T,
  metadata?: Record<string, unknown>,
): ApplicationSuccess<T> {
  return metadata === undefined ? { ok: true, data } : { ok: true, data, metadata };
}

export function failure(
  error: ApplicationError,
  metadata?: Record<string, unknown>,
): ApplicationFailure {
  return metadata === undefined
    ? { ok: false, error }
    : { ok: false, error, metadata };
}

export function isSuccess<T>(
  result: ApplicationResult<T>,
): result is ApplicationSuccess<T> {
  return result.ok === true;
}

export function isFailure<T>(
  result: ApplicationResult<T>,
): result is ApplicationFailure {
  return result.ok === false;
}
