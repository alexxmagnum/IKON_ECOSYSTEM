/**
 * Hospitality Table Interaction contract tests.
 * Run: pnpm --filter @motanos/hospitality test
 */
import assert from "node:assert/strict";
import { readFileSync, readdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { beforeEach, describe, it } from "node:test";
import {
  TABLE_INTERACTION_KINDS,
  TABLE_INTERACTION_STATUSES,
  createTableInteraction,
  isHospitalityTableInteraction,
  isTableInteractionKind,
  isTableInteractionStatus,
  resetTableInteractionReferenceSequence,
} from "../src/public.js";

const packageRoot = join(dirname(fileURLToPath(import.meta.url)), "..");
const tableInteractionRoot = join(packageRoot, "src", "table-interaction");
const hospitalityBusiness = "hospitality-ikon";
const otherHospitalityBusiness = "hospitality-marina";
const tableContextRef = "table-context-12";

describe("Hospitality Table Interaction Boundary", () => {
  beforeEach(() => {
    resetTableInteractionReferenceSequence();
  });

  it("creates TableInteraction", () => {
    const interaction = createTableInteraction({
      interactionKind: TABLE_INTERACTION_KINDS.Menu,
      hospitalityReference: hospitalityBusiness,
      tableChannelReference: "table-channel-1",
      tableContextReference: tableContextRef,
      visitContextReference: "visit-context-1",
      visitReference: "visit-1",
      actorReference: "actor-1",
      experienceReference: "experience-1",
      menuReference: "menu-ikon-shared",
      metadata: { note: "opaque-meta" },
    });
    assert.equal(isHospitalityTableInteraction(interaction), true);
    assert.equal(interaction.interactionReference, "table-interaction-1");
    assert.equal(interaction.interactionStatus, "draft");
    assert.equal(interaction.interactionKind, "interaction.menu");
    assert.equal(interaction.hospitalityReference, hospitalityBusiness);
    assert.equal(interaction.tableContextReference, tableContextRef);
    assert.equal(
      Object.prototype.hasOwnProperty.call(interaction, "orderReference"),
      false,
    );
    assert.equal(
      Object.prototype.hasOwnProperty.call(interaction, "paymentReference"),
      false,
    );
    assert.equal(
      Object.prototype.hasOwnProperty.call(interaction, "cartReference"),
      false,
    );
  });

  it("belongs to the correct table context", () => {
    const interaction = createTableInteraction({
      interactionKind: TABLE_INTERACTION_KINDS.Discovery,
      hospitalityReference: hospitalityBusiness,
      tableContextReference: tableContextRef,
      tableChannelReference: "table-channel-qr-1",
    });

    assert.equal(interaction.tableContextReference, tableContextRef);
    assert.equal(interaction.hospitalityReference, hospitalityBusiness);

    assert.throws(
      () =>
        createTableInteraction({
          interactionKind: TABLE_INTERACTION_KINDS.Service,
          tableContextReference: "  ",
        }),
      /tableContextReference must not be empty when provided/,
    );

    assert.throws(
      () =>
        createTableInteraction(
          {
            interactionKind: TABLE_INTERACTION_KINDS.Community,
            hospitalityReference: otherHospitalityBusiness,
            tableContextReference: tableContextRef,
          },
          { hospitalityReference: hospitalityBusiness },
        ),
      /does not apply to this hospitality business/,
    );
  });

  it("accepts only known table-interaction kinds", () => {
    assert.equal(isTableInteractionKind("interaction.discovery"), true);
    assert.equal(isTableInteractionKind("interaction.menu"), true);
    assert.equal(isTableInteractionKind("interaction.service"), true);
    assert.equal(isTableInteractionKind("interaction.experience"), true);
    assert.equal(isTableInteractionKind("interaction.community"), true);
    assert.equal(isTableInteractionKind("interaction.internal"), true);
    assert.equal(isTableInteractionKind("order.create"), false);
    assert.equal(isTableInteractionKind("cart.open"), false);

    const kinds = [
      TABLE_INTERACTION_KINDS.Discovery,
      TABLE_INTERACTION_KINDS.Menu,
      TABLE_INTERACTION_KINDS.Service,
      TABLE_INTERACTION_KINDS.Experience,
      TABLE_INTERACTION_KINDS.Community,
      TABLE_INTERACTION_KINDS.Internal,
    ] as const;

    for (const kind of kinds) {
      const interaction = createTableInteraction({
        interactionKind: kind,
        hospitalityReference: hospitalityBusiness,
        tableContextReference: tableContextRef,
      });
      assert.equal(interaction.interactionKind, kind);
    }

    assert.throws(
      () =>
        createTableInteraction({
          interactionKind: "interaction.unknown" as never,
        }),
      /Unknown table-interaction kind/,
    );
  });

  it("accepts only known table-interaction statuses", () => {
    assert.equal(isTableInteractionStatus("draft"), true);
    assert.equal(isTableInteractionStatus("available"), true);
    assert.equal(isTableInteractionStatus("started"), true);
    assert.equal(isTableInteractionStatus("active"), true);
    assert.equal(isTableInteractionStatus("completed"), true);
    assert.equal(isTableInteractionStatus("cancelled"), true);
    assert.equal(isTableInteractionStatus("archived"), true);
    assert.equal(isTableInteractionStatus("unknown"), false);
    assert.equal(isTableInteractionStatus("paid"), false);
    assert.equal(isTableInteractionStatus("cooking"), false);

    const available = createTableInteraction({
      interactionKind: TABLE_INTERACTION_KINDS.Experience,
      interactionStatus: TABLE_INTERACTION_STATUSES.Available,
    });
    assert.equal(available.interactionStatus, "available");

    const started = createTableInteraction({
      interactionKind: TABLE_INTERACTION_KINDS.Menu,
      interactionStatus: TABLE_INTERACTION_STATUSES.Started,
    });
    assert.equal(started.interactionStatus, "started");

    const active = createTableInteraction({
      interactionKind: TABLE_INTERACTION_KINDS.Service,
      interactionStatus: TABLE_INTERACTION_STATUSES.Active,
    });
    assert.equal(active.interactionStatus, "active");

    const completed = createTableInteraction({
      interactionKind: TABLE_INTERACTION_KINDS.Community,
      interactionStatus: TABLE_INTERACTION_STATUSES.Completed,
    });
    assert.equal(completed.interactionStatus, "completed");
  });

  it("stays apart from order / payment / kitchen / pricing / cart logic", () => {
    const interactionSources = readdirSync(tableInteractionRoot)
      .filter((name) => name.endsWith(".ts"))
      .map((name) => readFileSync(join(tableInteractionRoot, name), "utf8"))
      .join("\n")
      .toLowerCase();

    assert.equal(interactionSources.includes("order logic"), false);
    assert.equal(interactionSources.includes("payment logic"), false);
    assert.equal(interactionSources.includes("kitchen logic"), false);
    assert.equal(interactionSources.includes("pricing logic"), false);
    assert.equal(interactionSources.includes("cart logic"), false);

    assert.equal(interactionSources.includes("createorder"), false);
    assert.equal(interactionSources.includes("opencart"), false);
    assert.equal(interactionSources.includes("processpayment"), false);
    assert.equal(interactionSources.includes("sendtokitchen"), false);
    assert.equal(interactionSources.includes("applydiscount"), false);

    assert.equal(interactionSources.includes("orderreference"), false);
    assert.equal(interactionSources.includes("paymentreference"), false);
    assert.equal(interactionSources.includes("cartreference"), false);

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
      Object.keys(pkg.dependencies ?? {}).includes("@motanos/interaction"),
      false,
    );
    assert.equal(
      Object.keys(pkg.dependencies ?? {}).includes("@motanos/action"),
      false,
    );
    assert.equal(
      Object.keys(pkg.dependencies ?? {}).includes("@motanos/customer-action"),
      false,
    );

    const interaction = createTableInteraction({
      interactionKind: TABLE_INTERACTION_KINDS.Internal,
      interactionStatus: TABLE_INTERACTION_STATUSES.Archived,
      hospitalityReference: hospitalityBusiness,
      parentInteractionReference: "table-interaction-parent-1",
      tableContextReference: tableContextRef,
    });
    assert.equal(isHospitalityTableInteraction(interaction), true);
    assert.equal(interaction.interactionStatus, "archived");
    assert.equal(
      interaction.parentInteractionReference,
      "table-interaction-parent-1",
    );
  });
});
