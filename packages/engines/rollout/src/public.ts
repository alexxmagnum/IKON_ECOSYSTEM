/**
 * @motanos/rollout — Rollout Boundary foundation.
 *
 * MotanOS Core → Shared packages → @motanos/rollout
 *
 * Rollout = what distribution strategy exists.
 * Must not depend on capacity packages, trial packages,
 * or live technical distribution engines.
 *
 * @see DEC-ROLLOUT-BOUNDARY-001
 */

export const ROLLOUT_BOUNDARY = "@motanos/rollout" as const;

export type {
  CreateRolloutInput,
  CreateRolloutOptions,
  Rollout,
  RolloutKind,
  RolloutPort,
  RolloutStatus,
} from "./rollout/mod";
export {
  ROLLOUT_CAPACITY_REF_KEY,
  ROLLOUT_KINDS,
  ROLLOUT_KIND_VALUES,
  ROLLOUT_SETTINGS_REF_KEY,
  ROLLOUT_STATUSES,
  ROLLOUT_STATUS_VALUES,
  ROLLOUT_TRIAL_REF_KEY,
  createRollout,
  isRollout,
  isRolloutKind,
  isRolloutPort,
  isRolloutStatus,
  resetRolloutReferenceSequence,
} from "./rollout/mod";
