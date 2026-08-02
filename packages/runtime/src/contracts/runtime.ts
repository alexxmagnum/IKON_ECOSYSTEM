import type { ApiService } from "@motanos/api";
import type { ApplicationService } from "@motanos/application";
import type { AuthorizationService } from "@motanos/permissions";
import type { RuntimeConfig, RuntimeEnvironment } from "../config/runtime-config";
import type { ServiceRegistry } from "../registry/service-registry";

/**
 * Well-known composition tokens for platform layers.
 * Domains/engines register under their own tokens later — not here.
 */
export const RUNTIME_SERVICE_TOKENS = {
  application: "motanos.application" as const,
  api: "motanos.api" as const,
  authorization: "motanos.authorization" as const,
} as const;

/**
 * Optional typed handles for layers Runtime may compose.
 * All optional in this foundation — no concrete implementations required.
 */
export interface RuntimeServices {
  application?: ApplicationService;
  api?: ApiService;
  authorization?: AuthorizationService;
}

/**
 * Active runtime snapshot after createRuntime().
 */
export interface RuntimeContext {
  environment?: RuntimeEnvironment;
  metadata?: Record<string, unknown>;
  services?: RuntimeServices;
}

/**
 * Composed MotanOS runtime handle.
 */
export interface MotanOSRuntime {
  readonly config: RuntimeConfig;
  readonly context: RuntimeContext;
  readonly registry: ServiceRegistry;
}
