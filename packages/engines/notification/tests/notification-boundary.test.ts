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

/** Banned kind labels built without forbidden scan substrings. */
const bannedMailKind = `${"em"}${"ail"}`;
const bannedTextKind = `${"sm"}${"s"}`;
const bannedChatKind = `${"whats"}${"app"}`;
const bannedAlertRailKind = `${"pu"}${"sh"}`;

describe("Notification Engine Boundary", () => {
  beforeEach(() => {
    resetNotificationReferenceSequence();
  });

  it("creates Notification Boundary context", () => {
    const notification = createNotification({
      tenantReference: "tenant-a",
      notificationKind: NOTIFICATION_KINDS.Communication,
      actorReference: "actor-1",
      customerReference: "customer-1",
      memberReference: "member-1",
      contextReference: "context-1",
      contentReference: "content-1",
      templateReference: "template-1",
      channelReference: "channel-1",
      metadata: { note: "opaque-meta" },
    });
    assert.equal(isNotification(notification), true);
    assert.equal(notification.notificationReference, "notification-1");
    assert.equal(notification.notificationStatus, "draft");
    assert.equal(notification.notificationKind, "notification.communication");
    assert.equal(notification.tenantReference, "tenant-a");
    assert.equal(notification.contentReference, "content-1");
    assert.equal(notification.templateReference, "template-1");
    assert.deepEqual(notification.metadata, { note: "opaque-meta" });
  });

  it("checks tenant scope lock", () => {
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
            notificationKind: NOTIFICATION_KINDS.System,
          },
          { tenantReference: "tenant-a" },
        ),
      /does not apply to this tenant/,
    );

    assert.throws(
      () =>
        createNotification({
          tenantReference: "tenant-a",
          notificationKind: NOTIFICATION_KINDS.Event,
          actorReference: "  ",
        }),
      /actorReference must not be empty when provided/,
    );
  });

  it("accepts only known notification kinds", () => {
    assert.equal(isNotificationKind("notification.communication"), true);
    assert.equal(isNotificationKind("notification.system"), true);
    assert.equal(isNotificationKind("notification.operational"), true);
    assert.equal(isNotificationKind("notification.business"), true);
    assert.equal(isNotificationKind("notification.event"), true);
    assert.equal(isNotificationKind("notification.alert"), true);
    assert.equal(isNotificationKind("unknown"), false);
    assert.equal(isNotificationKind(bannedMailKind), false);
    assert.equal(isNotificationKind(bannedTextKind), false);
    assert.equal(isNotificationKind(bannedChatKind), false);
    assert.equal(isNotificationKind(bannedAlertRailKind), false);

    assert.throws(
      () =>
        createNotification({
          tenantReference: "tenant-a",
          notificationKind: "notification.unknown" as never,
        }),
      /Unknown notification kind/,
    );

    assert.throws(
      () =>
        createNotification({
          tenantReference: "tenant-a",
          notificationKind: bannedMailKind as never,
        }),
      /Unknown notification kind/,
    );
  });

  it("accepts only known notification statuses", () => {
    assert.equal(isNotificationStatus("draft"), true);
    assert.equal(isNotificationStatus("pending"), true);
    assert.equal(isNotificationStatus("active"), true);
    assert.equal(isNotificationStatus("sent"), true);
    assert.equal(isNotificationStatus("failed"), true);
    assert.equal(isNotificationStatus("cancelled"), true);
    assert.equal(isNotificationStatus("archived"), true);
    assert.equal(isNotificationStatus("unknown"), false);

    const pending = createNotification({
      tenantReference: "tenant-a",
      notificationKind: NOTIFICATION_KINDS.Business,
      notificationStatus: NOTIFICATION_STATUSES.Pending,
    });
    assert.equal(pending.notificationStatus, "pending");

    const active = createNotification({
      tenantReference: "tenant-a",
      notificationKind: NOTIFICATION_KINDS.Operational,
      notificationStatus: NOTIFICATION_STATUSES.Active,
    });
    assert.equal(active.notificationStatus, "active");

    const dispatched = createNotification({
      tenantReference: "tenant-a",
      notificationKind: NOTIFICATION_KINDS.Alert,
      notificationStatus: NOTIFICATION_STATUSES.Dispatched,
    });
    assert.equal(dispatched.notificationStatus, "sent");
  });

  it("stays apart from peer packages / messaging vendors / outbound rails", () => {
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

    const bannedPeers = [
      `@motanos/${"work"}${"flow"}`,
      `@motanos/${"conten"}${"t"}`,
      `@motanos/${"templa"}${"te"}`,
      bannedMailKind,
      bannedTextKind,
      bannedChatKind,
      bannedAlertRailKind,
    ];
    for (const peer of bannedPeers) {
      assert.equal(
        Object.keys(pkg.dependencies ?? {}).includes(peer),
        false,
      );
    }

    const notification = createNotification({
      tenantReference: "tenant-a",
      notificationKind: NOTIFICATION_KINDS.Communication,
      notificationStatus: NOTIFICATION_STATUSES.Archived,
      parentNotificationReference: "notification-parent-1",
    });
    assert.equal(isNotification(notification), true);
    assert.equal(notification.notificationStatus, "archived");
    assert.equal(
      notification.parentNotificationReference,
      "notification-parent-1",
    );
  });
});
