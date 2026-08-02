/**
 * Contract-level validation for @motanos/permissions refinements.
 * No auth, database, tenant, or domain fakes.
 *
 * Run: pnpm --filter @motanos/permissions test
 */
import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  OFFICIAL_ROLES,
  allow,
  authorizationResult,
  deny,
  filterOfficialRoles,
  hasRole,
  isAllowed,
  isDenied,
  isOfficialRole,
  isPlatformAdmin,
  toAuthorizationContext,
  toAuthorizationRequest,
  type AuthorizationContext,
  type AuthorizationService,
  type PermissionActionCatalog,
  type PermissionService,
} from "../src/index.js";

describe("@motanos/permissions authorization contracts", () => {
  it("creates AuthorizationContext with actor, action, resource; metadata optional", () => {
    const context: AuthorizationContext = {
      actor: "actor-opaque-1",
      action: "read",
      resource: {
        resourceType: "resource",
        resourceReference: "opaque-resource-1",
      },
    };

    assert.equal(context.actor, "actor-opaque-1");
    assert.equal(context.action, "read");
    assert.equal(context.resource.resourceType, "resource");
    assert.equal(context.metadata, undefined);

    const withMeta: AuthorizationContext = {
      ...context,
      metadata: { correlationId: "c-1" },
    };
    assert.equal(withMeta.metadata?.correlationId, "c-1");
  });

  it("distinguishes Allowed and Denied decisions", () => {
    const allowed = allow("ok");
    const denied = deny("nope");

    assert.equal(allowed.decision, "Allowed");
    assert.equal(denied.decision, "Denied");
    assert.equal(isAllowed(allowed), true);
    assert.equal(isDenied(denied), true);
    assert.equal(isAllowed(denied), false);
    assert.equal(isDenied(allowed), false);
  });

  it("check-shaped AuthorizationService returns a decision contract", async () => {
    const service: AuthorizationService = {
      async check(context) {
        return authorizationResult(allow("checked"), context);
      },
      async authorize(context) {
        return authorizationResult(allow("authorized"), context);
      },
    };

    const context: AuthorizationContext = {
      actor: "a1",
      action: "manage",
      resource: { resourceType: "thing", resourceReference: "t1" },
    };

    const checked = await service.check(context);
    assert.equal(checked.decision.decision, "Allowed");
    assert.equal(checked.context.actor, "a1");
    assert.equal(checked.request.actorReference, "a1");

    const authorized = await service.authorize(context);
    assert.equal(authorized.decision.decision, "Allowed");
    assert.equal(authorized.context.action, "manage");
  });

  it("PermissionService remains a compatible alias of AuthorizationService", async () => {
    const service: PermissionService = {
      async check(context) {
        return authorizationResult(deny("legacy-alias"), context);
      },
      async authorize(context) {
        return this.check(context);
      },
    };

    const result = await service.check({
      actor: "a2",
      action: "delete",
      resource: { resourceType: "thing", resourceReference: "t2" },
    });
    assert.equal(isDenied(result.decision), true);
  });

  it("maps AuthorizationRequest ↔ AuthorizationContext", () => {
    const request = {
      actorReference: "actor-x",
      action: "update",
      resource: { resourceType: "r", resourceReference: "1" },
      metadata: { source: "test" },
    };
    const context = toAuthorizationContext(request);
    assert.equal(context.actor, "actor-x");
    assert.deepEqual(toAuthorizationRequest(context), request);
  });

  it("supports domain-owned PermissionActionCatalog without coupling", () => {
    const catalog = {
      Create: "example.create",
      Read: "example.read",
    } as const satisfies PermissionActionCatalog;

    assert.equal(catalog.Create, "example.create");
    const context: AuthorizationContext = {
      actor: "a3",
      action: catalog.Read,
      resource: { resourceType: "example", resourceReference: "e1" },
    };
    assert.equal(context.action, "example.read");
  });

  it("preserves DEC-002 RBAC legacy exports", () => {
    assert.ok(OFFICIAL_ROLES.includes("Member"));
    assert.equal(isOfficialRole("Platform Admin"), true);
    assert.equal(isOfficialRole("not-a-role"), false);
    const roles = filterOfficialRoles(["Member", "fake", "Platform Admin"]);
    assert.equal(hasRole(roles, "Member"), true);
    assert.equal(isPlatformAdmin(["Platform Admin"]), true);
  });
});
