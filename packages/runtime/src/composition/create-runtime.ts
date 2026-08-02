import type { RuntimeConfig } from "../config/runtime-config";
import type {
  MotanOSRuntime,
  RuntimeContext,
  RuntimeServices,
} from "../contracts/runtime";
import { RUNTIME_SERVICE_TOKENS } from "../contracts/runtime";
import { createServiceRegistry } from "../registry/service-registry";

export interface CreateRuntimeOptions {
  config: RuntimeConfig;
  /**
   * Optional pre-built layer handles. Not constructed here —
   * callers supply implementations from outside this package.
   */
  services?: RuntimeServices;
  /**
   * Extra registration hook for future adapters (still abstract).
   */
  register?: (registry: ReturnType<typeof createServiceRegistry>) => void;
}

/**
 * Creates a base MotanOS runtime composition.
 *
 * Does not open connections, start servers, or call external systems.
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

  register?.(registry);

  const context: RuntimeContext = {
    environment: config.environment,
    ...(config.metadata !== undefined ? { metadata: { ...config.metadata } } : {}),
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
