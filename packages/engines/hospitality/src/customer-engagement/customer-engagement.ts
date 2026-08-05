/**
 * Hospitality Customer Engagement — active relationship with a hospitality business.
 * Bridge only: Experience / Interaction → Engagement → Community → future Loyalty.
 *
 * Distinct from Loyalty / Gamification / Marketing campaigns.
 *
 * @see DEC-HOSPITALITY-CUSTOMER-ENGAGEMENT-CONTEXT-001
 */

/** Internal customer-engagement kinds — relationship modes, not loyalty tiers. */
export const CUSTOMER_ENGAGEMENT_KINDS = {
  /** Person discovering the ecosystem. */
  Discovery: "engagement.discovery",
  /** Direct interaction (QR, response, information). */
  Interaction: "engagement.interaction",
  /** Relationship with community. */
  Community: "engagement.community",
  /** Relationship with activities. */
  Activity: "engagement.activity",
  /** Continued relationship (frequent guest, active member). */
  Relationship: "engagement.relationship",
  /** Internal MotanOS hospitality engagement. */
  Internal: "engagement.internal",
} as const;

export type CustomerEngagementKind =
  (typeof CUSTOMER_ENGAGEMENT_KINDS)[keyof typeof CUSTOMER_ENGAGEMENT_KINDS];

export const CUSTOMER_ENGAGEMENT_KIND_VALUES = Object.values(
  CUSTOMER_ENGAGEMENT_KINDS,
) as readonly CustomerEngagementKind[];

/** Customer-engagement lifecycle status (existence labels only — no incentive payloads). */
export const CUSTOMER_ENGAGEMENT_STATUSES = {
  Draft: "draft",
  Available: "available",
  Active: "active",
  Paused: "paused",
  Completed: "completed",
  Archived: "archived",
  Cancelled: "cancelled",
} as const;

export type CustomerEngagementStatus =
  (typeof CUSTOMER_ENGAGEMENT_STATUSES)[keyof typeof CUSTOMER_ENGAGEMENT_STATUSES];

export const CUSTOMER_ENGAGEMENT_STATUS_VALUES = Object.values(
  CUSTOMER_ENGAGEMENT_STATUSES,
) as readonly CustomerEngagementStatus[];

/**
 * Opaque hospitality customer engagement — relationship existence only.
 * Links person, community, and business without loyalty payloads.
 * No metric fields, incentive fields, tier fields, or campaign payloads.
 */
export type HospitalityCustomerEngagement = {
  /** Opaque unique engagement reference. */
  engagementReference: string;
  /** Internal customer-engagement kind. */
  engagementKind: CustomerEngagementKind;
  /** Customer-engagement status. */
  engagementStatus: CustomerEngagementStatus;
  /** Opaque hospitality business pointer when known. */
  hospitalityReference?: string;
  /** Opaque community pointer when known. */
  communityReference?: string;
  /** Opaque actor pointer when known. */
  actorReference?: string;
  /** Opaque member pointer when known. */
  memberReference?: string;
  /** Opaque interaction pointer when known. */
  interactionReference?: string;
  /** Opaque activity pointer when known. */
  activityReference?: string;
  /** Opaque participation pointer when known. */
  participationReference?: string;
  /** Opaque parent engagement pointer when nested. */
  parentEngagementReference?: string;
  /** Controlled optional metadata — never secrets or PII. */
  metadata?: Record<string, unknown>;
};

/**
 * Outbound port for future customer-engagement adapters.
 * Not wired in this foundation — existence create/resolve only.
 */
export interface CustomerEngagementPort {
  createEngagement(
    input: CreateCustomerEngagementInput,
  ): Promise<HospitalityCustomerEngagement>;
  resolveEngagement(
    engagement: HospitalityCustomerEngagement,
  ): Promise<HospitalityCustomerEngagement>;
}

export type CreateCustomerEngagementInput = {
  engagementKind: CustomerEngagementKind;
  engagementStatus?: CustomerEngagementStatus;
  engagementReference?: string;
  hospitalityReference?: string;
  communityReference?: string;
  actorReference?: string;
  memberReference?: string;
  interactionReference?: string;
  activityReference?: string;
  participationReference?: string;
  parentEngagementReference?: string;
  metadata?: Record<string, unknown>;
};

export function isCustomerEngagementKind(
  value: string,
): value is CustomerEngagementKind {
  return (CUSTOMER_ENGAGEMENT_KIND_VALUES as readonly string[]).includes(value);
}

export function isCustomerEngagementStatus(
  value: string,
): value is CustomerEngagementStatus {
  return (CUSTOMER_ENGAGEMENT_STATUS_VALUES as readonly string[]).includes(
    value,
  );
}

function optionalOpaqueOk(
  candidate: Record<string, unknown>,
  key: string,
): boolean {
  const raw = candidate[key];
  return (
    raw === undefined || (typeof raw === "string" && raw.length > 0)
  );
}

export function isHospitalityCustomerEngagement(
  value: unknown,
): value is HospitalityCustomerEngagement {
  if (value === null || typeof value !== "object") {
    return false;
  }
  const candidate = value as Record<string, unknown>;
  return (
    typeof candidate.engagementReference === "string" &&
    candidate.engagementReference.length > 0 &&
    optionalOpaqueOk(candidate, "hospitalityReference") &&
    optionalOpaqueOk(candidate, "communityReference") &&
    optionalOpaqueOk(candidate, "actorReference") &&
    optionalOpaqueOk(candidate, "memberReference") &&
    optionalOpaqueOk(candidate, "interactionReference") &&
    optionalOpaqueOk(candidate, "activityReference") &&
    optionalOpaqueOk(candidate, "participationReference") &&
    optionalOpaqueOk(candidate, "parentEngagementReference") &&
    typeof candidate.engagementKind === "string" &&
    isCustomerEngagementKind(candidate.engagementKind) &&
    typeof candidate.engagementStatus === "string" &&
    isCustomerEngagementStatus(candidate.engagementStatus)
  );
}

export function isCustomerEngagementPort(
  value: unknown,
): value is CustomerEngagementPort {
  return (
    value !== null &&
    typeof value === "object" &&
    typeof (value as CustomerEngagementPort).createEngagement === "function" &&
    typeof (value as CustomerEngagementPort).resolveEngagement === "function"
  );
}
