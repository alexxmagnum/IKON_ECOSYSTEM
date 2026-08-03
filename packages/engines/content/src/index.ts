/**
 * @motanos/content — Content Engine foundation.
 *
 * MotanOS Core → Shared Engines → @motanos/content
 *
 * Content = reusable business information for a context.
 * Must not depend on structure packages, media packages, locale packages,
 * offer packages, step packages, signal packages, compute vendors,
 * or persistence vendors.
 *
 * @see DEC-CONTENT-BOUNDARY-001
 */

export const CONTENT_ENGINE = "@motanos/content" as const;

export type {
  Content,
  ContentKind,
  ContentPort,
  ContentStatus,
  CreateContentInput,
  CreateContentOptions,
} from "./contents";
export {
  CONTENT_KINDS,
  CONTENT_KIND_VALUES,
  CONTENT_MEDIA_REF_KEY,
  CONTENT_STATUSES,
  CONTENT_STATUS_VALUES,
  CONTENT_STRUCTURE_REF_KEY,
  createContent,
  isContent,
  isContentKind,
  isContentPort,
  isContentStatus,
  resetContentReferenceSequence,
} from "./contents";
