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
 */
export function createRuntime(options: CreateRuntimeOptions): MotanOSRuntime {
  const { config, services, register } = options;

  if (!config.environment || typeof config.environment !== "string") {
    throw new Error("RuntimeConfig.environment is required");
  }

  const registry = createServiceRegistry();
  const tokenMap = RUNTIME_SERVICE_TOKENS;
  const entries: Array<readonly [string, unknown]> = [];

  const push = (token: string, value: unknown | undefined) => {
    if (value !== undefined) {
      entries.push([token, value]);
    }
  };

  if (services) {
    push(tokenMap.application, services.application);
    push(tokenMap.api, services.api);
    push(tokenMap.authorization, services.authorization);
    push(tokenMap.booking, services.booking);
    push(tokenMap.createBooking, services.createBooking);
    push(tokenMap.confirmBooking, services.confirmBooking);
    push(tokenMap.cancelBooking, services.cancelBooking);
    push(tokenMap.checkAvailability, services.checkAvailability);
    push(tokenMap.getBooking, services.getBooking);
    push(tokenMap.listBookings, services.listBookings);
    push(tokenMap.rescheduleBooking, services.rescheduleBooking);
    push(tokenMap.expireBookingHolds, services.expireBookingHolds);
    push(tokenMap.createBookingHandler, services.createBookingHandler);
    push(tokenMap.confirmBookingHandler, services.confirmBookingHandler);
    push(tokenMap.cancelBookingHandler, services.cancelBookingHandler);
    push(tokenMap.checkAvailabilityHandler, services.checkAvailabilityHandler);
    push(tokenMap.getBookingHandler, services.getBookingHandler);
    push(tokenMap.listBookingsHandler, services.listBookingsHandler);
    push(tokenMap.rescheduleBookingHandler, services.rescheduleBookingHandler);
    push(
      tokenMap.expireBookingHoldsHandler,
      services.expireBookingHoldsHandler,
    );
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
