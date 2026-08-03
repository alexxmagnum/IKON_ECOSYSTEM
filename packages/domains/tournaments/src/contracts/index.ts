import type { BookingId, ResourceId } from "@motanos/booking-lifecycle";
import type { EventId } from "@motanos/domain-events";
import type { GolfCourseId } from "@motanos/domain-golf";
import type { PaymentId } from "@motanos/payments";
import type {
  TournamentCategory,
  TournamentCategoryId,
} from "../domain/category";
import type {
  ParticipantReference,
  TournamentParticipant,
  TournamentParticipantId,
} from "../domain/participant";
import type {
  Tournament,
  TournamentId,
  TournamentPhase,
} from "../domain/tournament";
import type {
  TournamentParticipantStatus,
  TournamentStatus,
} from "../types";

/**
 * API-oriented TypeScript contracts for a future Tournaments domain surface.
 * No route handlers. Sibling domains / engines own their own mutations.
 */

export interface CreateTournamentCategoryInput {
  name: string;
  description?: string;
  metadata?: Record<string, unknown>;
}

export interface CreateTournamentInput {
  name: string;
  description?: string;
  categoryId: TournamentCategoryId;
  status?: TournamentStatus;
  startDate: string;
  endDate?: string;
  capacity?: number;
  eventReference?: EventId;
  resourceReference?: ResourceId;
  bookingReference?: BookingId;
  golfReference?: GolfCourseId;
  paymentReference?: PaymentId;
  metadata?: Record<string, unknown>;
}

export interface UpdateTournamentStatusInput {
  tournamentId: TournamentId;
  status: TournamentStatus;
}

export interface AttachTournamentEventReferenceInput {
  tournamentId: TournamentId;
  eventReference: EventId;
}

export interface AttachTournamentGolfReferenceInput {
  tournamentId: TournamentId;
  golfReference: GolfCourseId;
}

export interface AttachTournamentResourceReferenceInput {
  tournamentId: TournamentId;
  resourceReference: ResourceId;
}

export interface AttachTournamentBookingReferenceInput {
  tournamentId: TournamentId;
  bookingReference: BookingId;
}

export interface AttachTournamentPaymentReferenceInput {
  tournamentId: TournamentId;
  paymentReference: PaymentId;
}

export interface RegisterTournamentParticipantInput {
  tournamentId: TournamentId;
  participantReference: ParticipantReference;
  displayName?: string;
  status?: TournamentParticipantStatus;
  metadata?: Record<string, unknown>;
}

export interface UpdateTournamentParticipantStatusInput {
  participantId: TournamentParticipantId;
  status: TournamentParticipantStatus;
}

export interface TournamentCategoryResult {
  category: TournamentCategory;
}

export interface TournamentResult {
  tournament: Tournament;
}

export interface TournamentParticipantResult {
  participant: TournamentParticipant;
}

export interface ListTournamentsQuery {
  categoryId?: TournamentCategoryId;
  status?: TournamentStatus | TournamentStatus[];
  eventReference?: EventId;
  golfReference?: GolfCourseId;
  resourceReference?: ResourceId;
}

export interface ListTournamentParticipantsQuery {
  tournamentId: TournamentId;
  status?: TournamentParticipantStatus | TournamentParticipantStatus[];
}

export type { TournamentPhase };
