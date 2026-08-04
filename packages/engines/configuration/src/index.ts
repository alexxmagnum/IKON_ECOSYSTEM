/**
 * @motanos/configuration — Configuration Boundary foundation.
 *
 * MotanOS Core → Shared packages → @motanos/configuration
 *
 * Configuration = declarative settings existence for a business context.
 * Must not depend on process packages, constraint packages, capacity packages,
 * vault packages, or persistence vendors.
 *
 * Distinct from shared `@motanos/config` tooling package.
 *
 * @see DEC-CONFIGURATION-BOUNDARY-001
 */

export const CONFIGURATION_BOUNDARY = "@motanos/configuration" as const;

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
