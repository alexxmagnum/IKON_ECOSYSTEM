import type { BookingId, ResourceId } from "@motanos/booking-lifecycle";
import type { PaymentId } from "@motanos/payments";
import type { GolfCourse, GolfCourseId, Hole } from "../domain/course";
import type { GolfPlayer, GolfPlayerId, UserRef } from "../domain/player";
import type { GolfRound, GolfRoundId, TournamentRef } from "../domain/round";
import type { GolfRoundStatus } from "../types";

/**
 * API-oriented TypeScript contracts for a future Golf domain surface.
 * No route handlers. Reservation/payment mutations belong to their engines.
 */

export interface CreateGolfCourseInput {
  name: string;
  location?: string;
  holes: Hole[];
  resourceId?: ResourceId;
  metadata?: Record<string, unknown>;
}

export interface UpdateGolfCourseInput {
  courseId: GolfCourseId;
  name?: string;
  location?: string;
  holes?: Hole[];
  resourceId?: ResourceId;
  metadata?: Record<string, unknown>;
}

export interface CreateGolfRoundInput {
  courseId: GolfCourseId;
  players: Array<{
    displayName: string;
    userId?: UserRef;
    metadata?: Record<string, unknown>;
  }>;
  /** Link to an existing Booking reservation — Golf does not create bookings. */
  bookingReference?: BookingId;
  paymentReference?: PaymentId;
  tournamentReference?: TournamentRef;
  startsAt?: string;
  endsAt?: string;
  metadata?: Record<string, unknown>;
}

export interface UpdateGolfRoundStatusInput {
  roundId: GolfRoundId;
  status: GolfRoundStatus;
}

export interface AttachBookingReferenceInput {
  roundId: GolfRoundId;
  bookingReference: BookingId;
}

export interface AttachPaymentReferenceInput {
  roundId: GolfRoundId;
  paymentReference: PaymentId;
}

export interface GolfCourseResult {
  course: GolfCourse;
}

export interface GolfRoundResult {
  round: GolfRound;
  players: GolfPlayer[];
}

export interface ListGolfRoundsQuery {
  courseId?: GolfCourseId;
  status?: GolfRoundStatus | GolfRoundStatus[];
  bookingReference?: BookingId;
  playerId?: GolfPlayerId;
}
