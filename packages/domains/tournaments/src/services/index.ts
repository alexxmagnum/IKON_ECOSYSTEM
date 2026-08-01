import type {
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
} from "../contracts";
import type { TournamentCategoryId } from "../domain/category";
import type { TournamentParticipantId } from "../domain/participant";
import type { TournamentId } from "../domain/tournament";

/**
 * Tournament domain service contracts.
 * Implementations compose Golf / Events / Members / Booking / Payments —
 * this package never owns those workflows.
 */

export interface TournamentCategoryService {
  create(
    input: CreateTournamentCategoryInput,
  ): Promise<TournamentCategoryResult>;
  getById(
    categoryId: TournamentCategoryId,
  ): Promise<TournamentCategoryResult | null>;
  list(): Promise<TournamentCategoryResult[]>;
}

export interface TournamentService {
  create(input: CreateTournamentInput): Promise<TournamentResult>;
  updateStatus(input: UpdateTournamentStatusInput): Promise<TournamentResult>;
  attachEventReference(
    input: AttachTournamentEventReferenceInput,
  ): Promise<TournamentResult>;
  attachGolfReference(
    input: AttachTournamentGolfReferenceInput,
  ): Promise<TournamentResult>;
  attachResourceReference(
    input: AttachTournamentResourceReferenceInput,
  ): Promise<TournamentResult>;
  attachBookingReference(
    input: AttachTournamentBookingReferenceInput,
  ): Promise<TournamentResult>;
  attachPaymentReference(
    input: AttachTournamentPaymentReferenceInput,
  ): Promise<TournamentResult>;
  getById(tournamentId: TournamentId): Promise<TournamentResult | null>;
  list(query: ListTournamentsQuery): Promise<TournamentResult[]>;
}

export interface TournamentParticipantService {
  register(
    input: RegisterTournamentParticipantInput,
  ): Promise<TournamentParticipantResult>;
  updateStatus(
    input: UpdateTournamentParticipantStatusInput,
  ): Promise<TournamentParticipantResult>;
  getById(
    participantId: TournamentParticipantId,
  ): Promise<TournamentParticipantResult | null>;
  list(
    query: ListTournamentParticipantsQuery,
  ): Promise<TournamentParticipantResult[]>;
}
