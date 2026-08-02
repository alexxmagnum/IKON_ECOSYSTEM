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
  /** Optional pre-built service handles to register. */
  services?: RuntimeServices;
  /** Extra registration hook after default service registration. */
  register?: (registry: ReturnType<typeof createServiceRegistry>) => void;
}

/**
 * Primitive runtime factory.
 *
 * Responsibilities only:
 * - validate base config
 * - create ServiceRegistry
 * - register supplied services under RUNTIME_SERVICE_TOKENS
 * - build RuntimeContext
 *
 * Does not construct Authorization, Booking, UseCases, or API handlers.
 * Prefer createMotanOSRuntime() for MotanOS product bootstrap.
 */
export function createRuntime(options: CreateRuntimeOptions): MotanOSRuntime {
  const { config, services, register } = options;

  if (!config.environment || typeof config.environment !== "string") {
    throw new Error("RuntimeConfig.environment is required");
  }

  const registry = createServiceRegistry();

  if (services?.application) {
    registry.register(RUNTIME_SERVICE_TOKENS.application, services.application);
  }
  if (services?.api) {
    registry.register(RUNTIME_SERVICE_TOKENS.api, services.api);
  }
  if (services?.authorization) {
    registry.register(
      RUNTIME_SERVICE_TOKENS.authorization,
      services.authorization,
    );
  }
  if (services?.booking) {
    registry.register(RUNTIME_SERVICE_TOKENS.booking, services.booking);
  }
  if (services?.createBooking) {
    registry.register(
      RUNTIME_SERVICE_TOKENS.createBooking,
      services.createBooking,
    );
  }
  if (services?.createBookingHandler) {
    registry.register(
      RUNTIME_SERVICE_TOKENS.createBookingHandler,
      services.createBookingHandler,
    );
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
