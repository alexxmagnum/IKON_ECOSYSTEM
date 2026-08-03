/**
 * @motanos/preference — Preference Engine foundation.
 *
 * MotanOS Core → Shared Engines → @motanos/preference
 *
 * Preference = declared preferences for a given context.
 * Actor packages own who the actor is; relation packages own ties;
 * suggestion packages own what to suggest; signal packages own what occurs.
 *
 * Must not depend on actor packages, relation packages, suggestion packages,
 * signal packages, settings packages, compute vendors, or persistence vendors.
 *
 * @see DEC-PREFERENCE-BOUNDARY-001
 */

export const PREFERENCE_ENGINE = "@motanos/preference" as const;

export type {
  CreatePreferenceInput,
  CreatePreferenceOptions,
  Preference,
  PreferenceKind,
  PreferencePort,
  PreferenceStatus,
} from "./preferences";
export {
  PREFERENCE_KINDS,
  PREFERENCE_KIND_VALUES,
  PREFERENCE_STATUSES,
  PREFERENCE_STATUS_VALUES,
  createPreference,
  isPreference,
  isPreferenceKind,
  isPreferencePort,
  isPreferenceStatus,
  resetPreferenceReferenceSequence,
} from "./preferences";
