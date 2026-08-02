/**
 * Search Engine Boundary contract tests.
 * Run: pnpm --filter @motanos/search test
 */
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { beforeEach, describe, it } from "node:test";
import {
  SEARCH_KINDS,
  SEARCH_STATUSES,
  createSearchEntry,
  isSearchEntry,
  isSearchKind,
  isSearchStatus,
  resetSearchReferenceSequence,
} from "../src/public.js";

const packageRoot = join(dirname(fileURLToPath(import.meta.url)), "..");

describe("Search Engine Boundary", () => {
  beforeEach(() => {
    resetSearchReferenceSequence();
  });

  it("creates Search Boundary context", () => {
    const searchEntry = createSearchEntry({
      tenantReference: "tenant-a",
      searchKind: SEARCH_KINDS.Experience,
      entityReference: "exp-1",
      entityKind: "experience",
      nameReference: "name-monthly-tournament",
      contextReference: "context-1",
      ownerReference: "owner-1",
    });
    assert.equal(isSearchEntry(searchEntry), true);
    assert.equal(searchEntry.searchReference, "search-1");
    assert.equal(searchEntry.searchStatus, "draft");
    assert.equal(searchEntry.searchKind, "search.experience");
    assert.equal(searchEntry.tenantReference, "tenant-a");
    assert.equal(searchEntry.entityReference, "exp-1");
  });

  it("validates tenant isolation", () => {
    assert.throws(
      () =>
        createSearchEntry({
          tenantReference: "  ",
          searchKind: SEARCH_KINDS.Entity,
        }),
      /tenantReference is required/,
    );

    assert.throws(
      () =>
        createSearchEntry(
          {
            tenantReference: "tenant-b",
            searchKind: SEARCH_KINDS.Content,
          },
          { tenantReference: "tenant-a" },
        ),
      /does not apply to this tenant/,
    );

    assert.throws(
      () =>
        createSearchEntry({
          tenantReference: "tenant-a",
          searchKind: SEARCH_KINDS.Community,
          ownerReference: "  ",
        }),
      /ownerReference must not be empty when provided/,
    );
  });

  it("accepts only known search kinds", () => {
    assert.equal(isSearchKind("search.entity"), true);
    assert.equal(isSearchKind("search.content"), true);
    assert.equal(isSearchKind("search.experience"), true);
    assert.equal(isSearchKind("search.community"), true);
    assert.equal(isSearchKind("search.resource"), true);
    assert.equal(isSearchKind("search.operational"), true);
    assert.equal(isSearchKind("search.unknown"), false);

    assert.throws(
      () =>
        createSearchEntry({
          tenantReference: "tenant-a",
          searchKind: "search.unknown" as never,
        }),
      /Unknown search kind/,
    );
  });

  it("accepts only known search statuses", () => {
    assert.equal(isSearchStatus("draft"), true);
    assert.equal(isSearchStatus("active"), true);
    assert.equal(isSearchStatus("paused"), true);
    assert.equal(isSearchStatus(SEARCH_STATUSES.Catalogued), true);
    assert.equal(isSearchStatus("archived"), true);
    assert.equal(isSearchStatus("cancelled"), true);
    assert.equal(isSearchStatus("unknown"), false);

    const active = createSearchEntry({
      tenantReference: "tenant-a",
      searchKind: SEARCH_KINDS.Resource,
      searchStatus: SEARCH_STATUSES.Active,
    });
    assert.equal(active.searchStatus, "active");

    const catalogued = createSearchEntry({
      tenantReference: "tenant-a",
      searchKind: SEARCH_KINDS.Operational,
      searchStatus: SEARCH_STATUSES.Catalogued,
    });
    assert.equal(catalogued.searchStatus, SEARCH_STATUSES.Catalogued);
  });

  it("stays separated from domain engines / find vendors / measurement packages", () => {
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
      Object.keys(pkg.dependencies ?? {}).includes("@motanos/experience"),
      false,
    );
    assert.equal(
      Object.keys(pkg.dependencies ?? {}).includes("@motanos/community"),
      false,
    );
    assert.equal(
      Object.keys(pkg.dependencies ?? {}).includes("@motanos/commerce"),
      false,
    );
    assert.equal(
      Object.keys(pkg.dependencies ?? {}).includes("@motanos/asset"),
      false,
    );

    const searchEntry = createSearchEntry({
      tenantReference: "tenant-a",
      searchKind: SEARCH_KINDS.Content,
      searchStatus: SEARCH_STATUSES.Paused,
      descriptionReference: "desc-1",
    });
    assert.equal(isSearchEntry(searchEntry), true);
    assert.equal(searchEntry.searchStatus, "paused");
  });
});
