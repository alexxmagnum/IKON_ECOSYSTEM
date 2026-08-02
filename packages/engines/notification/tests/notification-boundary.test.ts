/**
 * Notification Engine Boundary contract tests.
 * Run: pnpm --filter @motanos/notification test
 */
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { beforeEach, describe, it } from "node:test";
import {
  NOTIFICATION_KINDS,
  NOTIFICATION_STATUSES,
  createNotification,
  isNotification,
  isNotificationKind,
  isNotificationStatus,
  resetNotificationReferenceSequence,
} from "../src/index.js";

const packageRoot = join(dirname(fileURLToPath(import.meta.url)), "..");

describe("Notification Engine Boundary", () => {
  beforeEach(() => {
    resetNotificationReferenceSequence();
  });

  it("creates Notification Boundary context", () => {
    const notification = createNotification({
      tenantReference: "tenant-a",
      notificationKind: NOTIFICATION_KINDS.Confirmation,
      actorReference: "actor-1",
      bookingReference: "bk-1",
      channelReference: "channel-1",
    });
    assert.equal(isNotification(notification), true);
    assert.equal(notification.notificationReference, "notification-1");
    assert.equal(notification.notificationStatus, "draft");
    assert.equal(notification.notificationKind, "notification.confirmation");
    assert.equal(notification.tenantReference, "tenant-a");
    assert.equal(notification.bookingReference, "bk-1");
  });

  it("validates tenant isolation", () => {
    assert.throws(
      () =>
        createNotification({
          tenantReference: "  ",
          notificationKind: NOTIFICATION_KINDS.Alert,
        }),
      /tenantReference is required/,
    );

    assert.throws(
      () =>
        createNotification(
          {
            tenantReference: "tenant-b",
            notificationKind: NOTIFICATION_KINDS.Reminder,
          },
          { tenantReference: "tenant-a" },
        ),
      /does not apply to this tenant/,
    );

    assert.throws(
      () =>
        createNotification({
          tenantReference: "tenant-a",
          notificationKind: NOTIFICATION_KINDS.Invitation,
          actorReference: "  ",
        }),
      /actorReference must not be empty when provided/,
    );
  });

  it("accepts only known notification kinds", () => {
    assert.equal(isNotificationKind("notification.alert"), true);
    assert.equal(isNotificationKind("notification.reminder"), true);
    assert.equal(isNotificationKind("notification.confirmation"), true);
    assert.equal(isNotificationKind("notification.invitation"), true);
    assert.equal(isNotificationKind("notification.update"), true);
    assert.equal(isNotificationKind("notification.operational"), true);
    assert.equal(isNotificationKind("notification.unknown"), false);

    assert.throws(
      () =>
        createNotification({
          tenantReference: "tenant-a",
          notificationKind: "notification.unknown" as never,
        }),
      /Unknown notification kind/,
    );
  });

  it("accepts only known notification statuses", () => {
    assert.equal(isNotificationStatus("draft"), true);
    assert.equal(isNotificationStatus("pending"), true);
    assert.equal(isNotificationStatus("scheduled"), true);
    assert.equal(isNotificationStatus("sent"), true);
    assert.equal(isNotificationStatus("failed"), true);
    assert.equal(isNotificationStatus("cancelled"), true);
    assert.equal(isNotificationStatus("unknown"), false);

    const pending = createNotification({
      tenantReference: "tenant-a",
      notificationKind: NOTIFICATION_KINDS.Update,
      notificationStatus: NOTIFICATION_STATUSES.Pending,
    });
    assert.equal(pending.notificationStatus, "pending");

    const scheduled = createNotification({
      tenantReference: "tenant-a",
      notificationKind: NOTIFICATION_KINDS.Operational,
      notificationStatus: NOTIFICATION_STATUSES.Scheduled,
    });
    assert.equal(scheduled.notificationStatus, "scheduled");
  });

  it("stays separated from messaging vendors / delivery packages", () => {
    const pkg = JSON.parse(
      readFileSync(join(packageRoot, "package.json"), "utf8"),
    ) as {
      dependencies?: Record<string, string>;
      devDependencies?: Record<string, string>;
    };
    assert.deepEqual(Object.keys(pkg.dependencies ?? {}).sort(), [
      "@motanos/contracts",
      "@motanos/core",
    ]);
    assert.equal(pkg.devDependencies, undefined);
    assert.equal(
      Object.keys(pkg.dependencies ?? {}).includes("@motanos/booking"),
      false,
    );
    assert.equal(
      Object.keys(pkg.dependencies ?? {}).includes("@motanos/payment"),
      false,
    );
    assert.equal(
      Object.keys(pkg.dependencies ?? {}).includes("@motanos/commerce"),
      false,
    );
    assert.equal(
      Object.keys(pkg.dependencies ?? {}).includes("@motanos/community"),
      false,
    );

    const notification = createNotification({
      tenantReference: "tenant-a",
      notificationKind: NOTIFICATION_KINDS.Alert,
      notificationStatus: NOTIFICATION_STATUSES.Sent,
      paymentReference: "pay-1",
      communityReference: "community-1",
    });
    assert.equal(isNotification(notification), true);
    assert.equal(notification.notificationStatus, "sent");
    assert.equal(notification.paymentReference, "pay-1");
  });
});
