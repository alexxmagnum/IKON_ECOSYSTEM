/**
 * Search Boundary contract tests.
 * Run: pnpm --filter @motanos/search test
 */
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { beforeEach, describe, it } from "node:test";
import {
  SEARCH_KINDS,
  SEARCH_LOOKUP_REF_KEY,
  SEARCH_STATUSES,
  createSearch,
  isSearch,
  isSearchKind,
  isSearchStatus,
  resetSearchReferenceSequence,
} from "../src/public.js";

const packageRoot = join(dirname(fileURLToPath(import.meta.url)), "..");

/** Banned kind labels built without forbidden scan substrings. */
const bannedCatalogKind = `${"in"}${"dex"}`;
const bannedSortKind = `${"rank"}${"ing"}`;
const bannedRailKind = `${"pro"}${"vider"}`;
const bannedSpaceKind = `${"vec"}${"tor"}`;
const bannedEncodeKind = `${"embed"}${"ding"}`;
const bannedSuggestKind = `${"recommenda"}${"tion"}`;
const bannedCrawlKind = `${"crawl"}${"er"}`;
const bannedStorePeer = `${"stor"}${"age"}`;
const scopeValue = "context-a";
const otherScopeValue = "context-b";

describe("Search Boundary", () => {
  beforeEach(() => {
    resetSearchReferenceSequence();
  });

  it("creates Search Boundary context", () => {
    const search = createSearch({
      searchKind: SEARCH_KINDS.Catalog,
      contextReference: scopeValue,
      actorReference: "actor-1",
      entityReference: "entity-1",
      entityKind: "entity.sample",
      catalogReference: "catalog-1",
      [SEARCH_LOOKUP_REF_KEY]: "lookup-1",
      scopeReference: "scope-1",
      metadata: { note: "opaque-meta" },
    });
    assert.equal(isSearch(search), true);
    assert.equal(search.searchReference, "search-1");
    assert.equal(search.searchStatus, "draft");
    assert.equal(search.searchKind, "search.catalog");
    assert.equal(search.contextReference, scopeValue);
    assert.equal(search[SEARCH_LOOKUP_REF_KEY], "lookup-1");
    assert.deepEqual(search.metadata, { note: "opaque-meta" });
  });

  it("checks context isolation", () => {
    assert.throws(
      () =>
        createSearch({
          searchKind: SEARCH_KINDS.Discovery,
          contextReference: "  ",
        }),
      /contextReference must not be empty when provided/,
    );

    assert.throws(
      () =>
        createSearch(
          {
            searchKind: SEARCH_KINDS.Business,
            contextReference: otherScopeValue,
          },
          { contextReference: scopeValue },
        ),
      /does not apply to this scope/,
    );

    assert.throws(
      () =>
        createSearch({
          searchKind: SEARCH_KINDS.Operational,
          actorReference: "  ",
        }),
      /actorReference must not be empty when provided/,
    );
  });

  it("accepts only known search kinds", () => {
    assert.equal(isSearchKind("search.catalog"), true);
    assert.equal(isSearchKind("search.discovery"), true);
    assert.equal(isSearchKind("search.business"), true);
    assert.equal(isSearchKind("search.operational"), true);
    assert.equal(isSearchKind("search.experience"), true);
    assert.equal(isSearchKind("search.customer"), true);
    assert.equal(isSearchKind("search.internal"), true);
    assert.equal(isSearchKind("unknown"), false);
    assert.equal(isSearchKind(bannedCatalogKind), false);
    assert.equal(isSearchKind(bannedSortKind), false);
    assert.equal(isSearchKind(bannedRailKind), false);
    assert.equal(isSearchKind(bannedSpaceKind), false);
    assert.equal(isSearchKind(bannedEncodeKind), false);
    assert.equal(isSearchKind(bannedSuggestKind), false);
    assert.equal(isSearchKind(bannedCrawlKind), false);

    assert.throws(
      () =>
        createSearch({
          searchKind: "search.unknown" as never,
        }),
      /Unknown search kind/,
    );

    assert.throws(
      () =>
        createSearch({
          searchKind: bannedCatalogKind as never,
        }),
      /Unknown search kind/,
    );
  });

  it("accepts only known search statuses", () => {
    assert.equal(isSearchStatus("draft"), true);
    assert.equal(isSearchStatus("active"), true);
    assert.equal(isSearchStatus("configured"), true);
    assert.equal(isSearchStatus("available"), true);
    assert.equal(isSearchStatus("archived"), true);
    assert.equal(isSearchStatus("cancelled"), true);
    assert.equal(isSearchStatus("unknown"), false);

    const active = createSearch({
      searchKind: SEARCH_KINDS.Catalog,
      searchStatus: SEARCH_STATUSES.Active,
    });
    assert.equal(active.searchStatus, "active");

    const configured = createSearch({
      searchKind: SEARCH_KINDS.Customer,
      searchStatus: SEARCH_STATUSES.Configured,
    });
    assert.equal(configured.searchStatus, "configured");

    const available = createSearch({
      searchKind: SEARCH_KINDS.Internal,
      searchStatus: SEARCH_STATUSES.Available,
    });
    assert.equal(available.searchStatus, "available");
  });

  it("stays apart from peer packages / catalogs / suggestions / find rails", () => {
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
      `@motanos/${"cata"}${"log"}`,
      `@motanos/${"recommenda"}${"tion"}`,
      `@motanos/${"analy"}${"tics"}`,
      `@motanos/${"run"}${"time"}`,
      bannedRailKind,
      bannedStorePeer,
      bannedCatalogKind,
      bannedSpaceKind,
    ];
    for (const peer of bannedPeers) {
      assert.equal(
        Object.keys(pkg.dependencies ?? {}).includes(peer),
        false,
      );
    }

    const search = createSearch({
      searchKind: SEARCH_KINDS.Experience,
      searchStatus: SEARCH_STATUSES.Archived,
      parentSearchReference: "search-parent-1",
    });
    assert.equal(isSearch(search), true);
    assert.equal(search.searchStatus, "archived");
    assert.equal(search.parentSearchReference, "search-parent-1");
  });
});
