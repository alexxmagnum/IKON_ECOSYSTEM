import type {
  CreateActivityScheduleInput,
  HospitalityActivitySchedule,
  ScheduleKind,
  ScheduleStatus,
} from "./activity-schedule";
import {
  SCHEDULE_STATUSES,
  isScheduleKind,
  isScheduleStatus,
} from "./activity-schedule";

let scheduleSequence = 0;

export interface CreateActivityScheduleOptions {
  /**
   * When set, schedule may only be created for this hospitality business
   * (cross-business isolation).
   */
  hospitalityReference?: string;
}

/**
 * Build a checked HospitalityActivitySchedule (in-memory — plan existence only).
 * Does not publish, cancel, hold seats, or probe availability.
 */
export function createActivitySchedule(
  input: CreateActivityScheduleInput,
  options: CreateActivityScheduleOptions = {},
): HospitalityActivitySchedule {
  const hospitalityReference = input.hospitalityReference?.trim();
  const activityReference = input.activityReference?.trim();
  const contextReference = input.contextReference?.trim();
  const locationReference = input.locationReference?.trim();
  const startReference = input.startReference?.trim();
  const endReference = input.endReference?.trim();
  const timezoneReference = input.timezoneReference?.trim();
  const parentScheduleReference = input.parentScheduleReference?.trim();
  const boundHospitality = options.hospitalityReference?.trim() || undefined;

  if (!isScheduleKind(input.scheduleKind)) {
    throw new Error(
      `Unknown schedule kind: ${String(input.scheduleKind)}`,
    );
  }

  const scheduleStatus: ScheduleStatus =
    input.scheduleStatus ?? SCHEDULE_STATUSES.Draft;
  if (!isScheduleStatus(scheduleStatus)) {
    throw new Error(
      `Unknown schedule status: ${String(input.scheduleStatus)}`,
    );
  }

  if (input.hospitalityReference !== undefined && !hospitalityReference) {
    throw new Error(
      "hospitalityReference must not be empty when provided",
    );
  }
  if (input.activityReference !== undefined && !activityReference) {
    throw new Error("activityReference must not be empty when provided");
  }
  if (input.contextReference !== undefined && !contextReference) {
    throw new Error("contextReference must not be empty when provided");
  }
  if (input.locationReference !== undefined && !locationReference) {
    throw new Error("locationReference must not be empty when provided");
  }
  if (input.startReference !== undefined && !startReference) {
    throw new Error("startReference must not be empty when provided");
  }
  if (input.endReference !== undefined && !endReference) {
    throw new Error("endReference must not be empty when provided");
  }
  if (input.timezoneReference !== undefined && !timezoneReference) {
    throw new Error(
      "timezoneReference must not be empty when provided",
    );
  }
  if (
    input.parentScheduleReference !== undefined &&
    !parentScheduleReference
  ) {
    throw new Error(
      "parentScheduleReference must not be empty when provided",
    );
  }

  if (
    boundHospitality !== undefined &&
    (hospitalityReference === undefined ||
      hospitalityReference !== boundHospitality)
  ) {
    throw new Error(
      "schedule does not apply to this hospitality business",
    );
  }

  const providedReference = input.scheduleReference?.trim() ?? "";
  if (input.scheduleReference !== undefined && !providedReference) {
    throw new Error(
      "scheduleReference must not be empty when provided",
    );
  }

  const scheduleKind: ScheduleKind = input.scheduleKind;
  const scheduleReference =
    providedReference || allocateScheduleReference();

  return {
    scheduleReference,
    scheduleKind,
    scheduleStatus,
    ...(hospitalityReference !== undefined && hospitalityReference.length > 0
      ? { hospitalityReference }
      : {}),
    ...(activityReference !== undefined && activityReference.length > 0
      ? { activityReference }
      : {}),
    ...(contextReference !== undefined && contextReference.length > 0
      ? { contextReference }
      : {}),
    ...(locationReference !== undefined && locationReference.length > 0
      ? { locationReference }
      : {}),
    ...(startReference !== undefined && startReference.length > 0
      ? { startReference }
      : {}),
    ...(endReference !== undefined && endReference.length > 0
      ? { endReference }
      : {}),
    ...(timezoneReference !== undefined && timezoneReference.length > 0
      ? { timezoneReference }
      : {}),
    ...(parentScheduleReference !== undefined &&
    parentScheduleReference.length > 0
      ? { parentScheduleReference }
      : {}),
    ...(input.metadata !== undefined ? { metadata: input.metadata } : {}),
  };
}

function allocateScheduleReference(): string {
  scheduleSequence += 1;
  return `schedule-${scheduleSequence}`;
}

/** Test helper — reset opaque id sequence. */
export function resetActivityScheduleReferenceSequence(): void {
  scheduleSequence = 0;
}
