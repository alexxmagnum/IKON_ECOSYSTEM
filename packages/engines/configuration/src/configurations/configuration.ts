/**
 * Configuration Engine Boundary — contextual / tenant-scoped configurable values
 * (not external flag services, credential vaults, deploy settings, or business rules).
 *
 * Distinct from shared `@motanos/config` tooling package.
 *
 * @see DEC-CONFIGURATION-BOUNDARY-001
 */

/** Internal configuration kinds — not vendor flag catalogs. */
export const CONFIGURATION_KINDS = {
  /** Tenant / business configuration. */
  Tenant: "configuration.tenant",
  /** Module or capability enablement configuration. */
  Feature: "configuration.feature",
  /** Operational behaviour configuration. */
  Operational: "configuration.operational",
  /** Experience-scoped configuration. */
  Experience: "configuration.experience",
  /** Commercial parameter configuration. */
  Business: "configuration.business",
  /**
   * Configuration initiated by a Configuration system operation.
   * Not a technical infrastructure error.
   */
  System: "configuration.system",
} as const;

export type ConfigurationKind =
  (typeof CONFIGURATION_KINDS)[keyof typeof CONFIGURATION_KINDS];

export const CONFIGURATION_KIND_VALUES = Object.values(
  CONFIGURATION_KINDS,
) as readonly ConfigurationKind[];

/** Configuration definition status — not resolution-runtime state. */
export const CONFIGURATION_STATUSES = {
  Draft: "draft",
  Active: "active",
  Paused: "paused",
  Expired: "expired",
  Archived: "archived",
  Cancelled: "cancelled",
} as const;

export type ConfigurationStatus =
  (typeof CONFIGURATION_STATUSES)[keyof typeof CONFIGURATION_STATUSES];

export const CONFIGURATION_STATUS_VALUES = Object.values(
  CONFIGURATION_STATUSES,
) as readonly ConfigurationStatus[];

/**
 * Opaque configuration definition — contextual values only.
 * No credential material or deploy-setting payloads.
 */
export interface Configuration {
  /** Opaque unique configuration reference. */
  configurationReference: string;
  /** Explicit tenant scope — required. */
  tenantReference: string;
  /** Internal configuration kind. */
  configurationKind: ConfigurationKind;
  /** Configuration definition status. */
  configurationStatus: ConfigurationStatus;
  /** Opaque name pointer when known. */
  nameReference?: string;
  /** Opaque context pointer when known. */
  contextReference?: string;
  /** Opaque value pointer when known — not a live payload store. */
  valueReference?: string;
  /** Opaque owner pointer when known. */
  ownerReference?: string;
  /** Opaque parent configuration pointer when nested. */
  parentConfigurationReference?: string;
  /** Controlled optional metadata — never credentials or PII. */
  metadata?: Record<string, unknown>;
}

/**
 * Outbound port for future configuration adapters (Runtime).
 * Not wired in this foundation — no flag setters, deploy loaders, or vault reads.
 */
export interface ConfigurationPort {
  createConfiguration(
    input: CreateConfigurationInput,
  ): Promise<Configuration>;
  resolveConfiguration(
    configuration: Configuration,
  ): Promise<Configuration>;
}

export interface CreateConfigurationInput {
  tenantReference: string;
  configurationKind: ConfigurationKind;
  configurationStatus?: ConfigurationStatus;
  configurationReference?: string;
  nameReference?: string;
  contextReference?: string;
  valueReference?: string;
  ownerReference?: string;
  parentConfigurationReference?: string;
  metadata?: Record<string, unknown>;
}

export function isConfigurationKind(
  value: string,
): value is ConfigurationKind {
  return (CONFIGURATION_KIND_VALUES as readonly string[]).includes(value);
}

export function isConfigurationStatus(
  value: string,
): value is ConfigurationStatus {
  return (CONFIGURATION_STATUS_VALUES as readonly string[]).includes(value);
}

export function isConfiguration(value: unknown): value is Configuration {
  if (value === null || typeof value !== "object") {
    return false;
  }
  const candidate = value as Record<string, unknown>;
  const nameOk =
    candidate.nameReference === undefined ||
    (typeof candidate.nameReference === "string" &&
      candidate.nameReference.length > 0);
  const contextOk =
    candidate.contextReference === undefined ||
    (typeof candidate.contextReference === "string" &&
      candidate.contextReference.length > 0);
  const valueOk =
    candidate.valueReference === undefined ||
    (typeof candidate.valueReference === "string" &&
      candidate.valueReference.length > 0);
  const ownerOk =
    candidate.ownerReference === undefined ||
    (typeof candidate.ownerReference === "string" &&
      candidate.ownerReference.length > 0);
  const parentOk =
    candidate.parentConfigurationReference === undefined ||
    (typeof candidate.parentConfigurationReference === "string" &&
      candidate.parentConfigurationReference.length > 0);
  return (
    typeof candidate.configurationReference === "string" &&
    candidate.configurationReference.length > 0 &&
    typeof candidate.tenantReference === "string" &&
    candidate.tenantReference.length > 0 &&
    nameOk &&
    contextOk &&
    valueOk &&
    ownerOk &&
    parentOk &&
    typeof candidate.configurationKind === "string" &&
    isConfigurationKind(candidate.configurationKind) &&
    typeof candidate.configurationStatus === "string" &&
    isConfigurationStatus(candidate.configurationStatus)
  );
}

export function isConfigurationPort(
  value: unknown,
): value is ConfigurationPort {
  return (
    value !== null &&
    typeof value === "object" &&
    typeof (value as ConfigurationPort).createConfiguration === "function" &&
    typeof (value as ConfigurationPort).resolveConfiguration === "function"
  );
}
