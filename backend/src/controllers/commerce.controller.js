import { randomBytes, createHash } from "node:crypto";
import mongoose from "mongoose";
import {
  Wishlist,
  Review,
  Support,
  Subscriber,
  Coupon,
  StoreSettings,
  Outbox,
  AdminAudit,
} from "../models/commerce.model.js";
import ProductModel from "../models/product.model.js";
import UserModel from "../models/user.model.js";
import OrderModel from "../models/order.model.js";
import {
  asyncRoute,
  fail,
  text,
  email,
  objectId,
  integer,
  money,
  pageOf,
  escapeRegex,
} from "../utils/validation.js";
import { settings, shippingFor } from "../services/checkout.js";
import { tokenHash } from "../utils/password.js";
import { queueMail, sendMail } from "../utils/mail.js";

export const wishlist = asyncRoute(async (req, res) => {
  const entries = await Wishlist.find({ user: req.user._id })
    .sort({ createdAt: -1 })
    .populate({
      path: "product",
      match: { status: true, archived: { $ne: true } },
      populate: { path: "category" },
    });
  res.json({
    success: true,
    data: entries.filter((item) => item.product).map((item) => item.product),
  });
});
export const saveWishlist = asyncRoute(async (req, res) => {
  const product = objectId(req.params.id);
  if (
    !(await ProductModel.exists({
      _id: product,
      status: true,
      archived: { $ne: true },
    }))
  )
    fail(404, "Product not found");
  if (
    (await Wishlist.countDocuments({ user: req.user._id })) >= 200 &&
    !(await Wishlist.exists({ user: req.user._id, product }))
  )
    fail(400, "Wishlist limit reached");
  await Wishlist.updateOne(
    { user: req.user._id, product },
    { $setOnInsert: { user: req.user._id, product } },
    { upsert: true },
  );
  res.json({ success: true, message: "Saved to wishlist" });
});
export const removeWishlist = asyncRoute(async (req, res) => {
  await Wishlist.deleteOne({
    user: req.user._id,
    product: objectId(req.params.id),
  });
  res.json({ success: true, message: "Removed from wishlist" });
});
export const reviews = asyncRoute(async (req, res) => {
  const { page, limit, skip } = pageOf(req.query);
  const filter = req.adminReviews ? {} : { status: "approved" };
  if (req.params.id)
    filter.product = new mongoose.Types.ObjectId(objectId(req.params.id));
  if (req.adminReviews && req.query.status)
    filter.status = text(req.query.status, "status", 20);
  const [data, total, aggregate] = await Promise.all([
    Review.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate("user", "name")
      .populate("product", "title thumbnail"),
    Review.countDocuments(filter),
    Review.aggregate([
      { $match: filter },
      { $group: { _id: null, rating: { $avg: "$rating" } } },
    ]),
  ]);
  res.json({
    success: true,
    data,
    total,
    page,
    pages: Math.ceil(total / limit),
    rating: aggregate[0]?.rating || 0,
  });
});
export const createReview = asyncRoute(async (req, res) => {
  const product = objectId(req.params.id);
  const rating = integer(req.body.rating, "rating", 1, 5);
  const comment = text(req.body.comment, "review", 2000);
  const order = await OrderModel.findOne({
    user: req.user._id,
    "items.product_id": product,
    orderStatus: "delivered",
  });
  if (!order)
    fail(
      403,
      "Only customers with a delivered purchase can review this product",
    );
  await Review.findOneAndUpdate(
    { user: req.user._id, product },
    { $set: { rating, comment, order: order._id, status: "pending" } },
    { upsert: true, runValidators: true },
  );
  res.json({ success: true, message: "Review submitted for moderation" });
});
export const moderateReview = asyncRoute(async (req, res) => {
  if (!["approved", "rejected"].includes(req.body.status))
    fail(400, "Invalid review status");
  if (
    !(await Review.findByIdAndUpdate(objectId(req.params.id), {
      status: req.body.status,
    }))
  )
    fail(404, "Review not found");
  res.json({ success: true, message: "Review updated" });
});
export const contact = asyncRoute(async (req, res) => {
  const data = {
    name: text(req.body.name, "name", 100),
    email: email(req.body.email),
    subject: text(req.body.subject, "subject", 150),
    message: text(req.body.message, "message", 5000),
  };
  const ticket = await Support.create(data);
  const config = await settings();
  if (config.supportEmail)
    await queueMail(
      `support:${ticket._id}`,
      config.supportEmail,
      `Nestro support: ${data.subject}`,
      `${data.name} <${data.email}>\n${data.message}`,
    );
  res.status(201).json({
    success: true,
    message: "Your message has been received",
    ticketId: ticket._id,
  });
});
export const supportList = asyncRoute(async (req, res) => {
  const { page, limit, skip } = pageOf(req.query);
  const filter = req.query.status
    ? { status: text(req.query.status, "status", 30) }
    : {};
  const [data, total] = await Promise.all([
    Support.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit),
    Support.countDocuments(filter),
  ]);
  res.json({
    success: true,
    data,
    page,
    pages: Math.ceil(total / limit),
    total,
  });
});
export const supportReply = asyncRoute(async (req, res) => {
  const reply = text(req.body.reply, "reply", 5000);
  const ticket = await Support.findById(objectId(req.params.id));
  if (!ticket) fail(404, "Support request not found");
  await mongoose.connection.transaction(async (session) => {
    const key = createHash("sha256")
      .update(`${ticket._id}:${reply}`)
      .digest("hex");
    await queueMail(
      `support-reply:${key}`,
      ticket.email,
      `Re: ${ticket.subject}`,
      reply,
      session,
    );
    await Support.updateOne(
      { _id: ticket._id },
      { $set: { reply, status: "resolved" } },
      { session },
    );
  });
  res.json({ success: true, message: "Reply queued and request resolved" });
});
export const subscribe = asyncRoute(async (req, res) => {
  const address = email(req.body.email);
  const token = randomBytes(32).toString("hex");
  const existing = await Subscriber.findOne({ email: address });
  if (existing?.confirmed && !existing.unsubscribedAt)
    return res.json({
      success: true,
      message: "Please check your email if confirmation is required",
    });
  await Subscriber.findOneAndUpdate(
    { email: address },
    {
      $set: {
        tokenHash: tokenHash(token),
        expiresAt: new Date(Date.now() + 86400000),
        confirmed: false,
      },
      $unset: { unsubscribedAt: 1 },
    },
    { upsert: true },
  );
  await sendMail(
    address,
    "Confirm your Nestro subscription",
    `Confirm your subscription: ${process.env.FRONTEND_URL || "http://localhost:3000"}/newsletter?token=${token}\nIgnore this email if you did not request it.`,
  );
  res.json({
    success: true,
    message: "Check your email to confirm your subscription",
  });
});
export const confirmSubscription = asyncRoute(async (req, res) => {
  const hash = tokenHash(text(req.body.token, "token", 128));
  const subscriber = await Subscriber.findOneAndUpdate(
    { tokenHash: hash, expiresAt: { $gt: new Date() }, confirmed: false },
    { $set: { confirmed: true }, $unset: { expiresAt: 1 } },
  );
  if (!subscriber) fail(400, "Invalid or expired confirmation link");
  res.json({
    success: true,
    message:
      "Subscription confirmed. This link can also be used to unsubscribe.",
  });
});
export const unsubscribe = asyncRoute(async (req, res) => {
  const subscriber = await Subscriber.findOneAndUpdate(
    { tokenHash: tokenHash(text(req.body.token, "token", 128)) },
    {
      $set: { confirmed: false, unsubscribedAt: new Date() },
      $unset: { tokenHash: 1 },
    },
  );
  if (!subscriber) fail(400, "Invalid unsubscribe link");
  res.json({ success: true, message: "You have been unsubscribed" });
});
export const publicSettings = asyncRoute(async (req, res) => {
  const data = (await settings()).toObject();
  if (!data.policiesPublished) data.policies = {};
  res.json({ success: true, data });
});
export const adminSettings = asyncRoute(async (req, res) =>
  res.json({ success: true, data: await settings() }),
);
export const delivery = asyncRoute(async (req, res) => {
  const config = await settings();
  const pincode = text(req.query.pincode, "pincode", 6);
  const charge = shippingFor(config, pincode, money(req.query.subtotal || 0));
  res.json({
    success: true,
    data: {
      serviceable: true,
      shippingCharge: charge,
      daysMin: config.deliveryDaysMin,
      daysMax: config.deliveryDaysMax,
      codEnabled: config.codEnabled,
      codMaxOrderValue: config.codMaxOrderValue,
    },
  });
});
export const updateSettings = asyncRoute(async (req, res) => {
  const data = {};
  for (const field of [
    "businessName",
    "businessAddress",
    "supportPhone",
    "gstin",
  ])
    data[field] = text(req.body[field] || "", field, 1000, false);
  data.supportEmail = req.body.supportEmail ? email(req.body.supportEmail) : "";
  for (const field of [
    "shippingCharge",
    "freeShippingAbove",
    "codMaxOrderValue",
    "taxRate",
  ])
    data[field] = money(req.body[field] ?? 0, field);
  if (data.taxRate > 40) fail(400, "Invalid tax rate");
  data.deliveryDaysMin = integer(
    req.body.deliveryDaysMin,
    "minimum delivery days",
    1,
    180,
  );
  data.deliveryDaysMax = integer(
    req.body.deliveryDaysMax,
    "maximum delivery days",
    data.deliveryDaysMin,
    365,
  );
  data.returnDays = integer(req.body.returnDays, "return window", 0, 365);
  for (const field of ["acceptOrders", "codEnabled", "policiesPublished"]) {
    if (typeof req.body[field] !== "boolean") fail(400, `Invalid ${field}`);
    data[field] = req.body[field];
  }
  if (
    !Array.isArray(req.body.pincodes) ||
    req.body.pincodes.length > 50000 ||
    req.body.pincodes.some(
      (pin) => typeof pin !== "string" || !/^[1-9]\d{5}$/.test(pin),
    )
  )
    fail(400, "Enter valid serviceable pincodes");
  data.pincodes = [...new Set(req.body.pincodes)];
  data.policies = {};
  for (const field of ["privacy", "terms", "shipping", "returns"])
    data.policies[field] = text(
      req.body.policies?.[field] || "",
      `${field} policy`,
      20000,
      false,
    );
  if (
    data.acceptOrders &&
    (!data.businessName ||
      !data.businessAddress ||
      !data.supportEmail ||
      !data.policiesPublished ||
      Object.values(data.policies).some((value) => value.length < 30))
  )
    fail(
      400,
      "Complete business details and publish all four reviewed policies before enabling checkout",
    );
  const result = await StoreSettings.findByIdAndUpdate(
    "store",
    { $set: data },
    { upsert: true, new: true, runValidators: true },
  );
  res.json({ success: true, data: result, message: "Store settings saved" });
});
export const coupons = asyncRoute(async (req, res) => {
  res.json({
    success: true,
    data: await Coupon.find().sort({ createdAt: -1 }).limit(200),
  });
});
export const saveCoupon = asyncRoute(async (req, res) => {
  const code = text(req.body.code, "coupon code", 40).toUpperCase();
  if (!/^[A-Z0-9_-]+$/.test(code)) fail(400, "Invalid coupon code");
  if (!["percent", "fixed"].includes(req.body.type))
    fail(400, "Invalid coupon type");
  const value = money(req.body.value, "coupon value", 0.01);
  if (req.body.type === "percent" && value > 100)
    fail(400, "Percentage cannot exceed 100");
  const expiresAt = new Date(req.body.expiresAt);
  if (!Number.isFinite(expiresAt.getTime())) fail(400, "Invalid expiry date");
  const data = {
    code,
    type: req.body.type,
    value,
    minimum: money(req.body.minimum || 0),
    maximumDiscount: money(req.body.maximumDiscount || 0),
    usageLimit: integer(req.body.usageLimit, "usage limit", 1, 1000000),
    perUserLimit: integer(req.body.perUserLimit, "per-user limit", 1, 10000),
    expiresAt,
    active: req.body.active === true,
  };
  const coupon = await Coupon.findOneAndUpdate(
    { code },
    { $set: data },
    { upsert: true, new: true, runValidators: true },
  );
  res.json({ success: true, data: coupon, message: "Coupon saved" });
});
export const dashboard = asyncRoute(async (req, res) => {
  const [
    revenue,
    orders,
    users,
    products,
    lowStock,
    recentOrders,
    pendingReviews,
    openSupport,
    emailFailures,
    missingSku,
    outOfStock,
    config,
  ] = await Promise.all([
    OrderModel.aggregate([
      {
        $match: {
          paymentStatus: "paid",
          orderStatus: { $nin: ["cancelled", "returned"] },
        },
      },
      { $group: { _id: null, total: { $sum: "$totalAmount" } } },
    ]),
    OrderModel.countDocuments(),
    UserModel.countDocuments({ role: "user" }),
    ProductModel.countDocuments({ archived: { $ne: true } }),
    ProductModel.find({ archived: { $ne: true }, stockQuantity: { $lte: 5 } })
      .select("title stockQuantity")
      .sort({ stockQuantity: 1 })
      .limit(20),
    OrderModel.find().sort({ createdAt: -1 }).limit(10),
    Review.countDocuments({ status: "pending" }),
    Support.countDocuments({ status: "open" }),
    Outbox.countDocuments({ sentAt: null, attempts: { $gte: 8 } }),
    ProductModel.countDocuments({
      archived: { $ne: true },
      $or: [{ sku: "" }, { sku: { $exists: false } }],
    }),
    ProductModel.countDocuments({
      archived: { $ne: true },
      $or: [{ stock: false }, { stockQuantity: { $lte: 0 } }],
    }),
    settings(),
  ]);
  const policyValues = [
    config.policies?.privacy,
    config.policies?.terms,
    config.policies?.shipping,
    config.policies?.returns,
  ];
  const storeReady = Boolean(
    config.businessName &&
    config.businessAddress &&
    config.supportEmail &&
    config.policiesPublished &&
    policyValues.every((value) => String(value || "").length >= 30),
  );
  res.json({
    success: true,
    data: {
      revenue: revenue[0]?.total || 0,
      orders,
      users,
      products,
      lowStock,
      recentOrders,
      pendingReviews,
      openSupport,
      emailFailures,
      missingSku,
      outOfStock,
      storeReady,
      acceptingOrders: config.acceptOrders,
      codEnabled: config.codEnabled,
    },
  });
});
export const users = asyncRoute(async (req, res) => {
  const { page, limit, skip } = pageOf(req.query);
  const filter = req.query.search
    ? {
        email: {
          $regex: escapeRegex(text(req.query.search, "search", 100)),
          $options: "i",
        },
      }
    : {};
  const [data, total] = await Promise.all([
    UserModel.find(filter)
      .select("name email mobile role status createdAt")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit),
    UserModel.countDocuments(filter),
  ]);
  res.json({
    success: true,
    data,
    total,
    page,
    pages: Math.ceil(total / limit),
  });
});
export const updateUser = asyncRoute(async (req, res) => {
  const id = objectId(req.params.id);
  if (id === String(req.user._id))
    fail(400, "You cannot change your own access here");
  const user = await UserModel.findById(id);
  if (!user || user.role === "superAdmin")
    fail(403, "This account cannot be changed here");
  if (user.role === "admin" && req.user.role !== "superAdmin")
    fail(403, "Only a super admin can manage administrators");
  const update = {};
  if (typeof req.body.status === "boolean") update.status = req.body.status;
  if (req.body.role !== undefined) {
    if (
      req.user.role !== "superAdmin" ||
      !["user", "admin"].includes(req.body.role)
    )
      fail(403, "Only a super admin can change roles");
    update.role = req.body.role;
  }
  if (!Object.keys(update).length) fail(400, "Choose an account change");
  const before = { role: user.role, status: user.status };
  const after = {
    role: update.role ?? user.role,
    status: update.status ?? user.status,
  };
  await UserModel.db.transaction(async (session) => {
    await UserModel.updateOne(
      { _id: id },
      { $set: update, $inc: { tokenVersion: 1 } },
      { session },
    );
    await AdminAudit.create(
      [
        {
          actor: req.user._id,
          target: `user:${id}`,
          action: "user.access.update",
          before,
          after,
          reason: text(req.body.reason || "", "reason", 250, false),
          requestId: text(
            req.get("x-request-id") || "",
            "request ID",
            100,
            false,
          ),
        },
      ],
      { session },
    );
  });
  res.json({ success: true, message: "Account updated" });
});
