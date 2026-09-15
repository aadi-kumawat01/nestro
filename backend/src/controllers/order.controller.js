import mongoose from "mongoose";
import { createHash, createHmac } from "node:crypto";
import OrderModel from "../models/order.model.js";
import ProductModel from "../models/product.model.js";
import { Coupon } from "../models/commerce.model.js";
import {
  asyncRoute,
  fail,
  addressOf,
  objectId,
  text,
  pageOf,
} from "../utils/validation.js";
import { safeEqual } from "../utils/password.js";
import { buildQuote } from "../services/checkout.js";
import {
  gateway,
  recoverGatewayOrder,
  acceptPayment,
  commitInventory,
  consumeCart,
  notifyOrder,
  cancelOrder,
  updateOrderStatus,
  requestRefund,
  reconcileRefund,
} from "../services/orders.js";

const orderResponse = (order) => ({
  success: true,
  orderId: order._id,
  razorpayOrderId: order.razorpay_order_id,
  amount: order.amountPaise,
  currency: order.currency,
  paymentStatus: order.paymentStatus,
  orderStatus: order.orderStatus,
  cartConsumed: order.cartConsumed,
  key: process.env.RAZORPAY_KEY_ID,
});
export const quote = asyncRoute(async (req, res) => {
  const result = await buildQuote(
    req.user._id,
    text(req.body.pincode, "pincode", 6),
    req.body.couponCode,
  );
  const { config, ...data } = result;
  res.json({
    success: true,
    data: {
      ...data,
      codEnabled: config.codEnabled,
      codMaxOrderValue: config.codMaxOrderValue,
      codAvailable:
        config.codEnabled && data.totalAmount <= config.codMaxOrderValue,
    },
  });
});
export const orderPlace = asyncRoute(async (req, res) => {
  const userId = req.user._id;
  const shippingAddress = addressOf(req.body.shippingAddress);
  const paymentMethod = req.body.paymentMethod;
  if (!["cod", "online"].includes(paymentMethod))
    fail(400, "Choose a valid payment method");
  const key = text(
    req.get("Idempotency-Key") || req.body.idempotencyKey,
    "checkout request ID",
    80,
  );
  const fingerprint = createHash("sha256")
    .update(
      JSON.stringify({
        shippingAddress,
        paymentMethod,
        coupon: req.body.couponCode || "",
        revision: req.body.cartRevision,
        amount: req.body.amountPaise,
        billing: req.body.billing || {},
      }),
    )
    .digest("hex");
  const existing = await OrderModel.findOne({
    user: userId,
    idempotencyKey: key,
  });
  if (existing) {
    if (existing.checkoutFingerprint !== fingerprint)
      fail(
        409,
        "This checkout request was already used. Refresh your order summary.",
      );
    return res.json(orderResponse(existing));
  }
  if (paymentMethod === "online") gateway();
  let order;
  try {
    await mongoose.connection.transaction(async (session) => {
      const result = await buildQuote(
        userId,
        shippingAddress.pincode,
        req.body.couponCode,
        session,
      );
      if (
        result.cartRevision !== req.body.cartRevision ||
        result.amountPaise !== req.body.amountPaise
      )
        fail(
          409,
          "Cart or prices changed. Refresh your order summary before placing the order.",
        );
      if (
        paymentMethod === "cod" &&
        (!result.config.codEnabled ||
          result.totalAmount > result.config.codMaxOrderValue)
      )
        fail(
          400,
          `Cash on delivery is available only for orders up to ₹${Number(result.config.codMaxOrderValue).toLocaleString("en-IN")}`,
        );
      for (const item of result.items) {
        const updated = await ProductModel.updateOne(
          {
            _id: item.product_id,
            stock: true,
            status: true,
            archived: { $ne: true },
            stockQuantity: { $gte: item.quantity },
          },
          { $inc: { stockQuantity: -item.quantity, __v: 1 } },
          { session },
        );
        if (!updated.modifiedCount)
          fail(409, `${item.title} just went out of stock`);
      }
      if (result.couponCode) {
        const used = await Coupon.updateOne(
          {
            code: result.couponCode,
            active: true,
            $expr: { $lt: ["$used", "$usageLimit"] },
          },
          { $inc: { used: 1 } },
          { session },
        );
        if (!used.modifiedCount) fail(409, "Coupon usage limit reached");
      }
      const { config, ...totals } = result;
      const billing = {
        businessName: text(
          req.body.billing?.businessName || "",
          "billing business name",
          150,
          false,
        ),
        gstin: text(
          req.body.billing?.gstin || "",
          "billing GSTIN",
          15,
          false,
        ).toUpperCase(),
      };
      [order] = await OrderModel.create(
        [
          {
            ...totals,
            user: userId,
            customerEmail: req.user.email,
            shippingAddress,
            billing,
            seller: {
              businessName: config.businessName,
              businessAddress: config.businessAddress,
              gstin: config.gstin,
              supportEmail: config.supportEmail,
            },
            returnDays: config.returnDays,
            paymentMethod,
            inventoryState: "reserved",
            idempotencyKey: key,
            checkoutFingerprint: fingerprint,
            couponReserved: Boolean(result.couponCode),
            expiresAt: new Date(Date.now() + 30 * 60000),
            history: [
              { status: "placed", note: "Order created", actor: userId },
            ],
          },
        ],
        { session },
      );
      if (paymentMethod === "cod") {
        await commitInventory(order, session);
        await consumeCart(order, session);
        order.orderStatus = "confirmed";
        order.history.push({ status: "confirmed", note: "Cash on delivery" });
        await order.save({ session });
        await notifyOrder(order, "confirmed", session);
      }
    });
  } catch (error) {
    if (error.code === 11000) {
      const retry = await OrderModel.findOne({
        user: userId,
        idempotencyKey: key,
      });
      if (retry && retry.checkoutFingerprint === fingerprint)
        return res.json(orderResponse(retry));
      fail(
        409,
        "A checkout is already pending for this cart. Open My Orders to resume it.",
      );
    }
    throw error;
  }
  if (paymentMethod === "online") {
    try {
      const remote = await gateway().orders.create({
        amount: order.amountPaise,
        currency: "INR",
        receipt: String(order._id),
        notes: { merchantOrderId: String(order._id) },
      });
      order.razorpay_order_id = remote.id;
      await order.save();
    } catch {
      return res.status(202).json({
        ...orderResponse(order),
        message:
          "Payment initialization could not be confirmed. Check My Orders before retrying; the reservation will expire automatically.",
      });
    }
  }
  res.status(201).json(orderResponse(order));
});
export const verifyPayment = asyncRoute(async (req, res) => {
  const order = await OrderModel.findOne({
    _id: objectId(req.body.orderId),
    user: req.user._id,
  });
  if (!order) fail(404, "Order not found");
  const paymentId = text(req.body.razorpay_payment_id, "payment ID", 80);
  if (order.razorpay_order_id !== req.body.razorpay_order_id)
    fail(400, "Invalid payment order ID");
  const paymentGateway = gateway();
  const expected = createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
    .update(`${order.razorpay_order_id}|${paymentId}`)
    .digest("hex");
  if (!safeEqual(expected, req.body.razorpay_signature))
    fail(400, "Payment signature verification failed");
  const payment = await paymentGateway.payments.fetch(paymentId);
  if (payment.order_id !== order.razorpay_order_id)
    fail(400, "Payment does not belong to this order");
  const result = await acceptPayment(payment);
  res.status(result.paymentStatus === "paid" ? 200 : 202).json({
    ...orderResponse(result),
    message:
      result.orderStatus === "needs_review"
        ? "Payment received after the reservation ended. Your order needs review; please contact support."
        : result.paymentStatus === "paid"
          ? "Payment confirmed"
          : "Payment is awaiting capture. Your order will update automatically.",
  });
});
export const read = asyncRoute(async (req, res) => {
  const { page, limit, skip } = pageOf(req.query);
  const filter = req.isAdminList ? {} : { user: req.user._id };
  if (req.query.status)
    filter.orderStatus = text(req.query.status, "status", 40);
  const [data, total] = await Promise.all([
    OrderModel.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit),
    OrderModel.countDocuments(filter),
  ]);
  res.json({
    success: true,
    data,
    total,
    page,
    pages: Math.ceil(total / limit),
  });
});
export const detail = asyncRoute(async (req, res) => {
  const filter = {
    _id: objectId(req.params.id),
    ...(["admin", "superAdmin"].includes(req.user.role)
      ? {}
      : { user: req.user._id }),
  };
  let order = await OrderModel.findOne(filter);
  if (!order) fail(404, "Order not found");
  if (
    req.query.reconcile === "true" &&
    order.paymentMethod === "online" &&
    order.paymentStatus === "pending"
  ) {
    await recoverGatewayOrder(order);
    const remote = order.razorpay_order_id
      ? await gateway().orders.fetchPayments(order.razorpay_order_id)
      : { items: [] };
    const captured = remote.items?.find((item) => item.status === "captured");
    if (captured) order = await acceptPayment(captured);
  }
  res.json({ success: true, data: order });
});
export const cancel = asyncRoute(async (req, res) =>
  res.json({
    success: true,
    data: await cancelOrder(
      objectId(req.params.id),
      req.user._id,
      text(req.body.reason, "cancellation reason", 500),
      ["admin", "superAdmin"].includes(req.user.role),
    ),
  }),
);
export const normalizeReturnReason = (value) => {
  const reason = text(value, "return reason", 1000)
    .trim()
    .toLowerCase()
    .replace(/[\s_-]+/g, " ");
  if (!["wrong product received", "received wrong product"].includes(reason))
    fail(400, "Only a wrong product received is eligible for return");
  return "wrong_product_received";
};
export const returnOrder = asyncRoute(async (req, res) => {
  const reason = normalizeReturnReason(req.body.reason);
  const order = await OrderModel.findOne({
    _id: objectId(req.params.id),
    user: req.user._id,
  });
  if (!order) fail(404, "Order not found");
  if (
    order.orderStatus !== "delivered" ||
    !order.deliveredAt ||
    Date.now() - order.deliveredAt > order.returnDays * 86400000
  )
    fail(409, "This order is not eligible for an online return request");
  const updated = await OrderModel.findOneAndUpdate(
    { _id: order._id, orderStatus: "delivered" },
    {
      $set: { orderStatus: "return_requested", returnReason: reason },
      $push: {
        history: {
          status: "return_requested",
          note: reason,
          actor: req.user._id,
          at: new Date(),
        },
      },
    },
    { new: true },
  );
  if (!updated) fail(409, "Order status changed. Please refresh.");
  await notifyOrder(updated, "return_requested");
  res.json({ success: true, data: updated });
});
export const updateStatus = asyncRoute(async (req, res) => {
  const status = text(req.body.status, "status", 40);
  const tracking = {
    carrier: text(req.body.tracking?.carrier || "", "courier", 100, false),
    number: text(
      req.body.tracking?.number || "",
      "tracking number",
      100,
      false,
    ),
    url: text(req.body.tracking?.url || "", "tracking URL", 500, false),
  };
  if (tracking.url) {
    let url;
    try {
      url = new URL(tracking.url);
    } catch {
      fail(400, "Invalid tracking URL");
    }
    if (url.protocol !== "https:") fail(400, "Tracking URL must use HTTPS");
  }
  res.json({
    success: true,
    data: await updateOrderStatus(
      objectId(req.params.id),
      status,
      req.user._id,
      tracking,
      text(req.body.note || "", "note", 500, false),
    ),
  });
});
export const refund = asyncRoute(async (req, res) =>
  res.json({
    success: true,
    data: await requestRefund(objectId(req.params.id)),
  }),
);
export const refundStatus = asyncRoute(async (req, res) => {
  const order = await OrderModel.findById(objectId(req.params.id));
  if (!order) fail(404, "Order not found");
  res.json({ success: true, data: await reconcileRefund(order) });
});
export const manualRefund = asyncRoute(async (req, res) => {
  const reference = text(req.body.reference, "refund reference", 100);
  const order = await OrderModel.findOneAndUpdate(
    {
      _id: objectId(req.params.id),
      paymentMethod: "cod",
      orderStatus: "returned",
      paymentStatus: "paid",
      "refund.status": "manual_required",
    },
    {
      $set: {
        paymentStatus: "refunded",
        "refund.status": "processed",
        "refund.reference": reference,
        "refund.processedAt": new Date(),
      },
      $push: {
        history: {
          status: "refunded",
          note: `Manual refund reference: ${reference}`,
          at: new Date(),
          actor: req.user._id,
        },
      },
    },
    { new: true },
  );
  if (!order) fail(409, "This order is not awaiting a manual refund");
  await notifyOrder(order, "refunded");
  res.json({ success: true, data: order });
});
export const webhook = asyncRoute(async (req, res) => {
  if (!process.env.RAZORPAY_WEBHOOK_SECRET)
    fail(503, "Webhook is not configured");
  const expected = createHmac("sha256", process.env.RAZORPAY_WEBHOOK_SECRET)
    .update(req.body)
    .digest("hex");
  if (!safeEqual(expected, req.get("x-razorpay-signature")))
    fail(400, "Invalid webhook signature");
  let event;
  try {
    event = JSON.parse(req.body.toString());
  } catch {
    fail(400, "Invalid webhook payload");
  }
  const payment = event.payload?.payment?.entity;
  if (["payment.captured", "order.paid"].includes(event.event) && payment)
    await acceptPayment(
      payment,
      req.get("x-razorpay-event-id") ||
        createHash("sha256").update(req.body).digest("hex"),
    );
  if (event.event?.startsWith("refund.")) {
    const remote = event.payload?.refund?.entity;
    if (remote?.payment_id) {
      const order = await OrderModel.findOne({
        razorpay_payment_id: remote.payment_id,
      });
      if (order) await reconcileRefund(order);
    }
  }
  res.json({ success: true });
});
