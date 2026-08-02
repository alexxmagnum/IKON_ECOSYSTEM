/**
 * Runtime composition errors — data contracts, not thrown transport errors.
 */
export const RUNTIME_ERROR_CODES = [
  "InvalidConfig",
  "ServiceNotFound",
  "CompositionError",
] as const;

export type RuntimeErrorCode = (typeof RUNTIME_ERROR_CODES)[number];

export interface RuntimeError {
  code: RuntimeErrorCode;
  message: string;
  details?: Record<string, unknown>;
}

export function createRuntimeError(
  code: RuntimeErrorCode,
  message: string,
  details?: Record<string, unknown>,
): RuntimeError {
  return {
    code,
    message,
    ...(details !== undefined ? { details } : {}),
  };
}

export function isRuntimeErrorCode(
  value: string,
): value is RuntimeErrorCode {
  return (RUNTIME_ERROR_CODES as readonly string[]).includes(value);
}
