import type { ResourceId } from "@motanos/booking";

export type GolfCourseId = string;
export type HoleId = string;

/**
 * A single hole on a course.
 * Handicap indexes / yardages may live in metadata until a later phase.
 */
export interface Hole {
  id?: HoleId;
  number: number;
  par: number;
  metadata?: Record<string, unknown>;
}

/**
 * Golf course — sports knowledge only.
 * Tee-time availability is owned by Booking via an optional resource link.
 */
export interface GolfCourse {
  id: GolfCourseId;
  name: string;
  /** Free-form location label (city, address hint). Not a geo engine. */
  location?: string;
  holes: Hole[];
  /**
   * Bookable resource that represents this course (or a tee sheet) in Booking.
   * Golf never owns reservation state.
   */
  resourceId?: ResourceId;
  metadata?: Record<string, unknown>;
}
