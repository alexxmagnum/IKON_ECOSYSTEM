import type { ParticipantReference } from "./connection";
import type { GroupStatus, GroupVisibility } from "../types";

export type SocialGroupId = string;

/**
 * Opaque link to a consuming aggregate when a group is contextual.
 * Social never imports domain packages.
 */
export interface ConsumerReference {
  kind: string;
  id: string;
}

/**
 * Social grouping / community container (GROUP entity).
 * Domain-specific meaning (sport, dining, competition) stays outside this engine.
 */
export interface SocialGroup {
  id: SocialGroupId;
  name: string;
  description?: string;
  visibility: GroupVisibility;
  status: GroupStatus;
  /** Optional creator — opaque participant ref. */
  creatorReference?: ParticipantReference;
  consumerReference?: ConsumerReference;
  metadata?: Record<string, unknown>;
  createdAt?: string;
  updatedAt?: string;
}
