/**
 * Service registry contracts — abstract composition only.
 * No concrete product services are registered by this foundation.
 */

/**
 * Opaque registry key. Callers may brand with a phantom type parameter.
 */
export type ServiceToken<T = unknown> = string & {
  readonly __service?: T;
};

export interface ServiceRegistry {
  register<T>(token: ServiceToken<T> | string, instance: T): void;
  resolve<T>(token: ServiceToken<T> | string): T | undefined;
  has(token: ServiceToken<unknown> | string): boolean;
  listTokens(): readonly string[];
}

/**
 * In-memory registry for composition wiring.
 * Scope (singleton vs request) is DECISION REQUIRED — this is a plain map.
 */
export function createServiceRegistry(): ServiceRegistry {
  const services = new Map<string, unknown>();

  return {
    register<T>(token: ServiceToken<T> | string, instance: T): void {
      services.set(String(token), instance);
    },
    resolve<T>(token: ServiceToken<T> | string): T | undefined {
      return services.get(String(token)) as T | undefined;
    },
    has(token: ServiceToken<unknown> | string): boolean {
      return services.has(String(token));
    },
    listTokens(): readonly string[] {
      return [...services.keys()];
    },
  };
}
