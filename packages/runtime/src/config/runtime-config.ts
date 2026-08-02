/**
 * Abstract runtime configuration.
 * Non-sensitive composition knobs only — no credentials or private keys.
 */
export type RuntimeEnvironment =
  | "development"
  | "test"
  | "production"
  | (string & {});

export interface RuntimeConfig {
  environment: RuntimeEnvironment;
  features?: Readonly<Record<string, boolean>>;
  metadata?: Record<string, unknown>;
}
