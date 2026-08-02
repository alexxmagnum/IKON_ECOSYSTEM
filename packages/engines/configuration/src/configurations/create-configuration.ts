import type {
  Configuration,
  ConfigurationKind,
  ConfigurationStatus,
  CreateConfigurationInput,
} from "./configuration";
import {
  CONFIGURATION_STATUSES,
  isConfigurationKind,
  isConfigurationStatus,
} from "./configuration";

let configurationSequence = 0;

export interface CreateConfigurationOptions {
  /**
   * When set, configuration may only be created for this tenant
   * (cross-tenant isolation).
   */
  tenantReference?: string;
}

/**
 * Build a validated Configuration (in-memory — definition / context only).
 * Does not resolve runtime values, open flag services, or load deploy settings.
 */
export function createConfiguration(
  input: CreateConfigurationInput,
  options: CreateConfigurationOptions = {},
): Configuration {
  const tenantReference = input.tenantReference?.trim() ?? "";
  const nameReference = input.nameReference?.trim();
  const contextReference = input.contextReference?.trim();
  const valueReference = input.valueReference?.trim();
  const ownerReference = input.ownerReference?.trim();
  const parentConfigurationReference =
    input.parentConfigurationReference?.trim();
  const boundTenant = options.tenantReference?.trim() || undefined;

  if (!tenantReference) {
    throw new Error("tenantReference is required");
  }
  if (!isConfigurationKind(input.configurationKind)) {
    throw new Error(
      `Unknown configuration kind: ${String(input.configurationKind)}`,
    );
  }

  const configurationStatus: ConfigurationStatus =
    input.configurationStatus ?? CONFIGURATION_STATUSES.Draft;
  if (!isConfigurationStatus(configurationStatus)) {
    throw new Error(
      `Unknown configuration status: ${String(input.configurationStatus)}`,
    );
  }

  if (input.nameReference !== undefined && !nameReference) {
    throw new Error("nameReference must not be empty when provided");
  }
  if (input.contextReference !== undefined && !contextReference) {
    throw new Error("contextReference must not be empty when provided");
  }
  if (input.valueReference !== undefined && !valueReference) {
    throw new Error("valueReference must not be empty when provided");
  }
  if (input.ownerReference !== undefined && !ownerReference) {
    throw new Error("ownerReference must not be empty when provided");
  }
  if (
    input.parentConfigurationReference !== undefined &&
    !parentConfigurationReference
  ) {
    throw new Error(
      "parentConfigurationReference must not be empty when provided",
    );
  }

  if (boundTenant !== undefined && tenantReference !== boundTenant) {
    throw new Error("configuration does not apply to this tenant");
  }

  const providedReference = input.configurationReference?.trim() ?? "";
  if (input.configurationReference !== undefined && !providedReference) {
    throw new Error(
      "configurationReference must not be empty when provided",
    );
  }

  const configurationKind: ConfigurationKind = input.configurationKind;
  const configurationReference =
    providedReference || allocateConfigurationReference();

  return {
    configurationReference,
    tenantReference,
    configurationKind,
    configurationStatus,
    ...(nameReference !== undefined && nameReference.length > 0
      ? { nameReference }
      : {}),
    ...(contextReference !== undefined && contextReference.length > 0
      ? { contextReference }
      : {}),
    ...(valueReference !== undefined && valueReference.length > 0
      ? { valueReference }
      : {}),
    ...(ownerReference !== undefined && ownerReference.length > 0
      ? { ownerReference }
      : {}),
    ...(parentConfigurationReference !== undefined &&
    parentConfigurationReference.length > 0
      ? { parentConfigurationReference }
      : {}),
    ...(input.metadata !== undefined ? { metadata: input.metadata } : {}),
  };
}

function allocateConfigurationReference(): string {
  configurationSequence += 1;
  return `configuration-${configurationSequence}`;
}

/** Test helper — reset opaque id sequence. */
export function resetConfigurationReferenceSequence(): void {
  configurationSequence = 0;
}
