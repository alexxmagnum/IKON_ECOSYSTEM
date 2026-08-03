import type {
  Content,
  ContentKind,
  ContentStatus,
  CreateContentInput,
} from "./content";
import {
  CONTENT_MEDIA_REF_KEY,
  CONTENT_STATUSES,
  CONTENT_STRUCTURE_REF_KEY,
  isContentKind,
  isContentStatus,
} from "./content";

let contentSequence = 0;

export interface CreateContentOptions {
  /**
   * When set, content may only be created for this tenant
   * (cross-tenant scope lock).
   */
  tenantReference?: string;
}

/**
 * Build a checked Content (in-memory — reusable business information only).
 * Does not open vendor sessions or run ship / draw / build flows.
 */
export function createContent(
  input: CreateContentInput,
  options: CreateContentOptions = {},
): Content {
  const tenantReference = input.tenantReference?.trim() ?? "";
  const titleReference = input.titleReference?.trim();
  const descriptionReference = input.descriptionReference?.trim();
  const bodyReference = input.bodyReference?.trim();
  const contextReference = input.contextReference?.trim();
  const ownerReference = input.ownerReference?.trim();
  const structureRaw = input[CONTENT_STRUCTURE_REF_KEY];
  const structureReference =
    typeof structureRaw === "string" ? structureRaw.trim() : undefined;
  const mediaRaw = input[CONTENT_MEDIA_REF_KEY];
  const mediaReference =
    typeof mediaRaw === "string" ? mediaRaw.trim() : undefined;
  const boundTenant = options.tenantReference?.trim() || undefined;

  if (!tenantReference) {
    throw new Error("tenantReference is required");
  }
  if (!isContentKind(input.contentKind)) {
    throw new Error(`Unknown content kind: ${String(input.contentKind)}`);
  }

  const contentStatus: ContentStatus =
    input.contentStatus ?? CONTENT_STATUSES.Draft;
  if (!isContentStatus(contentStatus)) {
    throw new Error(
      `Unknown content status: ${String(input.contentStatus)}`,
    );
  }

  if (input.titleReference !== undefined && !titleReference) {
    throw new Error("titleReference must not be empty when provided");
  }
  if (input.descriptionReference !== undefined && !descriptionReference) {
    throw new Error("descriptionReference must not be empty when provided");
  }
  if (input.bodyReference !== undefined && !bodyReference) {
    throw new Error("bodyReference must not be empty when provided");
  }
  if (input.contextReference !== undefined && !contextReference) {
    throw new Error("contextReference must not be empty when provided");
  }
  if (input.ownerReference !== undefined && !ownerReference) {
    throw new Error("ownerReference must not be empty when provided");
  }
  if (structureRaw !== undefined && !structureReference) {
    throw new Error(
      `${CONTENT_STRUCTURE_REF_KEY} must not be empty when provided`,
    );
  }
  if (mediaRaw !== undefined && !mediaReference) {
    throw new Error(
      `${CONTENT_MEDIA_REF_KEY} must not be empty when provided`,
    );
  }

  if (boundTenant !== undefined && tenantReference !== boundTenant) {
    throw new Error("content does not apply to this tenant");
  }

  const providedReference = input.contentReference?.trim() ?? "";
  if (input.contentReference !== undefined && !providedReference) {
    throw new Error("contentReference must not be empty when provided");
  }

  const contentKind: ContentKind = input.contentKind;
  const contentReference = providedReference || allocateContentReference();

  return {
    contentReference,
    tenantReference,
    contentKind,
    contentStatus,
    ...(titleReference !== undefined && titleReference.length > 0
      ? { titleReference }
      : {}),
    ...(descriptionReference !== undefined && descriptionReference.length > 0
      ? { descriptionReference }
      : {}),
    ...(bodyReference !== undefined && bodyReference.length > 0
      ? { bodyReference }
      : {}),
    ...(contextReference !== undefined && contextReference.length > 0
      ? { contextReference }
      : {}),
    ...(ownerReference !== undefined && ownerReference.length > 0
      ? { ownerReference }
      : {}),
    ...(structureReference !== undefined && structureReference.length > 0
      ? { [CONTENT_STRUCTURE_REF_KEY]: structureReference }
      : {}),
    ...(mediaReference !== undefined && mediaReference.length > 0
      ? { [CONTENT_MEDIA_REF_KEY]: mediaReference }
      : {}),
    ...(input.metadata !== undefined ? { metadata: input.metadata } : {}),
  };
}

function allocateContentReference(): string {
  contentSequence += 1;
  return `content-${contentSequence}`;
}

/** Test helper — reset opaque id sequence. */
export function resetContentReferenceSequence(): void {
  contentSequence = 0;
}
