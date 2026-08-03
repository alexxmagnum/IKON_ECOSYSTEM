import type { ApplicationError } from "./errors";
import type { DomainEvent } from "@motanos/booking-lifecycle";

/**
 * Discriminated application result — business outcomes as data, not thrown exceptions.
 * Optional `events` carries domain facts produced by engines (DEC-BOOKING-EVENTS-002).
 */
export type ApplicationResult<T> =
  | ApplicationSuccess<T>
  | ApplicationFailure;

export interface ApplicationSuccess<T> {
  ok: true;
  data: T;
  /** Domain events produced during the use case (opaque to API). */
  events?: readonly DomainEvent[];
  metadata?: Record<string, unknown>;
}

export interface ApplicationFailure {
  ok: false;
  error: ApplicationError;
  metadata?: Record<string, unknown>;
}

export function success<T>(
  data: T,
  options?: {
    metadata?: Record<string, unknown>;
    events?: readonly DomainEvent[];
  },
): ApplicationSuccess<T> {
  return {
    ok: true,
    data,
    ...(options?.metadata !== undefined ? { metadata: options.metadata } : {}),
    ...(options?.events !== undefined && options.events.length > 0
      ? { events: options.events }
      : {}),
  };
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
