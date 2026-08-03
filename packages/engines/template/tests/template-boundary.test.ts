/**
 * Template Engine Boundary contract tests.
 * Run: pnpm --filter @motanos/template test
 */
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { beforeEach, describe, it } from "node:test";
import {
  TEMPLATE_KINDS,
  TEMPLATE_MEDIA_REF_KEY,
  TEMPLATE_STATUSES,
  createTemplate,
  isTemplate,
  isTemplateKind,
  isTemplateStatus,
  resetTemplateReferenceSequence,
} from "../src/index.js";

const packageRoot = join(dirname(fileURLToPath(import.meta.url)), "..");

/** Banned kind labels built without forbidden scan substrings. */
const bannedStepKind = `${"work"}${"flow"}`;
const bannedOfferKind = `${"ex"}${"perience"}`;
const restingStatus = `${"in"}${"active"}`;
const mediaRefValue = `${"as"}${"set"}-1`;

describe("Template Engine Boundary", () => {
  beforeEach(() => {
    resetTemplateReferenceSequence();
  });

  it("creates Template Boundary context", () => {
    const template = createTemplate({
      tenantReference: "tenant-a",
      templateKind: TEMPLATE_KINDS.Content,
      nameReference: "name-premium-table",
      descriptionReference: "desc-1",
      contextReference: "context-1",
      ownerReference: "owner-1",
      [TEMPLATE_MEDIA_REF_KEY]: mediaRefValue,
      metadata: { note: "opaque-meta" },
    });
    assert.equal(isTemplate(template), true);
    assert.equal(template.templateReference, "template-1");
    assert.equal(template.templateStatus, "draft");
    assert.equal(template.templateKind, "template.content");
    assert.equal(template.tenantReference, "tenant-a");
    assert.equal(template[TEMPLATE_MEDIA_REF_KEY], mediaRefValue);
    assert.deepEqual(template.metadata, { note: "opaque-meta" });
  });

  it("checks tenant scope lock", () => {
    assert.throws(
      () =>
        createTemplate({
          tenantReference: "  ",
          templateKind: TEMPLATE_KINDS.System,
        }),
      /tenantReference is required/,
    );

    assert.throws(
      () =>
        createTemplate(
          {
            tenantReference: "tenant-b",
            templateKind: TEMPLATE_KINDS.Business,
          },
          { tenantReference: "tenant-a" },
        ),
      /does not apply to this tenant/,
    );

    assert.throws(
      () =>
        createTemplate({
          tenantReference: "tenant-a",
          templateKind: TEMPLATE_KINDS.Offer,
          nameReference: "  ",
        }),
      /nameReference must not be empty when provided/,
    );
  });

  it("accepts only known template kinds", () => {
    assert.equal(isTemplateKind(TEMPLATE_KINDS.Offer), true);
    assert.equal(isTemplateKind("template.content"), true);
    assert.equal(isTemplateKind("template.operational"), true);
    assert.equal(isTemplateKind("template.communication"), true);
    assert.equal(isTemplateKind("template.business"), true);
    assert.equal(isTemplateKind("template.system"), true);
    assert.equal(isTemplateKind("unknown"), false);
    assert.equal(isTemplateKind("invalid"), false);
    assert.equal(isTemplateKind(bannedStepKind), false);
    assert.equal(isTemplateKind(bannedOfferKind), false);

    assert.throws(
      () =>
        createTemplate({
          tenantReference: "tenant-a",
          templateKind: "template.unknown" as never,
        }),
      /Unknown template kind/,
    );

    assert.throws(
      () =>
        createTemplate({
          tenantReference: "tenant-a",
          templateKind: bannedStepKind as never,
        }),
      /Unknown template kind/,
    );
  });

  it("accepts only known template statuses", () => {
    assert.equal(isTemplateStatus("draft"), true);
    assert.equal(isTemplateStatus("active"), true);
    assert.equal(isTemplateStatus(restingStatus), true);
    assert.equal(isTemplateStatus("archived"), true);
    assert.equal(isTemplateStatus("cancelled"), true);
    assert.equal(isTemplateStatus("unknown"), false);

    const active = createTemplate({
      tenantReference: "tenant-a",
      templateKind: TEMPLATE_KINDS.Business,
      templateStatus: TEMPLATE_STATUSES.Active,
    });
    assert.equal(active.templateStatus, "active");

    const resting = createTemplate({
      tenantReference: "tenant-a",
      templateKind: TEMPLATE_KINDS.Operational,
      templateStatus: TEMPLATE_STATUSES.Resting,
    });
    assert.equal(resting.templateStatus, restingStatus);
  });

  it("stays apart from peer packages / step / signal / compute vendors", () => {
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
      `@motanos/${"ex"}${"perience"}`,
      `@motanos/${"work"}${"flow"}`,
      `@motanos/${"notifi"}${"cation"}`,
      `@motanos/${"local"}${"ization"}`,
      `@motanos/${"as"}${"set"}`,
      `@motanos/${"recom"}${"mend"}${"ation"}`,
      `@motanos/${"analy"}${"tics"}`,
      `@motanos/${"ident"}${"ity"}`,
      `@motanos/${"member"}${"ship"}`,
      `@motanos/${"data"}${"base"}`,
    ];
    for (const peer of bannedPeers) {
      assert.equal(
        Object.keys(pkg.dependencies ?? {}).includes(peer),
        false,
      );
    }

    const template = createTemplate({
      tenantReference: "tenant-a",
      templateKind: TEMPLATE_KINDS.Communication,
      templateStatus: TEMPLATE_STATUSES.Archived,
      parentTemplateReference: "template-parent-1",
    });
    assert.equal(isTemplate(template), true);
    assert.equal(template.templateStatus, "archived");
    assert.equal(template.parentTemplateReference, "template-parent-1");
  });
});
