/**
 * Hospitality Channel contract tests.
 * Run: pnpm --filter @motanos/hospitality test
 */
import assert from "node:assert/strict";
import { readFileSync, readdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { beforeEach, describe, it } from "node:test";
import {
  CHANNEL_KINDS,
  CHANNEL_STATUSES,
  createChannel,
  isChannelKind,
  isChannelStatus,
  isHospitalityChannel,
  resetChannelReferenceSequence,
} from "../src/public.js";

const packageRoot = join(dirname(fileURLToPath(import.meta.url)), "..");
const channelsRoot = join(packageRoot, "src", "channels");
const hospitalityBusiness = "hospitality-ikon";
const otherHospitalityBusiness = "hospitality-marina";

describe("Hospitality Channel Boundary", () => {
  beforeEach(() => {
    resetChannelReferenceSequence();
  });

  it("creates Channel", () => {
    const channel = createChannel({
      channelKind: CHANNEL_KINDS.TableQr,
      hospitalityReference: hospitalityBusiness,
      contextReference: "context-1",
      tableReference: "table-1",
      experienceReference: "experience-1",
      locationReference: "location-1",
      metadata: { note: "opaque-meta" },
    });
    assert.equal(isHospitalityChannel(channel), true);
    assert.equal(channel.channelReference, "channel-1");
    assert.equal(channel.channelStatus, "draft");
    assert.equal(channel.channelKind, "channel.table_qr");
    assert.equal(channel.hospitalityReference, hospitalityBusiness);
    assert.equal(channel.tableReference, "table-1");
    assert.equal(channel.experienceReference, "experience-1");
  });

  it("checks hospitality business isolation", () => {
    assert.throws(
      () =>
        createChannel({
          channelKind: CHANNEL_KINDS.PublicWeb,
          hospitalityReference: "  ",
        }),
      /hospitalityReference must not be empty when provided/,
    );

    assert.throws(
      () =>
        createChannel(
          {
            channelKind: CHANNEL_KINDS.Staff,
            hospitalityReference: otherHospitalityBusiness,
          },
          { hospitalityReference: hospitalityBusiness },
        ),
      /does not apply to this hospitality business/,
    );

    assert.throws(
      () =>
        createChannel({
          channelKind: CHANNEL_KINDS.Terminal,
          tableReference: "  ",
        }),
      /tableReference must not be empty when provided/,
    );
  });

  it("accepts only known channel kinds", () => {
    assert.equal(isChannelKind("channel.public_web"), true);
    assert.equal(isChannelKind("channel.table_qr"), true);
    assert.equal(isChannelKind("channel.staff"), true);
    assert.equal(isChannelKind("channel.terminal"), true);
    assert.equal(isChannelKind("channel.internal"), true);
    assert.equal(isChannelKind("menu.web"), false);
    assert.equal(isChannelKind("menu.qr"), false);
    assert.equal(isChannelKind("portal"), false);

    assert.throws(
      () =>
        createChannel({
          channelKind: "channel.unknown" as never,
        }),
      /Unknown channel kind/,
    );

    assert.throws(
      () =>
        createChannel({
          channelKind: "menu.web" as never,
        }),
      /Unknown channel kind/,
    );
  });

  it("accepts only known channel statuses", () => {
    assert.equal(isChannelStatus("draft"), true);
    assert.equal(isChannelStatus("active"), true);
    assert.equal(isChannelStatus("inactive"), true);
    assert.equal(isChannelStatus("archived"), true);
    assert.equal(isChannelStatus("cancelled"), true);
    assert.equal(isChannelStatus("unknown"), false);
    assert.equal(isChannelStatus("published"), false);

    const active = createChannel({
      channelKind: CHANNEL_KINDS.PublicWeb,
      channelStatus: CHANNEL_STATUSES.Active,
    });
    assert.equal(active.channelStatus, "active");

    const inactive = createChannel({
      channelKind: CHANNEL_KINDS.Internal,
      channelStatus: CHANNEL_STATUSES.Inactive,
    });
    assert.equal(inactive.channelStatus, "inactive");
  });

  it("stays apart from catalog forks / commerce actions / page render / code emit / sign-in logic", () => {
    const channelSources = readdirSync(channelsRoot)
      .filter((name) => name.endsWith(".ts"))
      .map((name) => readFileSync(join(channelsRoot, name), "utf8"))
      .join("\n")
      .toLowerCase();

    assert.equal(channelSources.includes("menu duplication"), false);
    assert.equal(channelSources.includes("order logic"), false);
    assert.equal(channelSources.includes("payment logic"), false);
    assert.equal(channelSources.includes("frontend"), false);
    assert.equal(channelSources.includes("qr generation"), false);
    assert.equal(channelSources.includes("authentication"), false);

    assert.equal(channelSources.includes("generateqr"), false);
    assert.equal(channelSources.includes("renderpage"), false);
    assert.equal(channelSources.includes("createorder"), false);
    assert.equal(channelSources.includes("processpayment"), false);
    assert.equal(channelSources.includes("createmenu"), false);

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
      Object.keys(pkg.dependencies ?? {}).includes("@motanos/menu-web"),
      false,
    );
    assert.equal(
      Object.keys(pkg.dependencies ?? {}).includes("@motanos/menu-qr"),
      false,
    );

    const channel = createChannel({
      channelKind: CHANNEL_KINDS.Staff,
      channelStatus: CHANNEL_STATUSES.Archived,
      hospitalityReference: hospitalityBusiness,
      parentChannelReference: "channel-parent-1",
    });
    assert.equal(isHospitalityChannel(channel), true);
    assert.equal(channel.channelStatus, "archived");
    assert.equal(channel.parentChannelReference, "channel-parent-1");
  });
});
