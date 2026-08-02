/**
 * Discovery / Recommendation statuses (DEC-DISCOVERY-002 — provisional).
 * No official RECOMMENDATION machine in docs/rules/state-machines.md yet.
 * Aligned with docs/50_RECOMMENDATION_ENGINE principles (BR-0134 / BR-0135).
 */

export const RECOMMENDATION_STATUSES = [
  "Pending",
  "Active",
  "Accepted",
  "Rejected",
  "Expired",
] as const;

export type RecommendationStatus = (typeof RECOMMENDATION_STATUSES)[number];

export const RECOMMENDATION_FINAL_STATUSES = [
  "Accepted",
  "Rejected",
  "Expired",
] as const satisfies readonly RecommendationStatus[];

export type RecommendationFinalStatus =
  (typeof RECOMMENDATION_FINAL_STATUSES)[number];

export const PREFERENCE_STATUSES = ["Active", "Disabled"] as const;

export type PreferenceStatus = (typeof PREFERENCE_STATUSES)[number];

export function isRecommendationStatus(
  value: string,
): value is RecommendationStatus {
  return (RECOMMENDATION_STATUSES as readonly string[]).includes(value);
}

export function isPreferenceStatus(value: string): value is PreferenceStatus {
  return (PREFERENCE_STATUSES as readonly string[]).includes(value);
}

export function isRecommendationFinal(
  status: RecommendationStatus,
): boolean {
  return (
    RECOMMENDATION_FINAL_STATUSES as readonly RecommendationStatus[]
  ).includes(status);
}

/** Valid recommendation status transitions (foundation — no workflow engine). */
export const RECOMMENDATION_TRANSITIONS: ReadonlyArray<{
  from: RecommendationStatus;
  to: RecommendationStatus;
}> = [
  { from: "Pending", to: "Active" },
  { from: "Pending", to: "Expired" },
  { from: "Pending", to: "Rejected" },
  { from: "Active", to: "Accepted" },
  { from: "Active", to: "Rejected" },
  { from: "Active", to: "Expired" },
];

export function canTransitionRecommendation(
  from: RecommendationStatus,
  to: RecommendationStatus,
): boolean {
  if (isRecommendationFinal(from)) {
    return false;
  }
  return RECOMMENDATION_TRANSITIONS.some(
    (edge) => edge.from === from && edge.to === to,
  );
}
