/**
 * @motanos/configuration — Configuration Engine foundation.
 *
 * MotanOS Core → Shared Engines → @motanos/configuration
 *
 * Configuration = contextual / tenant-scoped configurable values.
 * Domain engines own behaviour; flag providers and deploy settings live elsewhere.
 *
 * Must not depend on policy, process orchestration, access-control packages,
 * persistence vendors, or external config services.
 *
 * Distinct from shared `@motanos/config` tooling package.
 *
 * @see DEC-CONFIGURATION-BOUNDARY-001
 */

export const CONFIGURATION_ENGINE = "@motanos/configuration" as const;

export type {
  Configuration,
  ConfigurationKind,
  ConfigurationPort,
  ConfigurationStatus,
  CreateConfigurationInput,
  CreateConfigurationOptions,
} from "./configurations";
export {
  CONFIGURATION_KINDS,
  CONFIGURATION_KIND_VALUES,
  CONFIGURATION_STATUSES,
  CONFIGURATION_STATUS_VALUES,
  createConfiguration,
  isConfiguration,
  isConfigurationKind,
  isConfigurationPort,
  isConfigurationStatus,
  resetConfigurationReferenceSequence,
} from "./configurations";
