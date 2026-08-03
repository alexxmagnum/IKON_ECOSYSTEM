import type { BookingId, ResourceId } from "@motanos/booking-lifecycle";
import type { EventId } from "@motanos/domain-events";
import type { GolfCourseId } from "@motanos/domain-golf";
import type { PaymentId } from "@motanos/payments";
import type { TournamentCategoryId } from "./category";
import type { TournamentStatus } from "../types";

export type TournamentId = string;
export type TournamentPhaseId = string;

/**
 * Future competition phase placeholder (brackets / rounds).
 * No scoring or ranking logic in this foundation.
 */
export interface TournamentPhase {
  id: TournamentPhaseId;
  tournamentId: TournamentId;
  name: string;
  sortOrder?: number;
  metadata?: Record<string, unknown>;
}

/**
 * Opaque future result aggregate id — no results engine yet.
 */
export type TournamentResultRef = string;

/**
 * Competitive tournament (TOURNAMENT machine).
 * Composes with Golf / Events / Booking / Payments via typed references.
 */
export interface Tournament {
  id: TournamentId;
  name: string;
  description?: string;
  categoryId: TournamentCategoryId;
  status: TournamentStatus;
  /** ISO-8601 start. */
  startDate: string;
  /** ISO-8601 end. */
  endDate?: string;
  capacity?: number;
  /** Related Events Domain aggregate. */
  eventReference?: EventId;
  /** Bookable resource (courts / course slots) in Booking Engine. */
  resourceReference?: ResourceId;
  bookingReference?: BookingId;
  /** Golf Domain course (or tee-sheet resource owner) — not a golf engine copy. */
  golfReference?: GolfCourseId;
  /** Future entry-fee payment — no charge logic. */
  paymentReference?: PaymentId;
  phases?: TournamentPhase[];
  resultRefs?: TournamentResultRef[];
  metadata?: Record<string, unknown>;
  createdAt?: string;
  updatedAt?: string;
}
