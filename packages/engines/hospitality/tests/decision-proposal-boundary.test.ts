/**
 * Hospitality Engagement Decision Proposal contract tests.
 * Run: pnpm --filter @motanos/hospitality test
 */
import assert from "node:assert/strict";
import { readFileSync, readdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { beforeEach, describe, it } from "node:test";
import {
  ENGAGEMENT_DECISION_PROPOSAL_KINDS,
  ENGAGEMENT_DECISION_PROPOSAL_STATUSES,
  createEngagementDecisionProposal,
  isEngagementDecisionProposalKind,
  isEngagementDecisionProposalStatus,
  isHospitalityEngagementDecisionProposal,
  resetEngagementDecisionProposalReferenceSequence,
} from "../src/public.js";

const packageRoot = join(dirname(fileURLToPath(import.meta.url)), "..");
const decisionProposalRoot = join(packageRoot, "src", "decision-proposal");
const hospitalityBusiness = "hospitality-ikon";
const otherHospitalityBusiness = "hospitality-marina";

describe("Hospitality Engagement Decision Proposal Boundary", () => {
  beforeEach(() => {
    resetEngagementDecisionProposalReferenceSequence();
  });

  it("creates DecisionProposal", () => {
    const proposal = createEngagementDecisionProposal({
      proposalKind: ENGAGEMENT_DECISION_PROPOSAL_KINDS.Activity,
      hospitalityReference: hospitalityBusiness,
      decisionContextReference: "decision-context-1",
      signalReference: "signal-1",
      ruleReference: "rule-1",
      suggestionReference: "suggestion-1",
      activityReference: "activity-related-1",
      communityReference: "community-1",
      memberReference: "member-1",
      contextReference: "context-1",
      creatorReference: "creator-1",
      metadata: { note: "opaque-meta" },
    });
    assert.equal(isHospitalityEngagementDecisionProposal(proposal), true);
    assert.equal(
      proposal.proposalReference,
      "engagement-decision-proposal-1",
    );
    assert.equal(proposal.proposalStatus, "draft");
    assert.equal(proposal.proposalKind, "proposal.activity");
    assert.equal(proposal.hospitalityReference, hospitalityBusiness);
    assert.equal(
      Object.prototype.hasOwnProperty.call(proposal, "approvedDecision"),
      false,
    );
    assert.equal(
      Object.prototype.hasOwnProperty.call(proposal, "execution"),
      false,
    );
    assert.equal(
      Object.prototype.hasOwnProperty.call(proposal, "automationAction"),
      false,
    );
    assert.equal(
      Object.prototype.hasOwnProperty.call(proposal, "workflow"),
      false,
    );
    assert.equal(
      Object.prototype.hasOwnProperty.call(proposal, "aiModel"),
      false,
    );
    assert.equal(
      Object.prototype.hasOwnProperty.call(proposal, "prompt"),
      false,
    );
    assert.equal(
      Object.prototype.hasOwnProperty.call(proposal, "confidence"),
      false,
    );
    assert.equal(
      Object.prototype.hasOwnProperty.call(proposal, "score"),
      false,
    );
    assert.equal(
      Object.prototype.hasOwnProperty.call(proposal, "ranking"),
      false,
    );
    assert.equal(
      Object.prototype.hasOwnProperty.call(proposal, "reward"),
      false,
    );
  });

  it("checks hospitality business isolation", () => {
    const ikon = createEngagementDecisionProposal({
      proposalKind: ENGAGEMENT_DECISION_PROPOSAL_KINDS.Community,
      hospitalityReference: hospitalityBusiness,
      communityReference: "community-ikon",
    });
    const marina = createEngagementDecisionProposal({
      proposalKind: ENGAGEMENT_DECISION_PROPOSAL_KINDS.Community,
      hospitalityReference: otherHospitalityBusiness,
      communityReference: "community-marina",
    });

    assert.equal(ikon.hospitalityReference, hospitalityBusiness);
    assert.equal(marina.hospitalityReference, otherHospitalityBusiness);
    assert.notEqual(ikon.hospitalityReference, marina.hospitalityReference);
    assert.notEqual(ikon.proposalReference, marina.proposalReference);
    assert.notEqual(ikon.communityReference, marina.communityReference);

    assert.throws(
      () =>
        createEngagementDecisionProposal({
          proposalKind: ENGAGEMENT_DECISION_PROPOSAL_KINDS.Member,
          hospitalityReference: "  ",
        }),
      /hospitalityReference must not be empty when provided/,
    );

    assert.throws(
      () =>
        createEngagementDecisionProposal(
          {
            proposalKind: ENGAGEMENT_DECISION_PROPOSAL_KINDS.Business,
            hospitalityReference: otherHospitalityBusiness,
          },
          { hospitalityReference: hospitalityBusiness },
        ),
      /does not apply to this hospitality business/,
    );
  });

  it("accepts only known decision-proposal kinds", () => {
    assert.equal(isEngagementDecisionProposalKind("proposal.engagement"), true);
    assert.equal(isEngagementDecisionProposalKind("proposal.activity"), true);
    assert.equal(isEngagementDecisionProposalKind("proposal.community"), true);
    assert.equal(isEngagementDecisionProposalKind("proposal.member"), true);
    assert.equal(isEngagementDecisionProposalKind("proposal.business"), true);
    assert.equal(isEngagementDecisionProposalKind("proposal.experience"), true);
    assert.equal(isEngagementDecisionProposalKind("proposal.internal"), true);
    assert.equal(isEngagementDecisionProposalKind("recommendation.auto"), false);
    assert.equal(isEngagementDecisionProposalKind("copilot.suggest"), false);

    const kinds = [
      ENGAGEMENT_DECISION_PROPOSAL_KINDS.Engagement,
      ENGAGEMENT_DECISION_PROPOSAL_KINDS.Activity,
      ENGAGEMENT_DECISION_PROPOSAL_KINDS.Community,
      ENGAGEMENT_DECISION_PROPOSAL_KINDS.Member,
      ENGAGEMENT_DECISION_PROPOSAL_KINDS.Business,
      ENGAGEMENT_DECISION_PROPOSAL_KINDS.Experience,
      ENGAGEMENT_DECISION_PROPOSAL_KINDS.Internal,
    ] as const;

    for (const kind of kinds) {
      const proposal = createEngagementDecisionProposal({
        proposalKind: kind,
        hospitalityReference: hospitalityBusiness,
      });
      assert.equal(proposal.proposalKind, kind);
    }

    assert.throws(
      () =>
        createEngagementDecisionProposal({
          proposalKind: "proposal.unknown" as never,
        }),
      /Unknown engagement-decision-proposal kind/,
    );
  });

  it("accepts only known decision-proposal statuses", () => {
    assert.equal(isEngagementDecisionProposalStatus("draft"), true);
    assert.equal(isEngagementDecisionProposalStatus("generated"), true);
    assert.equal(isEngagementDecisionProposalStatus("review"), true);
    assert.equal(isEngagementDecisionProposalStatus("accepted"), true);
    assert.equal(isEngagementDecisionProposalStatus("rejected"), true);
    assert.equal(isEngagementDecisionProposalStatus("converted"), true);
    assert.equal(isEngagementDecisionProposalStatus("archived"), true);
    assert.equal(isEngagementDecisionProposalStatus("cancelled"), true);
    assert.equal(isEngagementDecisionProposalStatus("unknown"), false);
    assert.equal(isEngagementDecisionProposalStatus("executed"), false);

    const generated = createEngagementDecisionProposal({
      proposalKind: ENGAGEMENT_DECISION_PROPOSAL_KINDS.Engagement,
      proposalStatus: ENGAGEMENT_DECISION_PROPOSAL_STATUSES.Generated,
    });
    assert.equal(generated.proposalStatus, "generated");

    const review = createEngagementDecisionProposal({
      proposalKind: ENGAGEMENT_DECISION_PROPOSAL_KINDS.Activity,
      proposalStatus: ENGAGEMENT_DECISION_PROPOSAL_STATUSES.Review,
    });
    assert.equal(review.proposalStatus, "review");

    const accepted = createEngagementDecisionProposal({
      proposalKind: ENGAGEMENT_DECISION_PROPOSAL_KINDS.Community,
      proposalStatus: ENGAGEMENT_DECISION_PROPOSAL_STATUSES.Accepted,
    });
    assert.equal(accepted.proposalStatus, "accepted");

    const converted = createEngagementDecisionProposal({
      proposalKind: ENGAGEMENT_DECISION_PROPOSAL_KINDS.Experience,
      proposalStatus: ENGAGEMENT_DECISION_PROPOSAL_STATUSES.Converted,
    });
    assert.equal(converted.proposalStatus, "converted");
  });

  it("stays apart from AI / execution / automation / workflow / approved action / reward logic", () => {
    const proposalSources = readdirSync(decisionProposalRoot)
      .filter((name) => name.endsWith(".ts"))
      .map((name) => readFileSync(join(decisionProposalRoot, name), "utf8"))
      .join("\n")
      .toLowerCase();

    assert.equal(proposalSources.includes("ai logic"), false);
    assert.equal(proposalSources.includes("execution logic"), false);
    assert.equal(proposalSources.includes("automation"), false);
    assert.equal(proposalSources.includes("workflow"), false);
    assert.equal(proposalSources.includes("approved action"), false);
    assert.equal(proposalSources.includes("reward logic"), false);

    assert.equal(proposalSources.includes("approveproposal"), false);
    assert.equal(proposalSources.includes("executeproposal"), false);
    assert.equal(proposalSources.includes("convertproposal"), false);
    assert.equal(proposalSources.includes("generateproposal"), false);
    assert.equal(proposalSources.includes("recommendaction"), false);

    assert.equal(proposalSources.includes("approveddecision?:"), false);
    assert.equal(proposalSources.includes("execution?:"), false);
    assert.equal(proposalSources.includes("automationaction?:"), false);
    assert.equal(proposalSources.includes("workflow?:"), false);
    assert.equal(proposalSources.includes("aimodel?:"), false);
    assert.equal(proposalSources.includes("prompt?:"), false);
    assert.equal(proposalSources.includes("confidence?:"), false);
    assert.equal(proposalSources.includes("score?:"), false);
    assert.equal(proposalSources.includes("ranking?:"), false);
    assert.equal(proposalSources.includes("reward?:"), false);

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
      Object.keys(pkg.dependencies ?? {}).includes("@motanos/proposals"),
      false,
    );
    assert.equal(
      Object.keys(pkg.dependencies ?? {}).includes("@motanos/recommendations"),
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
    assert.equal(
      Object.keys(pkg.dependencies ?? {}).includes("@motanos/decision-engine"),
      false,
    );

    const proposal = createEngagementDecisionProposal({
      proposalKind: ENGAGEMENT_DECISION_PROPOSAL_KINDS.Internal,
      proposalStatus: ENGAGEMENT_DECISION_PROPOSAL_STATUSES.Archived,
      hospitalityReference: hospitalityBusiness,
      parentProposalReference: "engagement-decision-proposal-parent-1",
    });
    assert.equal(isHospitalityEngagementDecisionProposal(proposal), true);
    assert.equal(proposal.proposalStatus, "archived");
    assert.equal(
      proposal.parentProposalReference,
      "engagement-decision-proposal-parent-1",
    );
  });
});
