import type { BookingId } from "@motanos/booking-lifecycle";
import type { PaymentId } from "@motanos/payments";
import type { GolfCourseId } from "./course";
import type { GolfPlayer } from "./player";
import type { GolfRoundStatus } from "../types";

export type GolfRoundId = string;

/**
 * Optional future link to a tournament aggregate (docs/43).
 * Not a tournament engine — opaque id only.
 */
export type TournamentRef = string;

/**
 * A golf round / partida.
 * Reservation lifecycle stays in Booking; charges stay in Payments.
 */
export interface GolfRound {
  id: GolfRoundId;
  courseId: GolfCourseId;
  players: GolfPlayer[];
  status: GolfRoundStatus;
  /**
   * Reference to the Booking Engine reservation for this tee time / salida.
   * Required in product flows that reserve a slot (BR: tee times via Booking).
   */
  bookingReference?: BookingId;
  /**
   * Optional Payment Engine reference (e.g. green fee) — no charge logic here.
   */
  paymentReference?: PaymentId;
  /** Future tournament participation — opaque, no ranking/scoring. */
  tournamentReference?: TournamentRef;
  startsAt?: string;
  endsAt?: string;
  metadata?: Record<string, unknown>;
  createdAt?: string;
  updatedAt?: string;
}
