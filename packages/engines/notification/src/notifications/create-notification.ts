import type {
  CreateNotificationInput,
  Notification,
  NotificationKind,
  NotificationStatus,
} from "./notification";
import {
  NOTIFICATION_STATUSES,
  isNotificationKind,
  isNotificationStatus,
} from "./notification";

let notificationSequence = 0;

export interface CreateNotificationOptions {
  /**
   * When set, notification may only be created for this tenant
   * (cross-tenant isolation).
   */
  tenantReference?: string;
}

/**
 * Build a validated Notification (in-memory — intent / context only).
 * Does not deliver messages, open vendor sessions, or render templates.
 */
export function createNotification(
  input: CreateNotificationInput,
  options: CreateNotificationOptions = {},
): Notification {
  const tenantReference = input.tenantReference?.trim() ?? "";
  const actorReference = input.actorReference?.trim();
  const bookingReference = input.bookingReference?.trim();
  const paymentReference = input.paymentReference?.trim();
  const membershipReference = input.membershipReference?.trim();
  const communityReference = input.communityReference?.trim();
  const experienceReference = input.experienceReference?.trim();
  const channelReference = input.channelReference?.trim();
  const boundTenant = options.tenantReference?.trim() || undefined;

  if (!tenantReference) {
    throw new Error("tenantReference is required");
  }
  if (!isNotificationKind(input.notificationKind)) {
    throw new Error(
      `Unknown notification kind: ${String(input.notificationKind)}`,
    );
  }

  const notificationStatus: NotificationStatus =
    input.notificationStatus ?? NOTIFICATION_STATUSES.Draft;
  if (!isNotificationStatus(notificationStatus)) {
    throw new Error(
      `Unknown notification status: ${String(input.notificationStatus)}`,
    );
  }

  if (input.actorReference !== undefined && !actorReference) {
    throw new Error("actorReference must not be empty when provided");
  }
  if (input.bookingReference !== undefined && !bookingReference) {
    throw new Error("bookingReference must not be empty when provided");
  }
  if (input.paymentReference !== undefined && !paymentReference) {
    throw new Error("paymentReference must not be empty when provided");
  }
  if (input.membershipReference !== undefined && !membershipReference) {
    throw new Error("membershipReference must not be empty when provided");
  }
  if (input.communityReference !== undefined && !communityReference) {
    throw new Error("communityReference must not be empty when provided");
  }
  if (input.experienceReference !== undefined && !experienceReference) {
    throw new Error("experienceReference must not be empty when provided");
  }
  if (input.channelReference !== undefined && !channelReference) {
    throw new Error("channelReference must not be empty when provided");
  }

  if (boundTenant !== undefined && tenantReference !== boundTenant) {
    throw new Error("notification does not apply to this tenant");
  }

  const providedReference = input.notificationReference?.trim() ?? "";
  if (input.notificationReference !== undefined && !providedReference) {
    throw new Error("notificationReference must not be empty when provided");
  }

  const notificationKind: NotificationKind = input.notificationKind;
  const notificationReference =
    providedReference || allocateNotificationReference();

  return {
    notificationReference,
    tenantReference,
    notificationKind,
    notificationStatus,
    ...(actorReference !== undefined && actorReference.length > 0
      ? { actorReference }
      : {}),
    ...(bookingReference !== undefined && bookingReference.length > 0
      ? { bookingReference }
      : {}),
    ...(paymentReference !== undefined && paymentReference.length > 0
      ? { paymentReference }
      : {}),
    ...(membershipReference !== undefined && membershipReference.length > 0
      ? { membershipReference }
      : {}),
    ...(communityReference !== undefined && communityReference.length > 0
      ? { communityReference }
      : {}),
    ...(experienceReference !== undefined && experienceReference.length > 0
      ? { experienceReference }
      : {}),
    ...(channelReference !== undefined && channelReference.length > 0
      ? { channelReference }
      : {}),
    ...(input.metadata !== undefined ? { metadata: input.metadata } : {}),
  };
}

function allocateNotificationReference(): string {
  notificationSequence += 1;
  return `notification-${notificationSequence}`;
}

/** Test helper — reset opaque id sequence. */
export function resetNotificationReferenceSequence(): void {
  notificationSequence = 0;
}
