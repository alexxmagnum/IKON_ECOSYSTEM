/**
 * @motanos/domain-golf — Golf Domain Module foundation.
 *
 * MotanOS Core → Shared Engines → Domain Modules → Golf
 *
 * Consumes Booking and Payments types. Does not implement those engines.
 * Must not depend on customer branding packages, auth, database, or gateways.
 */

export const GOLF_DOMAIN = "@motanos/domain-golf" as const;

export type { GolfCourse, GolfCourseId, Hole, HoleId } from "./domain/course";
export type { GolfPlayer, GolfPlayerId, UserRef } from "./domain/player";
export type {
  GolfRound,
  GolfRoundId,
  TournamentRef,
} from "./domain/round";

export type { GolfRoundFinalStatus, GolfRoundStatus } from "./types";
export {
  canTransitionGolfRound,
  GOLF_ROUND_FINAL_STATUSES,
  GOLF_ROUND_STATUSES,
  GOLF_ROUND_TRANSITIONS,
  isGolfRoundFinal,
  isGolfRoundStatus,
} from "./types";

export type {
  AttachBookingReferenceInput,
  AttachPaymentReferenceInput,
  CreateGolfCourseInput,
  CreateGolfRoundInput,
  GolfCourseResult,
  GolfRoundResult,
  ListGolfRoundsQuery,
  UpdateGolfCourseInput,
  UpdateGolfRoundStatusInput,
} from "./contracts";

export type { GolfCourseService, GolfRoundService } from "./services";
