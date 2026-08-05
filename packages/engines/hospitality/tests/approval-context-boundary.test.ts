/**
 * Hospitality Engagement Approval Context contract tests.
 * Run: pnpm --filter @motanos/hospitality test
 */
import assert from "node:assert/strict";
import { readFileSync, readdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { beforeEach, describe, it } from "node:test";
import {
  ENGAGEMENT_APPROVAL_CONTEXT_KINDS,
  ENGAGEMENT_APPROVAL_CONTEXT_STATUSES,
  createEngagementApprovalContext,
  isEngagementApprovalContextKind,
  isEngagementApprovalContextStatus,
  isHospitalityEngagementApprovalContext,
  resetEngagementApprovalContextReferenceSequence,
} from "../src/public.js";

const packageRoot = join(dirname(fileURLToPath(import.meta.url)), "..");
const approvalContextRoot = join(packageRoot, "src", "approval-context");
const hospitalityBusiness = "hospitality-ikon";
const otherHospitalityBusiness = "hospitality-marina";

describe("Hospitality Engagement Approval Context Boundary", () => {
  beforeEach(() => {
    resetEngagementApprovalContextReferenceSequence();
  });

  it("creates ApprovalContext", () => {
    const approval = createEngagementApprovalContext({
      approvalKind: ENGAGEMENT_APPROVAL_CONTEXT_KINDS.Proposal,
      hospitalityReference: hospitalityBusiness,
      proposalReference: "proposal-1",
      decisionContextReference: "decision-context-1",
      reviewerReference: "reviewer-1",
      memberReference: "member-1",
      activityReference: "activity-1",
      contextReference: "context-1",
      metadata: { note: "opaque-meta" },
    });
    assert.equal(isHospitalityEngagementApprovalContext(approval), true);
    assert.equal(
      approval.approvalReference,
      "engagement-approval-context-1",
    );
    assert.equal(approval.approvalStatus, "draft");
    assert.equal(approval.approvalKind, "approval.proposal");
    assert.equal(approval.hospitalityReference, hospitalityBusiness);
    assert.equal(
      Object.prototype.hasOwnProperty.call(approval, "approvedAction"),
      false,
    );
    assert.equal(
      Object.prototype.hasOwnProperty.call(approval, "execution"),
      false,
    );
    assert.equal(
      Object.prototype.hasOwnProperty.call(approval, "workflow"),
      false,
    );
    assert.equal(
      Object.prototype.hasOwnProperty.call(approval, "automation"),
      false,
    );
    assert.equal(
      Object.prototype.hasOwnProperty.call(approval, "permission"),
      false,
    );
    assert.equal(
      Object.prototype.hasOwnProperty.call(approval, "role"),
      false,
    );
    assert.equal(
      Object.prototype.hasOwnProperty.call(approval, "aiModel"),
      false,
    );
    assert.equal(
      Object.prototype.hasOwnProperty.call(approval, "decisionResult"),
      false,
    );
  });

  it("checks hospitality business isolation", () => {
    const ikon = createEngagementApprovalContext({
      approvalKind: ENGAGEMENT_APPROVAL_CONTEXT_KINDS.Community,
      hospitalityReference: hospitalityBusiness,
      proposalReference: "proposal-ikon",
    });
    const marina = createEngagementApprovalContext({
      approvalKind: ENGAGEMENT_APPROVAL_CONTEXT_KINDS.Community,
      hospitalityReference: otherHospitalityBusiness,
      proposalReference: "proposal-marina",
    });

    assert.equal(ikon.hospitalityReference, hospitalityBusiness);
    assert.equal(marina.hospitalityReference, otherHospitalityBusiness);
    assert.notEqual(ikon.hospitalityReference, marina.hospitalityReference);
    assert.notEqual(ikon.approvalReference, marina.approvalReference);
    assert.notEqual(ikon.proposalReference, marina.proposalReference);

    assert.throws(
      () =>
        createEngagementApprovalContext({
          approvalKind: ENGAGEMENT_APPROVAL_CONTEXT_KINDS.Business,
          hospitalityReference: "  ",
        }),
      /hospitalityReference must not be empty when provided/,
    );

    assert.throws(
      () =>
        createEngagementApprovalContext(
          {
            approvalKind: ENGAGEMENT_APPROVAL_CONTEXT_KINDS.Experience,
            hospitalityReference: otherHospitalityBusiness,
          },
          { hospitalityReference: hospitalityBusiness },
        ),
      /does not apply to this hospitality business/,
    );
  });

  it("accepts only known approval-context kinds", () => {
    assert.equal(isEngagementApprovalContextKind("approval.proposal"), true);
    assert.equal(isEngagementApprovalContextKind("approval.activity"), true);
    assert.equal(isEngagementApprovalContextKind("approval.community"), true);
    assert.equal(isEngagementApprovalContextKind("approval.business"), true);
    assert.equal(isEngagementApprovalContextKind("approval.experience"), true);
    assert.equal(isEngagementApprovalContextKind("approval.internal"), true);
    assert.equal(isEngagementApprovalContextKind("workflow.step"), false);
    assert.equal(isEngagementApprovalContextKind("permission.grant"), false);

    const kinds = [
      ENGAGEMENT_APPROVAL_CONTEXT_KINDS.Proposal,
      ENGAGEMENT_APPROVAL_CONTEXT_KINDS.Activity,
      ENGAGEMENT_APPROVAL_CONTEXT_KINDS.Community,
      ENGAGEMENT_APPROVAL_CONTEXT_KINDS.Business,
      ENGAGEMENT_APPROVAL_CONTEXT_KINDS.Experience,
      ENGAGEMENT_APPROVAL_CONTEXT_KINDS.Internal,
    ] as const;

    for (const kind of kinds) {
      const approval = createEngagementApprovalContext({
        approvalKind: kind,
        hospitalityReference: hospitalityBusiness,
      });
      assert.equal(approval.approvalKind, kind);
    }

    assert.throws(
      () =>
        createEngagementApprovalContext({
          approvalKind: "approval.unknown" as never,
        }),
      /Unknown engagement-approval-context kind/,
    );
  });

  it("accepts only known approval-context statuses", () => {
    assert.equal(isEngagementApprovalContextStatus("draft"), true);
    assert.equal(isEngagementApprovalContextStatus("pending"), true);
    assert.equal(isEngagementApprovalContextStatus("reviewing"), true);
    assert.equal(isEngagementApprovalContextStatus("approved"), true);
    assert.equal(isEngagementApprovalContextStatus("rejected"), true);
    assert.equal(isEngagementApprovalContextStatus("expired"), true);
    assert.equal(isEngagementApprovalContextStatus("archived"), true);
    assert.equal(isEngagementApprovalContextStatus("cancelled"), true);
    assert.equal(isEngagementApprovalContextStatus("unknown"), false);
    assert.equal(isEngagementApprovalContextStatus("executed"), false);

    const pending = createEngagementApprovalContext({
      approvalKind: ENGAGEMENT_APPROVAL_CONTEXT_KINDS.Proposal,
      approvalStatus: ENGAGEMENT_APPROVAL_CONTEXT_STATUSES.Pending,
    });
    assert.equal(pending.approvalStatus, "pending");

    const reviewing = createEngagementApprovalContext({
      approvalKind: ENGAGEMENT_APPROVAL_CONTEXT_KINDS.Activity,
      approvalStatus: ENGAGEMENT_APPROVAL_CONTEXT_STATUSES.Reviewing,
    });
    assert.equal(reviewing.approvalStatus, "reviewing");

    const approved = createEngagementApprovalContext({
      approvalKind: ENGAGEMENT_APPROVAL_CONTEXT_KINDS.Community,
      approvalStatus: ENGAGEMENT_APPROVAL_CONTEXT_STATUSES.Approved,
    });
    assert.equal(approved.approvalStatus, "approved");

    const expired = createEngagementApprovalContext({
      approvalKind: ENGAGEMENT_APPROVAL_CONTEXT_KINDS.Business,
      approvalStatus: ENGAGEMENT_APPROVAL_CONTEXT_STATUSES.Expired,
    });
    assert.equal(expired.approvalStatus, "expired");
  });

  it("stays apart from AI / workflow engine / automation / execution / permissions / actions", () => {
    const approvalSources = readdirSync(approvalContextRoot)
      .filter((name) => name.endsWith(".ts"))
      .map((name) => readFileSync(join(approvalContextRoot, name), "utf8"))
      .join("\n")
      .toLowerCase();

    assert.equal(approvalSources.includes("ai logic"), false);
    assert.equal(approvalSources.includes("workflow engine"), false);
    assert.equal(approvalSources.includes("automation"), false);
    assert.equal(approvalSources.includes("execution"), false);
    assert.equal(approvalSources.includes("permissions"), false);
    assert.equal(approvalSources.includes("actions"), false);

    assert.equal(approvalSources.includes("approveproposal"), false);
    assert.equal(approvalSources.includes("rejectproposal"), false);
    assert.equal(approvalSources.includes("executeapproval"), false);
    assert.equal(approvalSources.includes("triggeraction"), false);
    assert.equal(approvalSources.includes("createactivity"), false);

    assert.equal(approvalSources.includes("approvedaction?:"), false);
    assert.equal(approvalSources.includes("execution?:"), false);
    assert.equal(approvalSources.includes("workflow?:"), false);
    assert.equal(approvalSources.includes("automation?:"), false);
    assert.equal(approvalSources.includes("permission?:"), false);
    assert.equal(approvalSources.includes("role?:"), false);
    assert.equal(approvalSources.includes("aimodel?:"), false);
    assert.equal(approvalSources.includes("decisionresult?:"), false);

    const pkg = JSON.parse(
      readFileSync(join(packageRoot, "package.json"), "utf8"),
    ) as {
      dependencies?: Record<string, string>;
    };
    assert.deepEqual(Object.keys(pkg.dependencies ?? {}).sort(), [
      "@motanos/contracts",
      "@motanos/core",
    ]);
    assert.equal(
      Object.keys(pkg.dependencies ?? {}).includes("@motanos/approval"),
      false,
    );
    assert.equal(
      Object.keys(pkg.dependencies ?? {}).includes("@motanos/workflow"),
      false,
    );
    assert.equal(
      Object.keys(pkg.dependencies ?? {}).includes("@motanos/automation"),
      false,
    );
    assert.equal(
      Object.keys(pkg.dependencies ?? {}).includes("@motanos/copilot"),
      false,
    );
    assert.equal(
      Object.keys(pkg.dependencies ?? {}).includes("@motanos/ai"),
      false,
    );

    const approval = createEngagementApprovalContext({
      approvalKind: ENGAGEMENT_APPROVAL_CONTEXT_KINDS.Internal,
      approvalStatus: ENGAGEMENT_APPROVAL_CONTEXT_STATUSES.Archived,
      hospitalityReference: hospitalityBusiness,
      parentApprovalReference: "engagement-approval-context-parent-1",
    });
    assert.equal(isHospitalityEngagementApprovalContext(approval), true);
    assert.equal(approval.approvalStatus, "archived");
    assert.equal(
      approval.parentApprovalReference,
      "engagement-approval-context-parent-1",
    );
  });
});
