/**
 * @motanos/resource — Resource Engine foundation.
 *
 * MotanOS Core → Shared Engines → @motanos/resource
 *
 * Resource = operational unit existence for a business context.
 * Must not depend on hold packages, open-slot packages, timeline packages,
 * collect packages, trade packages, value packages, item packages,
 * stock packages, compute vendors, or persistence vendors.
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
  RESOURCE_ITEM_REF_KEY,
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
