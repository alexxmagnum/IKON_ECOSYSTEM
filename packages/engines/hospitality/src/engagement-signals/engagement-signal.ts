/**
 * Hospitality Engagement Signal — observable contextual fact only.
 * Bridge only: Engagement → Signal → Rule → Suggestion → future Copilot.
 *
 * Distinct from Rule (criterion), Suggestion (proposal), and Action (something that occurs).
 * A signal states that something was observed — it does not interpret or decide.
 *
 * @see DEC-HOSPITALITY-ENGAGEMENT-SIGNAL-CONTEXT-001
 */

/** Internal engagement-signal kinds — observable fact modes, not interpretations. */
export const ENGAGEMENT_SIGNAL_KINDS = {
  /** Observable fact about person–business relationship. */
  Engagement: "signal.engagement",
  /** Observable fact about activities. */
  Activity: "signal.activity",
  /** Observable fact about community. */
  Community: "signal.community",
  /** Observable fact about members. */
  Member: "signal.member",
  /** Observable fact about business opportunities. */
  Business: "signal.business",
  /** Observable fact about visitor experience. */
  Experience: "signal.experience",
  /** Internal MotanOS hospitality engagement signal. */
  Internal: "signal.internal",
} as const;

export type EngagementSignalKind =
  (typeof ENGAGEMENT_SIGNAL_KINDS)[keyof typeof ENGAGEMENT_SIGNAL_KINDS];

export const ENGAGEMENT_SIGNAL_KIND_VALUES = Object.values(
  ENGAGEMENT_SIGNAL_KINDS,
) as readonly EngagementSignalKind[];

/** Engagement-signal lifecycle status (existence labels only — no interpretation). */
export const ENGAGEMENT_SIGNAL_STATUSES = {
  Draft: "draft",
  Observed: "observed",
  Active: "active",
  Processed: "processed",
  Inactive: "inactive",
  Archived: "archived",
  Cancelled: "cancelled",
} as const;

export type EngagementSignalStatus =
  (typeof ENGAGEMENT_SIGNAL_STATUSES)[keyof typeof ENGAGEMENT_SIGNAL_STATUSES];

export const ENGAGEMENT_SIGNAL_STATUS_VALUES = Object.values(
  ENGAGEMENT_SIGNAL_STATUSES,
) as readonly EngagementSignalStatus[];

/**
 * Opaque hospitality engagement signal — contextual fact existence only.
 * Represents that something was observed within a Hospitality.
 * No metrics, rankings, priorities, proposals, verdicts, or side-effect payloads.
 */
export type HospitalityEngagementSignal = {
  /** Opaque unique signal reference. */
  signalReference: string;
  /** Internal engagement-signal kind. */
  signalKind: EngagementSignalKind;
  /** Engagement-signal status. */
  signalStatus: EngagementSignalStatus;
  /** Opaque hospitality business pointer when known. */
  hospitalityReference?: string;
  /** Opaque engagement pointer when known. */
  engagementReference?: string;
  /** Opaque member pointer when known. */
  memberReference?: string;
  /** Opaque community pointer when known. */
  communityReference?: string;
  /** Opaque activity pointer when known. */
  activityReference?: string;
  /** Opaque suggestion pointer when known. */
  suggestionReference?: string;
  /** Opaque rule pointer when known. */
  ruleReference?: string;
  /** Opaque context pointer when known. */
  contextReference?: string;
  /** Opaque source pointer when known. */
  sourceReference?: string;
  /** Controlled optional metadata — never secrets or PII. */
  metadata?: Record<string, unknown>;
};

/**
 * Outbound port for future engagement-signal adapters.
 * Not wired in this foundation — existence create/resolve only.
 */
export interface EngagementSignalPort {
  createSignal(
    input: CreateEngagementSignalInput,
  ): Promise<HospitalityEngagementSignal>;
  resolveSignal(
    signal: HospitalityEngagementSignal,
  ): Promise<HospitalityEngagementSignal>;
}

export type CreateEngagementSignalInput = {
  signalKind: EngagementSignalKind;
  signalStatus?: EngagementSignalStatus;
  signalReference?: string;
  hospitalityReference?: string;
  engagementReference?: string;
  memberReference?: string;
  communityReference?: string;
  activityReference?: string;
  suggestionReference?: string;
  ruleReference?: string;
  contextReference?: string;
  sourceReference?: string;
  metadata?: Record<string, unknown>;
};

export function isEngagementSignalKind(
  value: string,
): value is EngagementSignalKind {
  return (ENGAGEMENT_SIGNAL_KIND_VALUES as readonly string[]).includes(value);
}

export function isEngagementSignalStatus(
  value: string,
): value is EngagementSignalStatus {
  return (ENGAGEMENT_SIGNAL_STATUS_VALUES as readonly string[]).includes(
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

export function isHospitalityEngagementSignal(
  value: unknown,
): value is HospitalityEngagementSignal {
  if (value === null || typeof value !== "object") {
    return false;
  }
  const candidate = value as Record<string, unknown>;
  return (
    typeof candidate.signalReference === "string" &&
    candidate.signalReference.length > 0 &&
    optionalOpaqueOk(candidate, "hospitalityReference") &&
    optionalOpaqueOk(candidate, "engagementReference") &&
    optionalOpaqueOk(candidate, "memberReference") &&
    optionalOpaqueOk(candidate, "communityReference") &&
    optionalOpaqueOk(candidate, "activityReference") &&
    optionalOpaqueOk(candidate, "suggestionReference") &&
    optionalOpaqueOk(candidate, "ruleReference") &&
    optionalOpaqueOk(candidate, "contextReference") &&
    optionalOpaqueOk(candidate, "sourceReference") &&
    typeof candidate.signalKind === "string" &&
    isEngagementSignalKind(candidate.signalKind) &&
    typeof candidate.signalStatus === "string" &&
    isEngagementSignalStatus(candidate.signalStatus)
  );
}

export function isEngagementSignalPort(
  value: unknown,
): value is EngagementSignalPort {
  return (
    value !== null &&
    typeof value === "object" &&
    typeof (value as EngagementSignalPort).createSignal === "function" &&
    typeof (value as EngagementSignalPort).resolveSignal === "function"
  );
}
