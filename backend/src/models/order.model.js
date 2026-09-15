import mongoose from "mongoose";
const { Schema } = mongoose;
const itemSchema = new Schema(
  {
    product_id: { type: Schema.Types.ObjectId, ref: "Product", required: true },
    title: String,
    thumbnail: String,
    sku: String,
    color: String,
    quantity: {
      type: Number,
      required: true,
      min: 1,
      max: 99,
      validate: Number.isInteger,
    },
    price: { type: Number, required: true, min: 0 },
    total: { type: Number, required: true, min: 0 },
  },
  { _id: false },
);
const orderSchema = new Schema(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    customerEmail: String,
    items: { type: [itemSchema], required: true },
    shippingAddress: {
      fullName: { type: String, required: true },
      mobile: { type: String, required: true },
      pincode: { type: String, required: true },
      addressLine: { type: String, required: true },
      city: { type: String, required: true },
      state: { type: String, required: true },
      country: { type: String, default: "India" },
    },
    billing: { businessName: String, gstin: String },
    seller: {
      businessName: String,
      businessAddress: String,
      gstin: String,
      supportEmail: String,
    },
    paymentMethod: { type: String, enum: ["cod", "online"], required: true },
    paymentStatus: {
      type: String,
      enum: ["pending", "paid", "failed", "refunded"],
      default: "pending",
    },
    orderStatus: {
      type: String,
      enum: [
        "placed",
        "confirmed",
        "packed",
        "shipped",
        "out_for_delivery",
        "delivered",
        "cancelled",
        "return",
        "return_requested",
        "return_approved",
        "returned",
        "needs_review",
      ],
      default: "placed",
    },
    subtotal: { type: Number, min: 0, default: 0 },
    shippingCharge: { type: Number, min: 0, default: 0 },
    couponCode: String,
    couponDiscount: { type: Number, min: 0, default: 0 },
    couponReserved: { type: Boolean, default: false },
    taxRate: { type: Number, min: 0, default: 0 },
    taxAmount: { type: Number, min: 0, default: 0 },
    totalAmount: { type: Number, min: 0, required: true },
    amountPaise: { type: Number, min: 0 },
    currency: { type: String, default: "INR" },
    razorpay_payment_id: String,
    razorpay_order_id: String,
    idempotencyKey: String,
    checkoutFingerprint: String,
    inventoryState: {
      type: String,
      enum: ["reserved", "committed", "released", "legacy"],
      default: "legacy",
    },
    cartRevision: Number,
    cartConsumed: { type: Boolean, default: false },
    expiresAt: Date,
    paidAt: Date,
    deliveredAt: Date,
    tracking: { carrier: String, number: String, url: String },
    refund: {
      status: {
        type: String,
        enum: [
          "none",
          "requested",
          "processing",
          "processed",
          "failed",
          "manual_required",
        ],
        default: "none",
      },
      id: String,
      reference: String,
      requestedAt: Date,
      processedAt: Date,
      amount: Number,
    },
    returnReason: String,
    returnDays: { type: Number, default: 7 },
    history: [
      {
        status: String,
        note: String,
        at: { type: Date, default: Date.now },
        actor: { type: Schema.Types.ObjectId, ref: "User" },
      },
    ],
  },
  { timestamps: true },
);
orderSchema.index(
  { user: 1, idempotencyKey: 1 },
  {
    unique: true,
    partialFilterExpression: { idempotencyKey: { $type: "string" } },
  },
);
orderSchema.index(
  { razorpay_order_id: 1 },
  {
    unique: true,
    partialFilterExpression: { razorpay_order_id: { $type: "string" } },
  },
);
orderSchema.index({ user: 1, createdAt: -1 });
orderSchema.index({ inventoryState: 1, expiresAt: 1 });
orderSchema.index(
  { user: 1, cartRevision: 1 },
  { unique: true, partialFilterExpression: { inventoryState: "reserved" } },
);
export default mongoose.model("Order", orderSchema);
