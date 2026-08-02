/**
 * @motanos/resource — Resource Engine foundation.
 *
 * MotanOS Core → Shared Engines → @motanos/resource
 *
 * Resource = usable capacity. Booking = usage intent.
 * Must not depend on booking, availability, payment vendors, or persistence.
 *
 * @see DEC-RESOURCE-BOUNDARY-001
 */

export const RESOURCE_ENGINE = "@motanos/resource" as const;

export type {
  CreateResourceInput,
  CreateResourceOptions,
  Resource,
  ResourceKind,
  ResourcePort,
  ResourceStatus,
} from "./resources";
export {
  RESOURCE_KINDS,
  RESOURCE_KIND_VALUES,
  RESOURCE_STATUSES,
  RESOURCE_STATUS_VALUES,
  createResource,
  isResource,
  isResourceKind,
  isResourcePort,
  isResourceStatus,
  resetResourceReferenceSequence,
} from "./resources";
