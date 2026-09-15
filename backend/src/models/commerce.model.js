import mongoose from "mongoose";
const { Schema } = mongoose;
const ref = (name) => ({
  type: Schema.Types.ObjectId,
  ref: name,
  required: true,
});

const couponSchema = new Schema(
  {
    code: {
      type: String,
      uppercase: true,
      trim: true,
      unique: true,
      required: true,
    },
    type: { type: String, enum: ["percent", "fixed"], required: true },
    value: { type: Number, min: 0, required: true },
    minimum: { type: Number, min: 0, default: 0 },
    maximumDiscount: { type: Number, min: 0, default: 0 },
    usageLimit: { type: Number, min: 1, default: 100 },
    perUserLimit: { type: Number, min: 1, default: 1 },
    used: { type: Number, min: 0, default: 0 },
    expiresAt: { type: Date, required: true },
    active: { type: Boolean, default: true },
  },
  { timestamps: true },
);
export const Coupon = mongoose.model("Coupon", couponSchema);
const wishlistSchema = new Schema(
  { user: ref("User"), product: ref("Product") },
  { timestamps: true },
);
wishlistSchema.index({ user: 1, product: 1 }, { unique: true });
export const Wishlist = mongoose.model("Wishlist", wishlistSchema);
const reviewSchema = new Schema(
  {
    user: ref("User"),
    product: ref("Product"),
    order: ref("Order"),
    rating: { type: Number, min: 1, max: 5, required: true },
    comment: { type: String, maxlength: 2000, required: true },
    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
    },
  },
  { timestamps: true },
);
reviewSchema.index({ user: 1, product: 1 }, { unique: true });
export const Review = mongoose.model("Review", reviewSchema);
export const Support = mongoose.model(
  "Support",
  new Schema(
    {
      name: String,
      email: String,
      subject: String,
      message: String,
      status: { type: String, enum: ["open", "resolved"], default: "open" },
      reply: String,
    },
    { timestamps: true },
  ),
);
export const Subscriber = mongoose.model(
  "Subscriber",
  new Schema(
    {
      email: { type: String, unique: true, required: true },
      confirmed: { type: Boolean, default: false },
      tokenHash: String,
      expiresAt: Date,
      unsubscribedAt: Date,
    },
    { timestamps: true },
  ),
);
export const StoreSettings = mongoose.model(
  "StoreSettings",
  new Schema(
    {
      _id: { type: String, default: "store" },
      businessName: { type: String, default: "Nestro" },
      businessAddress: { type: String, default: "" },
      supportEmail: { type: String, default: "" },
      supportPhone: { type: String, default: "" },
      gstin: { type: String, default: "" },
      shippingCharge: { type: Number, min: 0, default: 1500 },
      freeShippingAbove: { type: Number, min: 0, default: 100000 },
      codMaxOrderValue: { type: Number, min: 0, default: 50000 },
      taxRate: { type: Number, min: 0, max: 40, default: 0 },
      deliveryDaysMin: { type: Number, default: 5 },
      deliveryDaysMax: { type: Number, default: 7 },
      pincodes: { type: [String], default: [] },
      acceptOrders: { type: Boolean, default: false },
      codEnabled: { type: Boolean, default: true },
      returnDays: { type: Number, default: 7 },
      policies: {
        privacy: String,
        terms: String,
        shipping: String,
        returns: String,
      },
      policiesPublished: { type: Boolean, default: false },
    },
    { timestamps: true },
  ),
);
const outboxSchema = new Schema(
  {
    key: { type: String, unique: true, required: true },
    to: String,
    subject: String,
    text: String,
    attempts: { type: Number, default: 0 },
    sentAt: Date,
    lockedUntil: Date,
    nextAttempt: { type: Date, default: Date.now },
    error: String,
  },
  { timestamps: true },
);
outboxSchema.index({ sentAt: 1, nextAttempt: 1 });
export const Outbox = mongoose.model("Outbox", outboxSchema);
const limitSchema = new Schema({
  _id: String,
  count: { type: Number, default: 0 },
  expiresAt: Date,
});
limitSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });
export const RateLimit = mongoose.model("RateLimit", limitSchema);
const eventSchema = new Schema(
  { _id: String, type: String, processedAt: Date },
  { timestamps: true },
);
export const PaymentEvent = mongoose.model("PaymentEvent", eventSchema);
const inventoryAdjustmentSchema = new Schema(
  {
    product: ref("Product"),
    actor: ref("User"),
    previousQuantity: { type: Number, min: 0, required: true },
    quantityDelta: { type: Number, required: true },
    resultingQuantity: { type: Number, min: 0, required: true },
    reason: { type: String, trim: true, maxlength: 250, required: true },
  },
  { timestamps: true },
);
inventoryAdjustmentSchema.index({ product: 1, createdAt: -1 });
export const InventoryAdjustment = mongoose.model(
  "InventoryAdjustment",
  inventoryAdjustmentSchema,
);
const adminAuditSchema = new Schema(
  {
    actor: ref("User"),
    target: { type: String, required: true, maxlength: 160 },
    action: { type: String, required: true, maxlength: 100 },
    before: { type: Schema.Types.Mixed },
    after: { type: Schema.Types.Mixed },
    reason: { type: String, trim: true, maxlength: 250 },
    requestId: { type: String, trim: true, maxlength: 100 },
  },
  { timestamps: true, minimize: false },
);
adminAuditSchema.index({ actor: 1, createdAt: -1 });
adminAuditSchema.index({ target: 1, createdAt: -1 });
export const AdminAudit = mongoose.model("AdminAudit", adminAuditSchema);
