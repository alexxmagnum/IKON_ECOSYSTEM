/**
 * API execution context — prepared for Application ExecutionContext.
 * Opaque actor only; authentication remains outside this package.
 */
export type ApiRequestReference = string;
export type ApiActorReference = string;

export interface ApiContext {
  requestReference?: ApiRequestReference;
  actorReference?: ApiActorReference;
  metadata?: Record<string, unknown>;
}
