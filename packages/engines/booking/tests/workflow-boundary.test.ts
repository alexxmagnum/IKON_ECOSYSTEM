/**
 * Booking Workflow Boundary contract tests.
 * Run: pnpm --filter @motanos/booking test
 */
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { beforeEach, describe, it } from "node:test";
import {
  BOOKING_WORKFLOW_KINDS,
  BOOKING_WORKFLOW_STATES,
  createBookingWorkflow,
  createBookingWorkflowDefinition,
  isBookingWorkflow,
  isBookingWorkflowDefinition,
  resetBookingWorkflowReferenceSequence,
  workflowBelongsToTenant,
} from "../src/index.js";

const packageRoot = join(dirname(fileURLToPath(import.meta.url)), "..");

describe("Booking Workflow Boundary", () => {
  beforeEach(() => {
    resetBookingWorkflowReferenceSequence();
  });

  it("creates a valid workflow instance", () => {
    const workflow = createBookingWorkflow({
      kind: BOOKING_WORKFLOW_KINDS.Confirmation,
      bookingReference: "bk-1",
      tenantReference: "tenant-a",
      actorReference: "actor-1",
      currentStep: "check_confirmation_requirement",
      metadata: { correlationId: "corr-1" },
    });

    assert.deepEqual(workflow, {
      workflowReference: "workflow-1",
      kind: "booking.confirmation",
      bookingReference: "bk-1",
      tenantReference: "tenant-a",
      actorReference: "actor-1",
      currentStep: "check_confirmation_requirement",
      state: BOOKING_WORKFLOW_STATES.Pending,
      metadata: { correlationId: "corr-1" },
    });
    assert.equal(isBookingWorkflow(workflow), true);
  });

  it("creates workflow definitions for known kinds", () => {
    const confirmation = createBookingWorkflowDefinition(
      BOOKING_WORKFLOW_KINDS.Confirmation,
    );
    assert.equal(isBookingWorkflowDefinition(confirmation), true);
    assert.equal(confirmation.kind, "booking.confirmation");
    assert.ok(confirmation.steps.includes("confirm_booking"));

    const payment = createBookingWorkflowDefinition(
      BOOKING_WORKFLOW_KINDS.Payment,
    );
    assert.equal(payment.kind, "booking.payment");
    assert.ok(payment.steps.includes("request_payment"));

    const reminder = createBookingWorkflowDefinition(
      BOOKING_WORKFLOW_KINDS.Reminder,
    );
    assert.equal(reminder.kind, "booking.reminder");
    assert.ok(reminder.steps.includes("send_reminder"));
  });

  it("isolates workflows by tenantReference", () => {
    const workflow = createBookingWorkflow({
      kind: BOOKING_WORKFLOW_KINDS.Reminder,
      bookingReference: "bk-2",
      tenantReference: "tenant-a",
      actorReference: "actor-1",
      currentStep: "await_reminder_window",
    });

    assert.equal(workflowBelongsToTenant(workflow, "tenant-a"), true);
    assert.equal(workflowBelongsToTenant(workflow, "tenant-b"), false);
    assert.equal(workflowBelongsToTenant(workflow, "  "), false);
  });

  it("requires tenant, actor, booking, and a valid step", () => {
    assert.throws(
      () =>
        createBookingWorkflow({
          kind: BOOKING_WORKFLOW_KINDS.Confirmation,
          bookingReference: "bk-1",
          tenantReference: "",
          actorReference: "actor-1",
          currentStep: "confirm_booking",
        }),
      /tenantReference is required/,
    );

    assert.throws(
      () =>
        createBookingWorkflow({
          kind: BOOKING_WORKFLOW_KINDS.Confirmation,
          bookingReference: "bk-1",
          tenantReference: "tenant-a",
          actorReference: "  ",
          currentStep: "confirm_booking",
        }),
      /actorReference is required/,
    );

    assert.throws(
      () =>
        createBookingWorkflow({
          kind: BOOKING_WORKFLOW_KINDS.Confirmation,
          bookingReference: "bk-1",
          tenantReference: "tenant-a",
          actorReference: "actor-1",
          currentStep: "not_a_real_step",
        }),
      /currentStep .* is not part of workflow/,
    );
  });

  it("has no workflow infrastructure dependencies", () => {
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
    for (const name of Object.keys({
      ...pkg.dependencies,
      ...pkg.devDependencies,
    })) {
      assert.equal(name.startsWith("@motanos/"), true, `unexpected dep ${name}`);
    }
  });
});
