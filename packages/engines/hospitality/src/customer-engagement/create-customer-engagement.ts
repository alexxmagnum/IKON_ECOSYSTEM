import type {
  CreateCustomerEngagementInput,
  CustomerEngagementKind,
  CustomerEngagementStatus,
  HospitalityCustomerEngagement,
} from "./customer-engagement";
import {
  CUSTOMER_ENGAGEMENT_STATUSES,
  isCustomerEngagementKind,
  isCustomerEngagementStatus,
} from "./customer-engagement";

let customerEngagementSequence = 0;

export interface CreateCustomerEngagementOptions {
  /**
   * When set, engagement may only be created for this hospitality business
   * (cross-business isolation).
   */
  hospitalityReference?: string;
}

/**
 * Build a checked HospitalityCustomerEngagement (in-memory — relationship only).
 * Does not compute loyalty metrics, grant incentives, raise tiers, or broadcast promotions.
 */
export function createCustomerEngagement(
  input: CreateCustomerEngagementInput,
  options: CreateCustomerEngagementOptions = {},
): HospitalityCustomerEngagement {
  const hospitalityReference = input.hospitalityReference?.trim();
  const communityReference = input.communityReference?.trim();
  const actorReference = input.actorReference?.trim();
  const memberReference = input.memberReference?.trim();
  const interactionReference = input.interactionReference?.trim();
  const activityReference = input.activityReference?.trim();
  const participationReference = input.participationReference?.trim();
  const parentEngagementReference = input.parentEngagementReference?.trim();
  const boundHospitality = options.hospitalityReference?.trim() || undefined;

  if (!isCustomerEngagementKind(input.engagementKind)) {
    throw new Error(
      `Unknown customer-engagement kind: ${String(input.engagementKind)}`,
    );
  }

  const engagementStatus: CustomerEngagementStatus =
    input.engagementStatus ?? CUSTOMER_ENGAGEMENT_STATUSES.Draft;
  if (!isCustomerEngagementStatus(engagementStatus)) {
    throw new Error(
      `Unknown customer-engagement status: ${String(input.engagementStatus)}`,
    );
  }

  if (input.hospitalityReference !== undefined && !hospitalityReference) {
    throw new Error(
      "hospitalityReference must not be empty when provided",
    );
  }
  if (input.communityReference !== undefined && !communityReference) {
    throw new Error("communityReference must not be empty when provided");
  }
  if (input.actorReference !== undefined && !actorReference) {
    throw new Error("actorReference must not be empty when provided");
  }
  if (input.memberReference !== undefined && !memberReference) {
    throw new Error("memberReference must not be empty when provided");
  }
  if (input.interactionReference !== undefined && !interactionReference) {
    throw new Error(
      "interactionReference must not be empty when provided",
    );
  }
  if (input.activityReference !== undefined && !activityReference) {
    throw new Error("activityReference must not be empty when provided");
  }
  if (
    input.participationReference !== undefined &&
    !participationReference
  ) {
    throw new Error(
      "participationReference must not be empty when provided",
    );
  }
  if (
    input.parentEngagementReference !== undefined &&
    !parentEngagementReference
  ) {
    throw new Error(
      "parentEngagementReference must not be empty when provided",
    );
  }

  if (
    boundHospitality !== undefined &&
    (hospitalityReference === undefined ||
      hospitalityReference !== boundHospitality)
  ) {
    throw new Error(
      "customer engagement does not apply to this hospitality business",
    );
  }

  const providedReference = input.engagementReference?.trim() ?? "";
  if (input.engagementReference !== undefined && !providedReference) {
    throw new Error(
      "engagementReference must not be empty when provided",
    );
  }

  const engagementKind: CustomerEngagementKind = input.engagementKind;
  const engagementReference =
    providedReference || allocateCustomerEngagementReference();

  return {
    engagementReference,
    engagementKind,
    engagementStatus,
    ...(hospitalityReference !== undefined && hospitalityReference.length > 0
      ? { hospitalityReference }
      : {}),
    ...(communityReference !== undefined && communityReference.length > 0
      ? { communityReference }
      : {}),
    ...(actorReference !== undefined && actorReference.length > 0
      ? { actorReference }
      : {}),
    ...(memberReference !== undefined && memberReference.length > 0
      ? { memberReference }
      : {}),
    ...(interactionReference !== undefined &&
    interactionReference.length > 0
      ? { interactionReference }
      : {}),
    ...(activityReference !== undefined && activityReference.length > 0
      ? { activityReference }
      : {}),
    ...(participationReference !== undefined &&
    participationReference.length > 0
      ? { participationReference }
      : {}),
    ...(parentEngagementReference !== undefined &&
    parentEngagementReference.length > 0
      ? { parentEngagementReference }
      : {}),
    ...(input.metadata !== undefined ? { metadata: input.metadata } : {}),
  };
}

function allocateCustomerEngagementReference(): string {
  customerEngagementSequence += 1;
  return `customer-engagement-${customerEngagementSequence}`;
}

/** Test helper — reset opaque id sequence. */
export function resetCustomerEngagementReferenceSequence(): void {
  customerEngagementSequence = 0;
}
