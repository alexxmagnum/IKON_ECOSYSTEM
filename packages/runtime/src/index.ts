/**
 * @motanos/runtime — Runtime Composition foundation.
 *
 * Assembles API → Application → Permissions composition slots.
 * No business logic, no concrete infrastructure adapters.
 */

export const RUNTIME_LAYER = "@motanos/runtime" as const;

export type {
  RuntimeConfig,
  RuntimeEnvironment,
} from "./config/runtime-config";

export type {
  MotanOSRuntime,
  RuntimeContext,
  RuntimeServices,
} from "./contracts/runtime";
export { RUNTIME_SERVICE_TOKENS } from "./contracts/runtime";

export type { ServiceRegistry, ServiceToken } from "./registry/service-registry";
export { createServiceRegistry } from "./registry/service-registry";

export type { RuntimeError, RuntimeErrorCode } from "./errors/runtime-errors";
export {
  RUNTIME_ERROR_CODES,
  createRuntimeError,
  isRuntimeErrorCode,
} from "./errors/runtime-errors";

export type { CreateRuntimeOptions } from "./composition/create-runtime";
export { createRuntime } from "./composition/create-runtime";
