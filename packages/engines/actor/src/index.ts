/**
 * @motanos/actor — Actor Boundary foundation.
 *
 * MotanOS Core → Shared packages → @motanos/actor
 *
 * Actor = who participates in a domain act (“who acts”).
 * Must not depend on existence-record packages, proof-scheme packages,
 * presence packages, belonging packages, capacity packages, or process engines.
 *
 * @see DEC-ACTOR-BOUNDARY-001
 */

export const ACTOR_BOUNDARY = "@motanos/actor" as const;

export type {
  CreateActorInput,
  CreateActorOptions,
  Actor,
  ActorKind,
  ActorPort,
  ActorStatus,
} from "./actors";
export {
  ACTOR_KINDS,
  ACTOR_KIND_VALUES,
  ACTOR_STATUSES,
  ACTOR_STATUS_VALUES,
  ACTOR_WHO_REF_KEY,
  createActor,
  isActor,
  isActorKind,
  isActorPort,
  isActorStatus,
  resetActorReferenceSequence,
} from "./actors";
