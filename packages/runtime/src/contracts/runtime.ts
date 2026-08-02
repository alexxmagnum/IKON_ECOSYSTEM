import type { RuntimeConfig, RuntimeEnvironment } from "../config/runtime-config";
import type { ServiceRegistry } from "../registry/service-registry";
import type { RuntimeServices } from "./service-tokens";

export type {
  CancelBookingHandler,
  CheckAvailabilityHandler,
  ConfirmBookingHandler,
  CreateBookingHandler,
  GetBookingHandler,
  ListBookingsHandler,
} from "./create-booking-handler";
export type { RuntimeServices } from "./service-tokens";
export { RUNTIME_SERVICE_TOKENS } from "./service-tokens";

export interface RuntimeContext {
  environment?: RuntimeEnvironment;
  metadata?: Record<string, unknown>;
  services?: RuntimeServices;
}

export interface MotanOSRuntime {
  readonly config: RuntimeConfig;
  readonly context: RuntimeContext;
  readonly registry: ServiceRegistry;
}
