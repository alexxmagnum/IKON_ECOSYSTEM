import type {
  CreateTemplateInput,
  Template,
  TemplateKind,
  TemplateStatus,
} from "./template";
import {
  TEMPLATE_MEDIA_REF_KEY,
  TEMPLATE_STATUSES,
  isTemplateKind,
  isTemplateStatus,
} from "./template";

let templateSequence = 0;

export interface CreateTemplateOptions {
  /**
   * When set, template may only be created for this tenant
   * (cross-tenant scope lock).
   */
  tenantReference?: string;
}

/**
 * Build a checked Template (in-memory — reusable structure existence only).
 * Does not open vendor sessions or run draw / ship / build flows.
 */
export function createTemplate(
  input: CreateTemplateInput,
  options: CreateTemplateOptions = {},
): Template {
  const tenantReference = input.tenantReference?.trim() ?? "";
  const nameReference = input.nameReference?.trim();
  const descriptionReference = input.descriptionReference?.trim();
  const contextReference = input.contextReference?.trim();
  const ownerReference = input.ownerReference?.trim();
  const parentTemplateReference = input.parentTemplateReference?.trim();
  const mediaRaw = input[TEMPLATE_MEDIA_REF_KEY];
  const mediaReference =
    typeof mediaRaw === "string" ? mediaRaw.trim() : undefined;
  const boundTenant = options.tenantReference?.trim() || undefined;

  if (!tenantReference) {
    throw new Error("tenantReference is required");
  }
  if (!isTemplateKind(input.templateKind)) {
    throw new Error(`Unknown template kind: ${String(input.templateKind)}`);
  }

  const templateStatus: TemplateStatus =
    input.templateStatus ?? TEMPLATE_STATUSES.Draft;
  if (!isTemplateStatus(templateStatus)) {
    throw new Error(
      `Unknown template status: ${String(input.templateStatus)}`,
    );
  }

  if (input.nameReference !== undefined && !nameReference) {
    throw new Error("nameReference must not be empty when provided");
  }
  if (input.descriptionReference !== undefined && !descriptionReference) {
    throw new Error("descriptionReference must not be empty when provided");
  }
  if (input.contextReference !== undefined && !contextReference) {
    throw new Error("contextReference must not be empty when provided");
  }
  if (input.ownerReference !== undefined && !ownerReference) {
    throw new Error("ownerReference must not be empty when provided");
  }
  if (
    input.parentTemplateReference !== undefined &&
    !parentTemplateReference
  ) {
    throw new Error(
      "parentTemplateReference must not be empty when provided",
    );
  }
  if (mediaRaw !== undefined && !mediaReference) {
    throw new Error(
      `${TEMPLATE_MEDIA_REF_KEY} must not be empty when provided`,
    );
  }

  if (boundTenant !== undefined && tenantReference !== boundTenant) {
    throw new Error("template does not apply to this tenant");
  }

  const providedReference = input.templateReference?.trim() ?? "";
  if (input.templateReference !== undefined && !providedReference) {
    throw new Error("templateReference must not be empty when provided");
  }

  const templateKind: TemplateKind = input.templateKind;
  const templateReference =
    providedReference || allocateTemplateReference();

  return {
    templateReference,
    tenantReference,
    templateKind,
    templateStatus,
    ...(nameReference !== undefined && nameReference.length > 0
      ? { nameReference }
      : {}),
    ...(descriptionReference !== undefined && descriptionReference.length > 0
      ? { descriptionReference }
      : {}),
    ...(contextReference !== undefined && contextReference.length > 0
      ? { contextReference }
      : {}),
    ...(ownerReference !== undefined && ownerReference.length > 0
      ? { ownerReference }
      : {}),
    ...(parentTemplateReference !== undefined &&
    parentTemplateReference.length > 0
      ? { parentTemplateReference }
      : {}),
    ...(mediaReference !== undefined && mediaReference.length > 0
      ? { [TEMPLATE_MEDIA_REF_KEY]: mediaReference }
      : {}),
    ...(input.metadata !== undefined ? { metadata: input.metadata } : {}),
  };
}

function allocateTemplateReference(): string {
  templateSequence += 1;
  return `template-${templateSequence}`;
}

/** Test helper — reset opaque id sequence. */
export function resetTemplateReferenceSequence(): void {
  templateSequence = 0;
}
