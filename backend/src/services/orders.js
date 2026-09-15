import mongoose from "mongoose";
import Razorpay from "razorpay";
import OrderModel from "../models/order.model.js";
import ProductModel from "../models/product.model.js";
import CartModel from "../models/cart.model.js";
import { Coupon, PaymentEvent } from "../models/commerce.model.js";
import { queueMail } from "../utils/mail.js";
import { fail } from "../utils/validation.js";

export function gateway() {
  if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET)
    fail(503, "Online payments are not configured");
  return new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET,
  });
}
export async function notifyOrder(order, status, session) {
  if (!order.customerEmail) return;
  await queueMail(
    `${order._id}:${status}`,
    order.customerEmail,
    `Nestro order ${status.replaceAll("_", " ")}`,
    `Order ${order._id}\nStatus: ${status.replaceAll("_", " ")}\nTotal: INR ${order.totalAmount}\nView your order: ${(process.env.FRONTEND_URL || "http://localhost:3000").replace(/\/$/, "")}/orders/${order._id}`,
    session,
  );
}
export async function consumeCart(order, session) {
  if (order.cartConsumed) return;
  const cart = await CartModel.findOne({ userId: order.user }).session(session);
  if (!cart) {
    order.cartConsumed = true;
    return;
  }
  // Consume purchased quantities while retaining items added during payment.
  const purchased = new Map(
    order.items.map((item) => [String(item.product_id), item.quantity]),
  );
  cart.items = cart.items
    .map((item) => ({
      productId: item.productId,
      quantity: Math.max(
        0,
        item.quantity - (purchased.get(String(item.productId)) || 0),
      ),
    }))
    .filter((item) => item.quantity > 0);
  cart.revision += 1;
  await cart.save({ session });
  order.cartConsumed = true;
}
export async function commitInventory(order, session) {
  if (order.inventoryState !== "reserved") return;
  for (const item of order.items)
    await ProductModel.updateOne(
      { _id: item.product_id },
      { $inc: { sold: item.quantity, __v: 1 } },
      { session },
    );
  order.inventoryState = "committed";
}
export async function releaseInventory(order, session) {
  if (["reserved", "committed"].includes(order.inventoryState)) {
    for (const item of order.items)
      await ProductModel.updateOne(
        { _id: item.product_id },
        {
          $inc: {
            __v: 1,
            stockQuantity: item.quantity,
            ...(order.inventoryState === "committed"
              ? { sold: -item.quantity }
              : {}),
          },
        },
        { session },
      );
    order.inventoryState = "released";
  }
  if (order.couponReserved) {
    await Coupon.updateOne(
      { code: order.couponCode, used: { $gt: 0 } },
      { $inc: { used: -1 } },
      { session },
    );
    order.couponReserved = false;
  }
}
export async function acceptPayment(payment, eventId) {
  // Recover a lost local binding using provider data, never client-supplied notes.
  if (!(await OrderModel.exists({ razorpay_order_id: payment.order_id }))) {
    const remote = await gateway().orders.fetch(payment.order_id);
    const id = remote.notes?.merchantOrderId;
    if (mongoose.isValidObjectId(id)) {
      const candidate = await OrderModel.findById(id);
      if (
        candidate &&
        !candidate.razorpay_order_id &&
        candidate.paymentMethod === "online" &&
        remote.receipt === String(candidate._id) &&
        remote.amount === candidate.amountPaise &&
        remote.currency === candidate.currency
      ) {
        await OrderModel.updateOne(
          { _id: candidate._id, razorpay_order_id: null },
          { $set: { razorpay_order_id: remote.id } },
        );
      }
    }
  }
  let result;
  await mongoose.connection.transaction(async (session) => {
    if (
      eventId &&
      (await PaymentEvent.exists({ _id: eventId }).session(session))
    )
      return;
    const order = await OrderModel.findOne({
      razorpay_order_id: payment.order_id,
    }).session(session);
    if (!order) fail(404, "Payment order not found");
    const expected = order.amountPaise ?? Math.round(order.totalAmount * 100);
    if (
      payment.amount !== expected ||
      payment.currency !== (order.currency || "INR")
    )
      fail(400, "Payment amount or currency does not match the order");
    if (payment.status !== "captured") {
      result = order;
      return;
    }
    if (["paid", "refunded"].includes(order.paymentStatus)) {
      if (order.razorpay_payment_id && order.razorpay_payment_id !== payment.id)
        fail(409, "Order already has a different successful payment");
      result = order;
      return;
    }
    order.razorpay_payment_id = payment.id;
    order.paymentStatus = "paid";
    order.paidAt = new Date();
    if (
      order.inventoryState === "released" ||
      order.orderStatus === "cancelled"
    ) {
      // Late captures must not ship inventory that was already released.
      order.orderStatus = "needs_review";
      order.refund.status = "requested";
      order.history.push({
        status: "needs_review",
        note: "Payment captured after reservation ended. Review and refund; do not ship.",
      });
    } else {
      await commitInventory(order, session);
      await consumeCart(order, session);
      order.orderStatus = "confirmed";
      order.history.push({
        status: "confirmed",
        note: "Payment capture confirmed by gateway",
      });
    }
    await order.save({ session });
    await notifyOrder(order, order.orderStatus, session);
    if (eventId)
      await PaymentEvent.create(
        [{ _id: eventId, type: "payment.captured", processedAt: new Date() }],
        { session },
      );
    result = order;
  });
  return result;
}
export async function cancelOrder(orderId, userId, reason, admin = false) {
  let result;
  await mongoose.connection.transaction(async (session) => {
    const order = await OrderModel.findOne({
      _id: orderId,
      ...(admin ? {} : { user: userId }),
    }).session(session);
    if (!order) fail(404, "Order not found");
    if (order.orderStatus === "cancelled") {
      result = order;
      return;
    }
    const cancellable = admin ? ["placed", "confirmed", "packed"] : ["placed"];
    if (!cancellable.includes(order.orderStatus))
      fail(
        409,
        admin
          ? "This order can no longer be cancelled"
          : "This order cannot be cancelled; customer cancellation is only available before confirmation",
      );
    await releaseInventory(order, session);
    order.orderStatus = "cancelled";
    if (order.paymentStatus === "paid") order.refund.status = "requested";
    order.history.push({ status: "cancelled", note: reason, actor: userId });
    await order.save({ session });
    await notifyOrder(order, "cancelled", session);
    result = order;
  });
  return result;
}
const transitions = {
  confirmed: ["packed"],
  packed: ["shipped"],
  shipped: ["out_for_delivery"],
  out_for_delivery: ["delivered"],
  return_requested: ["return_approved", "delivered"],
  return_approved: ["returned"],
};
export async function updateOrderStatus(
  orderId,
  status,
  actor,
  tracking,
  note,
) {
  let result;
  await mongoose.connection.transaction(async (session) => {
    const order = await OrderModel.findById(orderId).session(session);
    if (!order) fail(404, "Order not found");
    if (order.orderStatus === status) {
      result = order;
      return;
    }
    if (!transitions[order.orderStatus]?.includes(status))
      fail(409, "Invalid order status transition");
    if (
      order.orderStatus === "return_requested" &&
      ["return_approved", "delivered"].includes(status) &&
      !note
    )
      fail(400, "Return approval or rejection note is required");
    if (order.paymentMethod === "online" && order.paymentStatus !== "paid")
      fail(409, "Do not fulfill an unpaid online order");
    if (status === "shipped") {
      if (!tracking?.carrier || !tracking?.number)
        fail(400, "Courier and tracking number are required");
      order.tracking = tracking;
    }
    if (status === "delivered" && order.orderStatus === "out_for_delivery") {
      order.deliveredAt = new Date();
      if (order.paymentMethod === "cod") {
        order.paymentStatus = "paid";
        order.paidAt = new Date();
      }
    }
    if (status === "returned") {
      await releaseInventory(order, session);
      order.refund.status =
        order.paymentMethod === "cod" ? "manual_required" : "requested";
    }
    order.orderStatus = status;
    order.history.push({ status, note, actor });
    await order.save({ session });
    await notifyOrder(order, status, session);
    result = order;
  });
  return result;
}
export async function reconcileRefund(order) {
  if (order.paymentMethod !== "online") return order;
  const api = gateway();
  let refund;
  if (order.refund?.id) refund = await api.refunds.fetch(order.refund.id);
  else {
    const response = await api.refunds.all({
      payment_id: order.razorpay_payment_id,
      count: 100,
    });
    refund = response.items?.find((item) => item.receipt === String(order._id));
  }
  if (refund) {
    if (
      refund.payment_id !== order.razorpay_payment_id ||
      refund.amount !==
        (order.amountPaise ?? Math.round(order.totalAmount * 100))
    )
      fail(409, "Refund details require manual review");
    await mongoose.connection.transaction(async (session) => {
      const fresh = await OrderModel.findById(order._id).session(session);
      if (fresh.refund.status === "processed") return;
      fresh.refund.id = refund.id;
      fresh.refund.status =
        refund.status === "processed"
          ? "processed"
          : refund.status === "failed"
            ? "failed"
            : "processing";
      if (fresh.refund.status === "processed") {
        fresh.paymentStatus = "refunded";
        fresh.refund.processedAt = new Date();
        fresh.history.push({
          status: "refunded",
          note: "Full refund confirmed by gateway",
        });
        await notifyOrder(fresh, "refunded", session);
      }
      await fresh.save({ session });
    });
  }
  return OrderModel.findById(order._id);
}
export async function requestRefund(orderId) {
  let order = await OrderModel.findById(orderId);
  if (
    !order ||
    !["cancelled", "returned", "needs_review"].includes(order.orderStatus)
  )
    fail(409, "Cancel or receive the returned order before issuing a refund");
  if (order.refund.status === "processed") return order;
  if (order.paymentStatus !== "paid" || order.paymentMethod !== "online")
    fail(409, "Online refund is unavailable for this order");
  if (order.refund.status === "processing") return reconcileRefund(order);
  if (order.refund.status === "failed")
    fail(
      409,
      "Refund failed at the gateway. Resolve it with the provider before attempting another refund.",
    );
  const api = gateway();
  order = await OrderModel.findOneAndUpdate(
    { _id: orderId, "refund.status": { $in: ["requested", "failed", "none"] } },
    {
      $set: {
        "refund.status": "processing",
        "refund.requestedAt": new Date(),
        "refund.amount": order.totalAmount,
        "refund.reference": String(order._id),
      },
    },
    { new: true },
  );
  if (!order) fail(409, "Refund is already being processed");
  // Keep processing on network ambiguity. Reconcile before any further attempt.
  const refund = await api.payments.refund(order.razorpay_payment_id, {
    amount: order.amountPaise ?? Math.round(order.totalAmount * 100),
    receipt: String(order._id),
    notes: { orderId: String(order._id) },
  });
  await OrderModel.updateOne(
    { _id: order._id },
    { $set: { "refund.id": refund.id } },
  );
  return reconcileRefund(await OrderModel.findById(order._id));
}
export async function expireReservations() {
  const orders = await OrderModel.find({
    inventoryState: "reserved",
    paymentStatus: "pending",
    expiresAt: { $lt: new Date() },
  }).limit(50);
  for (const order of orders) {
    try {
      await recoverGatewayOrder(order);
      if (order.razorpay_order_id) {
        const response = await gateway().orders.fetchPayments(
          order.razorpay_order_id,
        );
        const payment = response.items?.find(
          (item) => item.status === "captured",
        );
        if (payment) {
          await acceptPayment(payment);
          continue;
        }
      }
      await cancelOrder(order._id, order.user, "Payment reservation expired");
    } catch {
      /* Leave inventory reserved on gateway outage; try again later. */
    }
  }
}
export async function recoverGatewayOrder(order) {
  if (order.razorpay_order_id || order.paymentMethod !== "online") return order;
  const response = await gateway().orders.all({
    receipt: String(order._id),
    count: 10,
  });
  const remote =
    response.items?.filter(
      (item) =>
        item.receipt === String(order._id) &&
        item.notes?.merchantOrderId === String(order._id) &&
        item.amount === order.amountPaise &&
        item.currency === order.currency,
    ) || [];
  if (remote.length > 1)
    fail(
      409,
      "Multiple gateway orders found. Contact support for reconciliation.",
    );
  if (remote.length === 1) {
    await OrderModel.updateOne(
      { _id: order._id, razorpay_order_id: null },
      { $set: { razorpay_order_id: remote[0].id } },
    );
    order.razorpay_order_id = remote[0].id;
  }
  return order;
}
