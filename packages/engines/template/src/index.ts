/**
 * @motanos/template — Template Engine foundation.
 *
 * MotanOS Core → Shared Engines → @motanos/template
 *
 * Template = reusable structure existence for a context.
 * Must not depend on offer packages, step packages, signal packages,
 * relation packages, compute vendors, or persistence vendors.
 *
 * @see DEC-TEMPLATE-BOUNDARY-001
 */

export const TEMPLATE_ENGINE = "@motanos/template" as const;

export type {
  CreateTemplateInput,
  CreateTemplateOptions,
  Template,
  TemplateKind,
  TemplatePort,
  TemplateStatus,
} from "./templates";
export {
  TEMPLATE_KINDS,
  TEMPLATE_KIND_VALUES,
  TEMPLATE_MEDIA_REF_KEY,
  TEMPLATE_STATUSES,
  TEMPLATE_STATUS_VALUES,
  createTemplate,
  isTemplate,
  isTemplateKind,
  isTemplatePort,
  isTemplateStatus,
  resetTemplateReferenceSequence,
} from "./templates";
