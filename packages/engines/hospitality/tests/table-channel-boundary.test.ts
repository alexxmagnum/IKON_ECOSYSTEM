/**
 * Hospitality Table Channel contract tests.
 * Run: pnpm --filter @motanos/hospitality test
 */
import assert from "node:assert/strict";
import { readFileSync, readdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { beforeEach, describe, it } from "node:test";
import {
  TABLE_CHANNEL_KINDS,
  TABLE_CHANNEL_STATUSES,
  createTableChannel,
  isHospitalityTableChannel,
  isTableChannelKind,
  isTableChannelStatus,
  resetTableChannelReferenceSequence,
} from "../src/public.js";

const packageRoot = join(dirname(fileURLToPath(import.meta.url)), "..");
const tableChannelRoot = join(packageRoot, "src", "table-channel");
const hospitalityBusiness = "hospitality-ikon";
const otherHospitalityBusiness = "hospitality-marina";
const sharedMenu = "menu-ikon-shared";

describe("Hospitality Table Channel Boundary", () => {
  beforeEach(() => {
    resetTableChannelReferenceSequence();
  });

  it("creates TableChannel", () => {
    const channel = createTableChannel({
      channelKind: TABLE_CHANNEL_KINDS.Public,
      hospitalityReference: hospitalityBusiness,
      tableContextReference: "table-context-1",
      tableReference: "table-12",
      visitContextReference: "visit-context-1",
      experienceReference: "experience-1",
      menuReference: sharedMenu,
      metadata: { note: "opaque-meta" },
    });
    assert.equal(isHospitalityTableChannel(channel), true);
    assert.equal(channel.channelReference, "table-channel-1");
    assert.equal(channel.channelStatus, "draft");
    assert.equal(channel.channelKind, "table-channel.public");
    assert.equal(channel.hospitalityReference, hospitalityBusiness);
    assert.equal(channel.menuReference, sharedMenu);
    assert.equal(
      Object.prototype.hasOwnProperty.call(channel, "qrMenuReference"),
      false,
    );
    assert.equal(
      Object.prototype.hasOwnProperty.call(channel, "webMenuReference"),
      false,
    );
  });

  it("shares the same menuReference across public and qr channels", () => {
    const publicChannel = createTableChannel({
      channelKind: TABLE_CHANNEL_KINDS.Public,
      hospitalityReference: hospitalityBusiness,
      menuReference: sharedMenu,
    });
    const qrChannel = createTableChannel({
      channelKind: TABLE_CHANNEL_KINDS.Qr,
      hospitalityReference: hospitalityBusiness,
      tableContextReference: "table-context-12",
      menuReference: sharedMenu,
    });

    assert.equal(publicChannel.menuReference, sharedMenu);
    assert.equal(qrChannel.menuReference, sharedMenu);
    assert.equal(publicChannel.menuReference, qrChannel.menuReference);
    assert.notEqual(publicChannel.channelKind, qrChannel.channelKind);
    assert.equal(
      Object.prototype.hasOwnProperty.call(publicChannel, "qrMenuReference"),
      false,
    );
    assert.equal(
      Object.prototype.hasOwnProperty.call(qrChannel, "webMenuReference"),
      false,
    );

    assert.throws(
      () =>
        createTableChannel(
          {
            channelKind: TABLE_CHANNEL_KINDS.Public,
            hospitalityReference: otherHospitalityBusiness,
            menuReference: sharedMenu,
          },
          { hospitalityReference: hospitalityBusiness },
        ),
      /does not apply to this hospitality business/,
    );
  });

  it("separates channel kinds within the same hospitality", () => {
    assert.equal(isTableChannelKind("table-channel.public"), true);
    assert.equal(isTableChannelKind("table-channel.qr"), true);
    assert.equal(isTableChannelKind("table-channel.staff"), true);
    assert.equal(isTableChannelKind("table-channel.internal"), true);
    assert.equal(isTableChannelKind("channel.public_web"), false);
    assert.equal(isTableChannelKind("channel.table_qr"), false);

    const publicChannel = createTableChannel({
      channelKind: TABLE_CHANNEL_KINDS.Public,
      hospitalityReference: hospitalityBusiness,
      menuReference: sharedMenu,
    });
    const qrChannel = createTableChannel({
      channelKind: TABLE_CHANNEL_KINDS.Qr,
      hospitalityReference: hospitalityBusiness,
      menuReference: sharedMenu,
    });

    assert.equal(publicChannel.channelKind, "table-channel.public");
    assert.equal(qrChannel.channelKind, "table-channel.qr");
    assert.notEqual(publicChannel.channelKind, qrChannel.channelKind);
    assert.equal(
      publicChannel.hospitalityReference,
      qrChannel.hospitalityReference,
    );

    assert.throws(
      () =>
        createTableChannel({
          channelKind: "table-channel.unknown" as never,
        }),
      /Unknown table-channel kind/,
    );
  });

  it("accepts only known table-channel statuses", () => {
    assert.equal(isTableChannelStatus("draft"), true);
    assert.equal(isTableChannelStatus("active"), true);
    assert.equal(isTableChannelStatus("inactive"), true);
    assert.equal(isTableChannelStatus("archived"), true);
    assert.equal(isTableChannelStatus("cancelled"), true);
    assert.equal(isTableChannelStatus("unknown"), false);
    assert.equal(isTableChannelStatus("occupied"), false);

    const active = createTableChannel({
      channelKind: TABLE_CHANNEL_KINDS.Staff,
      channelStatus: TABLE_CHANNEL_STATUSES.Active,
    });
    assert.equal(active.channelStatus, "active");

    const inactive = createTableChannel({
      channelKind: TABLE_CHANNEL_KINDS.Qr,
      channelStatus: TABLE_CHANNEL_STATUSES.Inactive,
    });
    assert.equal(inactive.channelStatus, "inactive");
  });

  it("stays apart from ticket / till / basket / prep / tariff logic", () => {
    const channelSources = readdirSync(tableChannelRoot)
      .filter((name) => name.endsWith(".ts"))
      .map((name) => readFileSync(join(tableChannelRoot, name), "utf8"))
      .join("\n")
      .toLowerCase();

    assert.equal(channelSources.includes("order logic"), false);
    assert.equal(channelSources.includes("payment logic"), false);
    assert.equal(channelSources.includes("cart logic"), false);
    assert.equal(channelSources.includes("kitchen logic"), false);
    assert.equal(channelSources.includes("pricing logic"), false);

    assert.equal(channelSources.includes("generateqr"), false);
    assert.equal(channelSources.includes("scanqr"), false);
    assert.equal(channelSources.includes("opencart"), false);
    assert.equal(channelSources.includes("createorder"), false);
    assert.equal(channelSources.includes("processpayment"), false);

    assert.equal(channelSources.includes("qrmenureference"), false);
    assert.equal(channelSources.includes("webmenureference"), false);

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
      Object.keys(pkg.dependencies ?? {}).includes("@motanos/channel"),
      false,
    );
    assert.equal(
      Object.keys(pkg.dependencies ?? {}).includes("@motanos/menu-channel"),
      false,
    );
    assert.equal(
      Object.keys(pkg.dependencies ?? {}).includes("@motanos/qr-menu"),
      false,
    );

    const channel = createTableChannel({
      channelKind: TABLE_CHANNEL_KINDS.Internal,
      channelStatus: TABLE_CHANNEL_STATUSES.Archived,
      hospitalityReference: hospitalityBusiness,
      parentChannelReference: "table-channel-parent-1",
      menuReference: sharedMenu,
    });
    assert.equal(isHospitalityTableChannel(channel), true);
    assert.equal(channel.channelStatus, "archived");
    assert.equal(channel.parentChannelReference, "table-channel-parent-1");
    assert.equal(channel.menuReference, sharedMenu);
  });
});
