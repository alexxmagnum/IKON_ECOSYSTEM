/**
 * @motanos/domain-tournaments — Tournament Domain Module foundation.
 *
 * MotanOS Core → Shared Engines → Domain Modules → Tournament
 *
 * Composes Golf, Events, Members, Booking, and Payments via typed references.
 * Must not depend on auth, database, permissions, branding, or gateways.
 */

export const TOURNAMENTS_DOMAIN = "@motanos/domain-tournaments" as const;

export type {
  TournamentCategory,
  TournamentCategoryId,
} from "./domain/category";

export type {
  Tournament,
  TournamentId,
  TournamentPhase,
  TournamentPhaseId,
  TournamentResultRef,
} from "./domain/tournament";

export type {
  MemberParticipantReference,
  ParticipantReference,
  TournamentParticipant,
  TournamentParticipantId,
} from "./domain/participant";

export type {
  TournamentFinalStatus,
  TournamentLifecycleEvent,
  TournamentMatchStatus,
  TournamentParticipantStatus,
  TournamentStatus,
} from "./types";
export {
  canTransitionTournament,
  isTournamentFinal,
  isTournamentParticipantStatus,
  isTournamentStatus,
  TOURNAMENT_EVENTS,
  TOURNAMENT_FINAL_STATUSES,
  TOURNAMENT_MATCH_STATUSES,
  TOURNAMENT_PARTICIPANT_STATUSES,
  TOURNAMENT_STATUSES,
  TOURNAMENT_TRANSITIONS,
} from "./types";

export type {
  AttachTournamentBookingReferenceInput,
  AttachTournamentEventReferenceInput,
  AttachTournamentGolfReferenceInput,
  AttachTournamentPaymentReferenceInput,
  AttachTournamentResourceReferenceInput,
  CreateTournamentCategoryInput,
  CreateTournamentInput,
  ListTournamentParticipantsQuery,
  ListTournamentsQuery,
  RegisterTournamentParticipantInput,
  TournamentCategoryResult,
  TournamentParticipantResult,
  TournamentResult,
  UpdateTournamentParticipantStatusInput,
  UpdateTournamentStatusInput,
} from "./contracts";

export type {
  TournamentCategoryService,
  TournamentParticipantService,
  TournamentService,
} from "./services";
