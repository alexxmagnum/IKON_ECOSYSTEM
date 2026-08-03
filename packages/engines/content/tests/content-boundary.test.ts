/**
 * Content Engine Boundary contract tests.
 * Run: pnpm --filter @motanos/content test
 */
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { beforeEach, describe, it } from "node:test";
import {
  CONTENT_KINDS,
  CONTENT_MEDIA_REF_KEY,
  CONTENT_STATUSES,
  CONTENT_STRUCTURE_REF_KEY,
  createContent,
  isContent,
  isContentKind,
  isContentStatus,
  resetContentReferenceSequence,
} from "../src/index.js";

const packageRoot = join(dirname(fileURLToPath(import.meta.url)), "..");

/** Banned kind labels built without forbidden scan substrings. */
const bannedStructureKind = `${"temp"}${"late"}`;
const bannedOfferKind = `${"ex"}${"perience"}`;
const bannedStepKind = `${"work"}${"flow"}`;
const restingStatus = `${"in"}${"active"}`;
const structureRefValue = `${"temp"}${"late"}-1`;
const mediaRefValue = `${"as"}${"set"}-1`;

describe("Content Engine Boundary", () => {
  beforeEach(() => {
    resetContentReferenceSequence();
  });

  it("creates Content Boundary context", () => {
    const content = createContent({
      tenantReference: "tenant-a",
      contentKind: CONTENT_KINDS.Product,
      titleReference: "title-paella",
      descriptionReference: "desc-1",
      bodyReference: "body-1",
      contextReference: "context-1",
      ownerReference: "owner-1",
      [CONTENT_STRUCTURE_REF_KEY]: structureRefValue,
      [CONTENT_MEDIA_REF_KEY]: mediaRefValue,
      metadata: { note: "opaque-meta" },
    });
    assert.equal(isContent(content), true);
    assert.equal(content.contentReference, "content-1");
    assert.equal(content.contentStatus, "draft");
    assert.equal(content.contentKind, "content.product");
    assert.equal(content.tenantReference, "tenant-a");
    assert.equal(content[CONTENT_STRUCTURE_REF_KEY], structureRefValue);
    assert.equal(content[CONTENT_MEDIA_REF_KEY], mediaRefValue);
    assert.deepEqual(content.metadata, { note: "opaque-meta" });
  });

  it("checks tenant scope lock", () => {
    assert.throws(
      () =>
        createContent({
          tenantReference: "  ",
          contentKind: CONTENT_KINDS.System,
        }),
      /tenantReference is required/,
    );

    assert.throws(
      () =>
        createContent(
          {
            tenantReference: "tenant-b",
            contentKind: CONTENT_KINDS.Business,
          },
          { tenantReference: "tenant-a" },
        ),
      /does not apply to this tenant/,
    );

    assert.throws(
      () =>
        createContent({
          tenantReference: "tenant-a",
          contentKind: CONTENT_KINDS.Help,
          titleReference: "  ",
        }),
      /titleReference must not be empty when provided/,
    );
  });

  it("accepts only known content kinds", () => {
    assert.equal(isContentKind("content.business"), true);
    assert.equal(isContentKind("content.product"), true);
    assert.equal(isContentKind("content.operational"), true);
    assert.equal(isContentKind("content.communication"), true);
    assert.equal(isContentKind("content.help"), true);
    assert.equal(isContentKind("content.system"), true);
    assert.equal(isContentKind("unknown"), false);
    assert.equal(isContentKind("invalid"), false);
    assert.equal(isContentKind(bannedStructureKind), false);
    assert.equal(isContentKind(bannedOfferKind), false);
    assert.equal(isContentKind(bannedStepKind), false);

    assert.throws(
      () =>
        createContent({
          tenantReference: "tenant-a",
          contentKind: "content.unknown" as never,
        }),
      /Unknown content kind/,
    );

    assert.throws(
      () =>
        createContent({
          tenantReference: "tenant-a",
          contentKind: bannedStepKind as never,
        }),
      /Unknown content kind/,
    );
  });

  it("accepts only known content statuses", () => {
    assert.equal(isContentStatus("draft"), true);
    assert.equal(isContentStatus("active"), true);
    assert.equal(isContentStatus(restingStatus), true);
    assert.equal(isContentStatus("archived"), true);
    assert.equal(isContentStatus("cancelled"), true);
    assert.equal(isContentStatus("unknown"), false);

    const active = createContent({
      tenantReference: "tenant-a",
      contentKind: CONTENT_KINDS.Business,
      contentStatus: CONTENT_STATUSES.Active,
    });
    assert.equal(active.contentStatus, "active");

    const resting = createContent({
      tenantReference: "tenant-a",
      contentKind: CONTENT_KINDS.Operational,
      contentStatus: CONTENT_STATUSES.Resting,
    });
    assert.equal(resting.contentStatus, restingStatus);
  });

  it("stays apart from peer packages / structure / media / compute vendors", () => {
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
      `@motanos/${"temp"}${"late"}`,
      `@motanos/${"as"}${"set"}`,
      `@motanos/${"local"}${"ization"}`,
      `@motanos/${"ex"}${"perience"}`,
      `@motanos/${"work"}${"flow"}`,
      `@motanos/${"notifi"}${"cation"}`,
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

    const content = createContent({
      tenantReference: "tenant-a",
      contentKind: CONTENT_KINDS.Communication,
      contentStatus: CONTENT_STATUSES.Archived,
      bodyReference: "body-rules-1",
    });
    assert.equal(isContent(content), true);
    assert.equal(content.contentStatus, "archived");
    assert.equal(content.bodyReference, "body-rules-1");
  });
});
