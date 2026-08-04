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
   * (cross-tenant scope lock).
   */
  tenantReference?: string;
}

/**
 * Build a checked Configuration (in-memory — settings existence only).
 * Does not interpret values, open vaults, or load deploy settings.
 */
export function createConfiguration(
  input: CreateConfigurationInput,
  options: CreateConfigurationOptions = {},
): Configuration {
  const tenantReference = input.tenantReference?.trim() ?? "";
  const contextReference = input.contextReference?.trim();
  const entityReference = input.entityReference?.trim();
  const entityKind = input.entityKind?.trim();
  const scopeReference = input.scopeReference?.trim();
  const keyReference = input.keyReference?.trim();
  const valueReference = input.valueReference?.trim();
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

  if (input.contextReference !== undefined && !contextReference) {
    throw new Error("contextReference must not be empty when provided");
  }
  if (input.entityReference !== undefined && !entityReference) {
    throw new Error("entityReference must not be empty when provided");
  }
  if (input.entityKind !== undefined && !entityKind) {
    throw new Error("entityKind must not be empty when provided");
  }
  if (input.scopeReference !== undefined && !scopeReference) {
    throw new Error("scopeReference must not be empty when provided");
  }
  if (input.keyReference !== undefined && !keyReference) {
    throw new Error("keyReference must not be empty when provided");
  }
  if (input.valueReference !== undefined && !valueReference) {
    throw new Error("valueReference must not be empty when provided");
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
    ...(contextReference !== undefined && contextReference.length > 0
      ? { contextReference }
      : {}),
    ...(entityReference !== undefined && entityReference.length > 0
      ? { entityReference }
      : {}),
    ...(entityKind !== undefined && entityKind.length > 0
      ? { entityKind }
      : {}),
    ...(scopeReference !== undefined && scopeReference.length > 0
      ? { scopeReference }
      : {}),
    ...(keyReference !== undefined && keyReference.length > 0
      ? { keyReference }
      : {}),
    ...(valueReference !== undefined && valueReference.length > 0
      ? { valueReference }
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
