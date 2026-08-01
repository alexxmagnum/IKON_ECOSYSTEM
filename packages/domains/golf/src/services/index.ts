import type {
  AttachBookingReferenceInput,
  AttachPaymentReferenceInput,
  CreateGolfCourseInput,
  CreateGolfRoundInput,
  GolfCourseResult,
  GolfRoundResult,
  ListGolfRoundsQuery,
  UpdateGolfCourseInput,
  UpdateGolfRoundStatusInput,
} from "../contracts";
import type { GolfCourseId } from "../domain/course";
import type { GolfRoundId } from "../domain/round";

/**
 * Golf domain service contracts.
 * Implementations must call Booking / Payment engines for reservations and charges.
 * This package never owns those workflows.
 */

export interface GolfCourseService {
  create(input: CreateGolfCourseInput): Promise<GolfCourseResult>;
  update(input: UpdateGolfCourseInput): Promise<GolfCourseResult>;
  getById(courseId: GolfCourseId): Promise<GolfCourseResult | null>;
  list(): Promise<GolfCourseResult[]>;
}

export interface GolfRoundService {
  create(input: CreateGolfRoundInput): Promise<GolfRoundResult>;
  updateStatus(input: UpdateGolfRoundStatusInput): Promise<GolfRoundResult>;
  attachBookingReference(
    input: AttachBookingReferenceInput,
  ): Promise<GolfRoundResult>;
  attachPaymentReference(
    input: AttachPaymentReferenceInput,
  ): Promise<GolfRoundResult>;
  getById(roundId: GolfRoundId): Promise<GolfRoundResult | null>;
  list(query: ListGolfRoundsQuery): Promise<GolfRoundResult[]>;
}
