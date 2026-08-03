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
   * (cross-tenant scope lock).
   */
  tenantReference?: string;
}

/**
 * Build a checked Notification (in-memory — communication existence only).
 * Does not open vendor sessions, render layouts, or run outbound rails.
 */
export function createNotification(
  input: CreateNotificationInput,
  options: CreateNotificationOptions = {},
): Notification {
  const tenantReference = input.tenantReference?.trim() ?? "";
  const actorReference = input.actorReference?.trim();
  const customerReference = input.customerReference?.trim();
  const memberReference = input.memberReference?.trim();
  const contextReference = input.contextReference?.trim();
  const contentReference = input.contentReference?.trim();
  const templateReference = input.templateReference?.trim();
  const channelReference = input.channelReference?.trim();
  const parentNotificationReference =
    input.parentNotificationReference?.trim();
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
  if (input.customerReference !== undefined && !customerReference) {
    throw new Error("customerReference must not be empty when provided");
  }
  if (input.memberReference !== undefined && !memberReference) {
    throw new Error("memberReference must not be empty when provided");
  }
  if (input.contextReference !== undefined && !contextReference) {
    throw new Error("contextReference must not be empty when provided");
  }
  if (input.contentReference !== undefined && !contentReference) {
    throw new Error("contentReference must not be empty when provided");
  }
  if (input.templateReference !== undefined && !templateReference) {
    throw new Error("templateReference must not be empty when provided");
  }
  if (input.channelReference !== undefined && !channelReference) {
    throw new Error("channelReference must not be empty when provided");
  }
  if (
    input.parentNotificationReference !== undefined &&
    !parentNotificationReference
  ) {
    throw new Error(
      "parentNotificationReference must not be empty when provided",
    );
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
    ...(customerReference !== undefined && customerReference.length > 0
      ? { customerReference }
      : {}),
    ...(memberReference !== undefined && memberReference.length > 0
      ? { memberReference }
      : {}),
    ...(contextReference !== undefined && contextReference.length > 0
      ? { contextReference }
      : {}),
    ...(contentReference !== undefined && contentReference.length > 0
      ? { contentReference }
      : {}),
    ...(templateReference !== undefined && templateReference.length > 0
      ? { templateReference }
      : {}),
    ...(channelReference !== undefined && channelReference.length > 0
      ? { channelReference }
      : {}),
    ...(parentNotificationReference !== undefined &&
    parentNotificationReference.length > 0
      ? { parentNotificationReference }
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
