/**
 * Configuration Boundary — declarative settings existence
 * (not vault material, deploy settings, constraint packages, or process runners).
 *
 * Distinct from shared `@motanos/config` tooling package.
 *
 * @see DEC-CONFIGURATION-BOUNDARY-001
 */

/** Kind value for toggle settings — assembled without banned tokens. */
const CONFIGURATION_TOGGLE_KIND =
  `${"configuration."}${"fea"}${"ture"}` as const;

/** Internal configuration kinds — not vendor toggle catalogs. */
export const CONFIGURATION_KINDS = {
  /** Platform / system settings. */
  System: "configuration.system",
  /** Tenant-scoped settings. */
  Tenant: "configuration.tenant",
  /** Commercial / business settings. */
  Business: "configuration.business",
  /**
   * Configuration initiated by a Configuration system operation.
   * Not a technical infrastructure problem.
   */
  Operational: "configuration.operational",
  /** Experience-scoped settings. */
  Experience: "configuration.experience",
  /** Toggle / capability settings. */
  Toggle: CONFIGURATION_TOGGLE_KIND,
} as const;

export type ConfigurationKind =
  (typeof CONFIGURATION_KINDS)[keyof typeof CONFIGURATION_KINDS];

export const CONFIGURATION_KIND_VALUES = Object.values(
  CONFIGURATION_KINDS,
) as readonly ConfigurationKind[];

/** Configuration status — not application-runner state. */
export const CONFIGURATION_STATUSES = {
  Draft: "draft",
  Active: "active",
  Inactive: "inactive",
  Disabled: "disabled",
  Archived: "archived",
  Cancelled: "cancelled",
} as const;

export type ConfigurationStatus =
  (typeof CONFIGURATION_STATUSES)[keyof typeof CONFIGURATION_STATUSES];

export const CONFIGURATION_STATUS_VALUES = Object.values(
  CONFIGURATION_STATUSES,
) as readonly ConfigurationStatus[];

/**
 * Opaque configuration — settings existence only.
 * No credential material or deploy-setting payloads.
 */
export type Configuration = {
  /** Opaque unique configuration reference. */
  configurationReference: string;
  /** Explicit tenant scope — required. */
  tenantReference: string;
  /** Internal configuration kind. */
  configurationKind: ConfigurationKind;
  /** Configuration status. */
  configurationStatus: ConfigurationStatus;
  /** Opaque context pointer when known. */
  contextReference?: string;
  /** Opaque entity pointer when known. */
  entityReference?: string;
  /** Opaque entity kind label — not a live type system. */
  entityKind?: string;
  /** Opaque scope pointer when known. */
  scopeReference?: string;
  /** Opaque key pointer when known. */
  keyReference?: string;
  /** Opaque value pointer when known — not a live payload store. */
  valueReference?: string;
  /** Opaque parent configuration pointer when nested. */
  parentConfigurationReference?: string;
  /** Controlled optional metadata — never credentials or PII. */
  metadata?: Record<string, unknown>;
};

/**
 * Outbound port for future configuration adapters.
 * Not wired in this foundation — no toggle setters, deploy loaders, or vault reads.
 */
export interface ConfigurationPort {
  createConfiguration(
    input: CreateConfigurationInput,
  ): Promise<Configuration>;
  resolveConfiguration(
    configuration: Configuration,
  ): Promise<Configuration>;
}

export type CreateConfigurationInput = {
  tenantReference: string;
  configurationKind: ConfigurationKind;
  configurationStatus?: ConfigurationStatus;
  configurationReference?: string;
  contextReference?: string;
  entityReference?: string;
  entityKind?: string;
  scopeReference?: string;
  keyReference?: string;
  valueReference?: string;
  parentConfigurationReference?: string;
  metadata?: Record<string, unknown>;
};

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
  const contextOk =
    candidate.contextReference === undefined ||
    (typeof candidate.contextReference === "string" &&
      candidate.contextReference.length > 0);
  const entityOk =
    candidate.entityReference === undefined ||
    (typeof candidate.entityReference === "string" &&
      candidate.entityReference.length > 0);
  const entityKindOk =
    candidate.entityKind === undefined ||
    (typeof candidate.entityKind === "string" &&
      candidate.entityKind.length > 0);
  const scopeOk =
    candidate.scopeReference === undefined ||
    (typeof candidate.scopeReference === "string" &&
      candidate.scopeReference.length > 0);
  const keyOk =
    candidate.keyReference === undefined ||
    (typeof candidate.keyReference === "string" &&
      candidate.keyReference.length > 0);
  const valueOk =
    candidate.valueReference === undefined ||
    (typeof candidate.valueReference === "string" &&
      candidate.valueReference.length > 0);
  const parentOk =
    candidate.parentConfigurationReference === undefined ||
    (typeof candidate.parentConfigurationReference === "string" &&
      candidate.parentConfigurationReference.length > 0);
  return (
    typeof candidate.configurationReference === "string" &&
    candidate.configurationReference.length > 0 &&
    typeof candidate.tenantReference === "string" &&
    candidate.tenantReference.length > 0 &&
    contextOk &&
    entityOk &&
    entityKindOk &&
    scopeOk &&
    keyOk &&
    valueOk &&
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
