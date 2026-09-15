import test from "node:test";
import assert from "node:assert/strict";
import mongoose from "mongoose";
import jwt from "jsonwebtoken";
import {
  integer,
  money,
  priceOf,
  addressOf,
  escapeRegex,
  objectId,
} from "../src/utils/validation.js";
import {
  hashPassword,
  verifyPassword,
  safeEqual,
  validatePassword,
} from "../src/utils/password.js";
import { normalizeCartItems } from "../src/controllers/cart.controller.js";
import { normalizeReturnReason } from "../src/controllers/order.controller.js";
import { shippingFor, buildQuote } from "../src/services/checkout.js";
import {
  acceptPayment,
  releaseInventory,
  consumeCart,
  updateOrderStatus,
  cancelOrder,
} from "../src/services/orders.js";
import Product from "../src/models/product.model.js";
import Cart from "../src/models/cart.model.js";
import Order from "../src/models/order.model.js";
import {
  StoreSettings,
  Coupon,
  Outbox,
  PaymentEvent,
} from "../src/models/commerce.model.js";
const id = "507f1f77bcf86cd799439011",
  other = "507f1f77bcf86cd799439012";
const query = (value) => ({ session: async () => value });
function mock(t, object, key, fn) {
  t.mock.method(object, key, fn);
}
function order(overrides = {}) {
  return {
    _id: id,
    user: other,
    customerEmail: "",
    items: [{ product_id: id, quantity: 2 }],
    amountPaise: 100000,
    totalAmount: 1000,
    currency: "INR",
    razorpay_order_id: "order_test",
    paymentMethod: "online",
    paymentStatus: "pending",
    orderStatus: "placed",
    inventoryState: "reserved",
    cartRevision: 4,
    refund: { status: "none" },
    history: [],
    save: async function () {
      return this;
    },
    ...overrides,
  };
}
function setup(t, o) {
  mock(t, mongoose.connection, "transaction", (fn) => fn({}));
  mock(t, Order, "exists", async () => true);
  mock(t, Order, "findOne", () => query(o));
  mock(t, Order, "findById", () => query(o));
  mock(t, Outbox, "updateOne", async () => ({ modifiedCount: 1 }));
  mock(t, PaymentEvent, "exists", () => query(false));
  mock(t, PaymentEvent, "create", async () => []);
}
test("quantities reject fractions, negative, zero, objects, NaN and large values", () => {
  for (const n of [-1, 0, 1.1, 100, NaN, {}, null])
    assert.throws(() => integer(n, "quantity"));
  assert.equal(integer("2", "quantity"), 2);
});
test("sale price falls back consistently and money rejects non-finite inputs", () => {
  for (const sale of [null, 0, 1200, undefined])
    assert.equal(priceOf({ price: 1000, salePrice: sale }), 1000);
  assert.equal(priceOf({ price: 1000, salePrice: 800 }), 800);
  assert.throws(() => money(Infinity));
  assert.throws(() => money({}));
  assert.equal(money(1.235), 1.24);
});
test("cart normalizer rejects duplicate, invalid IDs and coerced objects", () => {
  assert.throws(() =>
    normalizeCartItems([
      { productId: id, quantity: 1 },
      { productId: id.toUpperCase(), quantity: 1 },
    ]),
  );
  assert.throws(() => normalizeCartItems([{ productId: "bad", quantity: 1 }]));
  assert.throws(() => normalizeCartItems([{ productId: id, quantity: {} }]));
  assert.equal(
    normalizeCartItems([{ productId: id, quantity: 3 }])[0].quantity,
    3,
  );
});
test("returns only accept the approved wrong-product reason", () => {
  assert.equal(
    normalizeReturnReason("Wrong product received"),
    "wrong_product_received",
  );
  assert.equal(
    normalizeReturnReason("received_wrong-product"),
    "wrong_product_received",
  );
  assert.throws(
    () => normalizeReturnReason("changed my mind"),
    /wrong product/,
  );
});
test("address validates India pincode and mobile and discards extra fields", () => {
  const a = {
    fullName: "A Person",
    mobile: "+91 9876543210",
    pincode: "302001",
    addressLine: "12 Main Road",
    city: "Jaipur",
    state: "Rajasthan",
    admin: true,
  };
  assert.equal(addressOf(a).mobile, "9876543210");
  assert.equal(addressOf(a).admin, undefined);
  assert.throws(() => addressOf({ ...a, pincode: "000000" }));
  assert.throws(() => addressOf({ ...a, country: "USA" }));
});
test("search escaping treats special characters literally", () => {
  const s = "chair.*(x)[$]";
  assert.equal(new RegExp("^" + escapeRegex(s) + "$").test(s), true);
  assert.equal(objectId(id.toUpperCase()), id);
});
test("password hashes verify and wrong/malformed secrets fail", async () => {
  const hash = await hashPassword("a-valid-password");
  assert.equal(await verifyPassword("a-valid-password", hash), true);
  assert.equal(await verifyPassword("wrong", hash), false);
  assert.equal(await verifyPassword("test", "scrypt$bad$bad"), false);
  assert.equal(safeEqual("é", "a"), false);
  assert.throws(() => validatePassword("short"));
});
test("shipping enforces setup, serviceability and threshold", () => {
  const config = {
    acceptOrders: true,
    policiesPublished: true,
    pincodes: ["302001"],
    shippingCharge: 200,
    freeShippingAbove: 20000,
  };
  assert.equal(shippingFor(config, "302001", 1000), 200);
  assert.equal(shippingFor(config, "302001", 20000), 0);
  assert.throws(() => shippingFor(config, "110001", 1000));
  assert.throws(() =>
    shippingFor({ ...config, acceptOrders: false }, "302001", 1000),
  );
});
test("quote calculates price, percent cap, inclusive tax and shipping on server", async (t) => {
  mock(t, StoreSettings, "findById", () =>
    query({
      acceptOrders: true,
      policiesPublished: true,
      pincodes: [],
      shippingCharge: 50,
      freeShippingAbove: 20000,
      taxRate: 18,
      deliveryDaysMin: 5,
      deliveryDaysMax: 7,
    }),
  );
  mock(t, Cart, "findOne", () =>
    query({ revision: 3, items: [{ productId: id, quantity: 2 }] }),
  );
  mock(t, Product, "find", () =>
    query([
      {
        _id: id,
        title: "Chair",
        status: true,
        stock: true,
        stockQuantity: 3,
        price: 1000,
        salePrice: 800,
      },
    ]),
  );
  mock(t, Coupon, "findOne", () =>
    query({
      code: "SAVE",
      used: 0,
      usageLimit: 10,
      perUserLimit: 1,
      minimum: 0,
      type: "percent",
      value: 10,
      maximumDiscount: 100,
    }),
  );
  mock(t, Order, "countDocuments", () => query(0));
  const q = await buildQuote(other, "302001", "save");
  assert.equal(q.subtotal, 1600);
  assert.equal(q.couponDiscount, 100);
  assert.equal(q.totalAmount, 1550);
  assert.equal(q.amountPaise, 155000);
  assert.equal(q.taxAmount, 228.81);
  assert.equal(q.cartRevision, 3);
});
test("captured payment commits stock and cart only once across replay", async (t) => {
  const o = order();
  setup(t, o);
  let sold = 0,
    cleared = 0;
  const cart = {
    items: [{ productId: id, quantity: 2 }],
    revision: 4,
    save: async () => {
      cleared++;
    },
  };
  mock(t, Product, "updateOne", async () => {
    sold++;
    return { modifiedCount: 1 };
  });
  mock(t, Cart, "findOne", () => query(cart));
  const payment = {
    id: "pay_test",
    order_id: "order_test",
    amount: 100000,
    currency: "INR",
    status: "captured",
  };
  await acceptPayment(payment);
  assert.equal(o.orderStatus, "confirmed");
  o.orderStatus = "delivered";
  await acceptPayment(payment);
  assert.equal(o.orderStatus, "delivered");
  assert.equal(sold, 1);
  assert.equal(cleared, 1);
});
test("mismatched payment amounts cannot change order state", async (t) => {
  const o = order();
  setup(t, o);
  await assert.rejects(
    acceptPayment({
      amount: 1,
      currency: "INR",
      order_id: "order_test",
      status: "captured",
    }),
    /amount/,
  );
  assert.equal(o.paymentStatus, "pending");
});
test("late payment after cancellation requires refund without consuming stock or cart", async (t) => {
  const o = order({ inventoryState: "released", orderStatus: "cancelled" });
  setup(t, o);
  mock(t, Product, "updateOne", async () => assert.fail("inventory changed"));
  mock(t, Cart, "updateOne", async () => assert.fail("cart changed"));
  await acceptPayment({
    id: "pay_late",
    amount: 100000,
    currency: "INR",
    order_id: "order_test",
    status: "captured",
  });
  assert.equal(o.orderStatus, "needs_review");
  assert.equal(o.refund.status, "requested");
});
test("cart consumption increments revision after removing purchased quantities", async (t) => {
  const o = order();
  const cart = {
    items: [
      { productId: id, quantity: 2 },
      { productId: other, quantity: 1 },
    ],
    revision: 4,
    save: async () => undefined,
  };
  mock(t, Cart, "findOne", () => query(cart));
  await consumeCart(o, {});
  assert.equal(o.cartConsumed, true);
  assert.deepEqual(cart.items, [{ productId: other, quantity: 1 }]);
  assert.equal(cart.revision, 5);
});
test("inventory and coupon releases are idempotent", async (t) => {
  const o = order({
    inventoryState: "committed",
    couponReserved: true,
    couponCode: "SAVE",
  });
  let stocks = 0,
    coupons = 0;
  mock(t, Product, "updateOne", async (_, update) => {
    assert.equal(update.$inc.stockQuantity, 2);
    assert.equal(update.$inc.sold, -2);
    stocks++;
  });
  mock(t, Coupon, "updateOne", async () => {
    coupons++;
  });
  await releaseInventory(o, {});
  await releaseInventory(o, {});
  assert.equal(stocks, 1);
  assert.equal(coupons, 1);
});
test("unpaid online orders cannot ship and dispatched orders cannot cancel", async (t) => {
  const o = order({ orderStatus: "packed" });
  setup(t, o);
  await assert.rejects(
    updateOrderStatus(
      id,
      "shipped",
      other,
      { carrier: "Test", number: "123" },
      "",
    ),
    /unpaid/,
  );
  o.orderStatus = "shipped";
  await assert.rejects(cancelOrder(id, other, "changed mind"), /cancelled/);
});
test("return decisions require an admin explanation", async (t) => {
  const o = order({ orderStatus: "return_requested", paymentStatus: "paid" });
  setup(t, o);
  await assert.rejects(
    updateOrderStatus(id, "return_approved", other, {}, ""),
    /approval.*note/,
  );
  await updateOrderStatus(
    id,
    "return_approved",
    other,
    {},
    "Evidence verified",
  );
  assert.equal(o.orderStatus, "return_approved");
});
test("HTTP API rejects missing authentication, tampered tokens and foreign origins", async (t) => {
  process.env.JWT_SECRET = "test-only-secret-never-use-in-production";
  process.env.NODE_ENV = "test";
  const { app } = await import("../src/server.js");
  const server = app.listen(0, "127.0.0.1");
  await new Promise((resolve) => server.once("listening", resolve));
  t.after(() => new Promise((resolve) => server.close(resolve)));
  const base = "http://127.0.0.1:" + server.address().port;
  const health = await fetch(base + "/health", {
    headers: { "X-Request-ID": "health-test-01" },
  });
  assert.equal(health.status, 200);
  assert.equal(health.headers.get("x-request-id"), "health-test-01");
  assert.equal((await fetch(base + "/ready")).status, 503);
  assert.equal((await fetch(base + "/api/order")).status, 401);
  const token = jwt.sign({ id }, "wrong-secret");
  assert.equal(
    (
      await fetch(base + "/api/order", {
        headers: { Authorization: "Bearer " + token },
      })
    ).status,
    401,
  );
  assert.equal(
    (
      await fetch(base + "/api/order/place", {
        method: "POST",
        headers: {
          Cookie: "token=bad",
          Origin: "https://foreign.invalid",
          "Content-Type": "application/json",
        },
        body: "{}",
      })
    ).status,
    403,
  );
  assert.equal(
    (
      await fetch(base + "/api/order/webhook", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: "{}",
      })
    ).status,
    503,
  );
});
