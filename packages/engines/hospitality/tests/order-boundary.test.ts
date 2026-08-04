/**
 * Hospitality Order Management contract tests.
 * Run: pnpm --filter @motanos/hospitality test
 */
import assert from "node:assert/strict";
import { readFileSync, readdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { beforeEach, describe, it } from "node:test";
import {
  ORDER_KINDS,
  ORDER_LINE_STATUSES,
  ORDER_STATUSES,
  createOrder,
  createOrderLine,
  isHospitalityOrder,
  isOrderKind,
  isOrderLine,
  isOrderLineStatus,
  isOrderStatus,
  resetOrderLineReferenceSequence,
  resetOrderReferenceSequence,
} from "../src/public.js";

const packageRoot = join(dirname(fileURLToPath(import.meta.url)), "..");
const ordersRoot = join(packageRoot, "src", "orders");
const hospitalityBusiness = "hospitality-a";
const otherHospitalityBusiness = "hospitality-b";

describe("Hospitality Order Boundary", () => {
  beforeEach(() => {
    resetOrderReferenceSequence();
    resetOrderLineReferenceSequence();
  });

  it("creates Order and OrderLine", () => {
    const order = createOrder({
      orderKind: ORDER_KINDS.Dining,
      hospitalityReference: hospitalityBusiness,
      contextReference: "context-1",
      tableReference: "table-1",
      customerReference: "customer-1",
      sessionReference: "session-1",
      metadata: { note: "opaque-meta" },
    });
    assert.equal(isHospitalityOrder(order), true);
    assert.equal(order.orderReference, "order-1");
    assert.equal(order.orderStatus, "draft");
    assert.equal(order.orderKind, "order.dining");
    assert.equal(order.hospitalityReference, hospitalityBusiness);
    assert.equal(order.tableReference, "table-1");

    const line = createOrderLine({
      orderReference: order.orderReference,
      itemReference: "menu-item-1",
      quantityReference: "qty-2",
      priceReference: "price-1",
      notesReference: "notes-1",
      lineStatus: ORDER_LINE_STATUSES.Active,
    });
    assert.equal(isOrderLine(line), true);
    assert.equal(line.lineReference, "order-line-1");
    assert.equal(line.lineStatus, "active");
    assert.equal(line.orderReference, order.orderReference);
    assert.equal(line.itemReference, "menu-item-1");
    assert.equal(line.priceReference, "price-1");
  });

  it("checks hospitality business isolation", () => {
    assert.throws(
      () =>
        createOrder({
          orderKind: ORDER_KINDS.Bar,
          hospitalityReference: "  ",
        }),
      /hospitalityReference must not be empty when provided/,
    );

    assert.throws(
      () =>
        createOrder(
          {
            orderKind: ORDER_KINDS.Takeaway,
            hospitalityReference: otherHospitalityBusiness,
          },
          { hospitalityReference: hospitalityBusiness },
        ),
      /does not apply to this hospitality business/,
    );

    assert.throws(
      () =>
        createOrder({
          orderKind: ORDER_KINDS.Delivery,
          tableReference: "  ",
        }),
      /tableReference must not be empty when provided/,
    );
  });

  it("accepts only known order kinds", () => {
    assert.equal(isOrderKind("order.dining"), true);
    assert.equal(isOrderKind("order.takeaway"), true);
    assert.equal(isOrderKind("order.delivery"), true);
    assert.equal(isOrderKind("order.bar"), true);
    assert.equal(isOrderKind("order.internal"), true);
    assert.equal(isOrderKind("order.special"), true);
    assert.equal(isOrderKind("payment"), false);
    assert.equal(isOrderKind("kitchen"), false);
    assert.equal(isOrderKind("inventory"), false);
    assert.equal(isOrderKind("staff"), false);

    assert.throws(
      () =>
        createOrder({
          orderKind: "order.unknown" as never,
        }),
      /Unknown order kind/,
    );

    assert.throws(
      () =>
        createOrder({
          orderKind: "payment" as never,
        }),
      /Unknown order kind/,
    );
  });

  it("accepts only known order and line statuses", () => {
    assert.equal(isOrderStatus("draft"), true);
    assert.equal(isOrderStatus("confirmed"), true);
    assert.equal(isOrderStatus("preparing"), true);
    assert.equal(isOrderStatus("ready"), true);
    assert.equal(isOrderStatus("served"), true);
    assert.equal(isOrderStatus("cancelled"), true);
    assert.equal(isOrderStatus("paid"), true);
    assert.equal(isOrderStatus("unknown"), false);

    assert.equal(isOrderLineStatus("draft"), true);
    assert.equal(isOrderLineStatus("active"), true);
    assert.equal(isOrderLineStatus("prepared"), true);
    assert.equal(isOrderLineStatus("served"), true);
    assert.equal(isOrderLineStatus("cancelled"), true);
    assert.equal(isOrderLineStatus("paid"), false);

    const confirmed = createOrder({
      orderKind: ORDER_KINDS.Dining,
      orderStatus: ORDER_STATUSES.Confirmed,
    });
    assert.equal(confirmed.orderStatus, "confirmed");

    const prepared = createOrderLine({
      lineStatus: ORDER_LINE_STATUSES.Prepared,
    });
    assert.equal(prepared.lineStatus, "prepared");
  });

  it("stays apart from kitchen / payment / inventory / pricing / TPV / staff logic", () => {
    const orderSources = readdirSync(ordersRoot)
      .filter((name) => name.endsWith(".ts"))
      .map((name) => readFileSync(join(ordersRoot, name), "utf8"))
      .join("\n");

    assert.equal(orderSources.includes("confirmOrder"), false);
    assert.equal(orderSources.includes("sendKitchen"), false);
    assert.equal(orderSources.includes("printOrder"), false);
    assert.equal(orderSources.includes("assignWaiter"), false);
    assert.equal(orderSources.includes("chargeOrder"), false);
    assert.equal(orderSources.includes("calculateCost"), false);
    assert.equal(orderSources.includes("syncTPV"), false);
    assert.equal(orderSources.includes("calculatePrice"), false);
    assert.equal(orderSources.includes("subtotal"), false);
    assert.equal(orderSources.includes("syncInventory"), false);

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
      Object.keys(pkg.dependencies ?? {}).includes("@motanos/pricing"),
      false,
    );
    assert.equal(
      Object.keys(pkg.dependencies ?? {}).includes("@motanos/payment"),
      false,
    );

    const order = createOrder({
      orderKind: ORDER_KINDS.Special,
      orderStatus: ORDER_STATUSES.Served,
      hospitalityReference: hospitalityBusiness,
      parentOrderReference: "order-parent-1",
    });
    assert.equal(isHospitalityOrder(order), true);
    assert.equal(order.orderStatus, "served");
    assert.equal(order.parentOrderReference, "order-parent-1");
  });
});
