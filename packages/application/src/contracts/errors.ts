/**
 * Application-layer error codes (foundation vocabulary).
 * Not a security implementation — contracts for future authorization/validation.
 */
export const APPLICATION_ERROR_CODES = [
  "ValidationError",
  "UnauthorizedError",
  "ForbiddenError",
  "NotFoundError",
  "ConflictError",
  "FailedPreconditionError",
  "InternalError",
] as const;

export type ApplicationErrorCode = (typeof APPLICATION_ERROR_CODES)[number];

/**
 * Structured application error — prefer returning Failure results over throwing.
 */
export interface ApplicationError {
  code: ApplicationErrorCode;
  message: string;
  details?: Record<string, unknown>;
  causeReference?: string;
}

export function isApplicationErrorCode(
  value: string,
): value is ApplicationErrorCode {
  return (APPLICATION_ERROR_CODES as readonly string[]).includes(value);
}
