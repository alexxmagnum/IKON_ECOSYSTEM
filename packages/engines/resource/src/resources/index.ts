export type {
  CreateResourceInput,
  Resource,
  ResourceKind,
  ResourcePort,
  ResourceStatus,
} from "./resource";
export {
  RESOURCE_ITEM_REF_KEY,
  RESOURCE_KINDS,
  RESOURCE_KIND_VALUES,
  RESOURCE_STATUSES,
  RESOURCE_STATUS_VALUES,
  isResource,
  isResourceKind,
  isResourcePort,
  isResourceStatus,
} from "./resource";
export type { CreateResourceOptions } from "./create-resource";
export {
  createResource,
  resetResourceReferenceSequence,
} from "./create-resource";
