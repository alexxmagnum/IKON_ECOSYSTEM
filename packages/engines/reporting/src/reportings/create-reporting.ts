import type {
  CreateReportingInput,
  Reporting,
  ReportingKind,
  ReportingStatus,
} from "./reporting";
import {
  REPORTING_CAPACITY_REF_KEY,
  REPORTING_STATUSES,
  isReportingKind,
  isReportingStatus,
} from "./reporting";

let reportingSequence = 0;

export interface CreateReportingOptions {
  /**
   * When set, reporting may only be created for this ambit
   * (cross-context isolation).
   */
  contextReference?: string;
}

/**
 * Build a checked Reporting (in-memory — information representation only).
 * Does not generate files, present boards, or send outbound material.
 */
export function createReporting(
  input: CreateReportingInput,
  options: CreateReportingOptions = {},
): Reporting {
  const contextReference = input.contextReference?.trim();
  const actorReference = input.actorReference?.trim();
  const entityReference = input.entityReference?.trim();
  const entityKind = input.entityKind?.trim();
  const capacityRaw = input[REPORTING_CAPACITY_REF_KEY];
  const capacityReference =
    typeof capacityRaw === "string" ? capacityRaw.trim() : undefined;
  const measurementReference = input.measurementReference?.trim();
  const eventReference = input.eventReference?.trim();
  const templateReference = input.templateReference?.trim();
  const parentReportingReference = input.parentReportingReference?.trim();
  const boundContext = options.contextReference?.trim() || undefined;

  if (!isReportingKind(input.reportingKind)) {
    throw new Error(
      `Unknown reporting kind: ${String(input.reportingKind)}`,
    );
  }

  const reportingStatus: ReportingStatus =
    input.reportingStatus ?? REPORTING_STATUSES.Draft;
  if (!isReportingStatus(reportingStatus)) {
    throw new Error(
      `Unknown reporting status: ${String(input.reportingStatus)}`,
    );
  }

  if (input.contextReference !== undefined && !contextReference) {
    throw new Error("contextReference must not be empty when provided");
  }
  if (input.actorReference !== undefined && !actorReference) {
    throw new Error("actorReference must not be empty when provided");
  }
  if (input.entityReference !== undefined && !entityReference) {
    throw new Error("entityReference must not be empty when provided");
  }
  if (input.entityKind !== undefined && !entityKind) {
    throw new Error("entityKind must not be empty when provided");
  }
  if (capacityRaw !== undefined && !capacityReference) {
    throw new Error(
      `${REPORTING_CAPACITY_REF_KEY} must not be empty when provided`,
    );
  }
  if (input.measurementReference !== undefined && !measurementReference) {
    throw new Error("measurementReference must not be empty when provided");
  }
  if (input.eventReference !== undefined && !eventReference) {
    throw new Error("eventReference must not be empty when provided");
  }
  if (input.templateReference !== undefined && !templateReference) {
    throw new Error("templateReference must not be empty when provided");
  }
  if (
    input.parentReportingReference !== undefined &&
    !parentReportingReference
  ) {
    throw new Error(
      "parentReportingReference must not be empty when provided",
    );
  }

  if (
    boundContext !== undefined &&
    (contextReference === undefined || contextReference !== boundContext)
  ) {
    throw new Error("reporting does not apply to this scope");
  }

  const providedReference = input.reportingReference?.trim() ?? "";
  if (input.reportingReference !== undefined && !providedReference) {
    throw new Error("reportingReference must not be empty when provided");
  }

  const reportingKind: ReportingKind = input.reportingKind;
  const reportingReference =
    providedReference || allocateReportingReference();

  return {
    reportingReference,
    reportingKind,
    reportingStatus,
    ...(contextReference !== undefined && contextReference.length > 0
      ? { contextReference }
      : {}),
    ...(actorReference !== undefined && actorReference.length > 0
      ? { actorReference }
      : {}),
    ...(entityReference !== undefined && entityReference.length > 0
      ? { entityReference }
      : {}),
    ...(entityKind !== undefined && entityKind.length > 0
      ? { entityKind }
      : {}),
    ...(capacityReference !== undefined && capacityReference.length > 0
      ? { [REPORTING_CAPACITY_REF_KEY]: capacityReference }
      : {}),
    ...(measurementReference !== undefined && measurementReference.length > 0
      ? { measurementReference }
      : {}),
    ...(eventReference !== undefined && eventReference.length > 0
      ? { eventReference }
      : {}),
    ...(templateReference !== undefined && templateReference.length > 0
      ? { templateReference }
      : {}),
    ...(parentReportingReference !== undefined &&
    parentReportingReference.length > 0
      ? { parentReportingReference }
      : {}),
    ...(input.metadata !== undefined ? { metadata: input.metadata } : {}),
  };
}

function allocateReportingReference(): string {
  reportingSequence += 1;
  return `reporting-${reportingSequence}`;
}

/** Test helper — reset opaque id sequence. */
export function resetReportingReferenceSequence(): void {
  reportingSequence = 0;
}
