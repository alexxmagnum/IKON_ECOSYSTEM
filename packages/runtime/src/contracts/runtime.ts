import type { RuntimeConfig, RuntimeEnvironment } from "../config/runtime-config";
import type { ServiceRegistry } from "../registry/service-registry";
import type { RuntimeServices } from "./service-tokens";

export type { CreateBookingHandler } from "./create-booking-handler";
export type { RuntimeServices } from "./service-tokens";
export { RUNTIME_SERVICE_TOKENS } from "./service-tokens";

/**
 * Active runtime snapshot after createRuntime().
 */
export interface RuntimeContext {
  environment?: RuntimeEnvironment;
  metadata?: Record<string, unknown>;
  services?: RuntimeServices;
}

/**
 * Composed MotanOS runtime handle (registry + config + context).
 */
export interface MotanOSRuntime {
  readonly config: RuntimeConfig;
  readonly context: RuntimeContext;
  readonly registry: ServiceRegistry;
}
