import type { RuntimeConfig } from "../config/runtime-config";
import type {
  MotanOSRuntime,
  RuntimeContext,
  RuntimeServices,
} from "../contracts/runtime";
import { RUNTIME_SERVICE_TOKENS } from "../contracts/service-tokens";
import { createServiceRegistry } from "../registry/service-registry";

export interface CreateRuntimeOptions {
  config: RuntimeConfig;
  services?: RuntimeServices;
  register?: (registry: ReturnType<typeof createServiceRegistry>) => void;
}

/**
 * Primitive runtime factory: config + registry + context.
 * Does not construct use cases or providers.
 */
export function createRuntime(options: CreateRuntimeOptions): MotanOSRuntime {
  const { config, services, register } = options;

  if (!config.environment || typeof config.environment !== "string") {
    throw new Error("RuntimeConfig.environment is required");
  }

  const registry = createServiceRegistry();

  const entries: Array<readonly [string, unknown]> = [];
  if (services?.application) {
    entries.push([RUNTIME_SERVICE_TOKENS.application, services.application]);
  }
  if (services?.api) {
    entries.push([RUNTIME_SERVICE_TOKENS.api, services.api]);
  }
  if (services?.authorization) {
    entries.push([RUNTIME_SERVICE_TOKENS.authorization, services.authorization]);
  }
  if (services?.booking) {
    entries.push([RUNTIME_SERVICE_TOKENS.booking, services.booking]);
  }
  if (services?.createBooking) {
    entries.push([RUNTIME_SERVICE_TOKENS.createBooking, services.createBooking]);
  }
  if (services?.confirmBooking) {
    entries.push([
      RUNTIME_SERVICE_TOKENS.confirmBooking,
      services.confirmBooking,
    ]);
  }
  if (services?.cancelBooking) {
    entries.push([RUNTIME_SERVICE_TOKENS.cancelBooking, services.cancelBooking]);
  }
  if (services?.createBookingHandler) {
    entries.push([
      RUNTIME_SERVICE_TOKENS.createBookingHandler,
      services.createBookingHandler,
    ]);
  }
  if (services?.confirmBookingHandler) {
    entries.push([
      RUNTIME_SERVICE_TOKENS.confirmBookingHandler,
      services.confirmBookingHandler,
    ]);
  }
  if (services?.cancelBookingHandler) {
    entries.push([
      RUNTIME_SERVICE_TOKENS.cancelBookingHandler,
      services.cancelBookingHandler,
    ]);
  }

  for (const [token, instance] of entries) {
    registry.register(token, instance);
  }

  register?.(registry);

  const context: RuntimeContext = {
    environment: config.environment,
    ...(config.metadata !== undefined
      ? { metadata: { ...config.metadata } }
      : {}),
    ...(services !== undefined ? { services } : {}),
  };

  return {
    config: Object.freeze({
      environment: config.environment,
      ...(config.features !== undefined
        ? { features: Object.freeze({ ...config.features }) }
        : {}),
      ...(config.metadata !== undefined
        ? { metadata: { ...config.metadata } }
        : {}),
    }),
    context,
    registry,
  };
}
