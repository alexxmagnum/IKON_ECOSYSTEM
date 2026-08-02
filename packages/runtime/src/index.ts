/**
 * @motanos/runtime — Runtime Composition / composition root.
 *
 * Assembles API → Application → Permissions → Booking for MotanOS.
 * Lower layers must not import this package.
 *
 * Public surface: createMotanOSRuntime / createRuntime + shared contracts.
 * In-memory providers and internal factories are not part of the public API.
 */

export const RUNTIME_LAYER = "@motanos/runtime" as const;

export type {
  RuntimeConfig,
  RuntimeEnvironment,
} from "./config/runtime-config";

export type {
  CancelBookingHandler,
  CheckAvailabilityHandler,
  ConfirmBookingHandler,
  CreateBookingHandler,
  GetBookingHandler,
  ListBookingsHandler,
  RescheduleBookingHandler,
  ExpireBookingHoldsHandler,
  MotanOSRuntime,
  RuntimeContext,
  RuntimeServices,
} from "./contracts/runtime";
export { RUNTIME_SERVICE_TOKENS } from "./contracts/runtime";

export type { ServiceRegistry, ServiceToken } from "./registry/service-registry";

export type { RuntimeError, RuntimeErrorCode } from "./errors/runtime-errors";
export {
  RUNTIME_ERROR_CODES,
  createRuntimeError,
  isRuntimeErrorCode,
} from "./errors/runtime-errors";

export type { CreateRuntimeOptions } from "./composition/create-runtime";
export { createRuntime } from "./composition/create-runtime";

export type {
  CreateMotanOSRuntimeOptions,
  MotanOSComposedRuntime,
} from "./composition/create-motanos-runtime";
export { createMotanOSRuntime } from "./composition/create-motanos-runtime";
