import CartModel from "../models/cart.model.js";
import ProductModel from "../models/product.model.js";
import OrderModel from "../models/order.model.js";
import { Coupon, StoreSettings } from "../models/commerce.model.js";
import { fail, integer, priceOf, money, text } from "../utils/validation.js";

export async function settings(session) {
  return (
    (await StoreSettings.findById("store").session(session || null)) ||
    new StoreSettings()
  );
}
export function shippingFor(config, pincode, subtotal) {
  if (!/^[1-9]\d{5}$/.test(pincode || "")) fail(400, "Enter a valid pincode");
  if (!config.acceptOrders || !config.policiesPublished)
    fail(
      409,
      "Checkout setup is incomplete or orders are paused. Please contact the store to configure shipping, publish policies and enable checkout.",
    );
  if (config.pincodes.length && !config.pincodes.includes(pincode))
    fail(400, "Delivery is not available at this pincode");
  const threshold = money(config.freeShippingAbove, "free shipping threshold");
  const charge = money(config.shippingCharge, "shipping charge");
  return subtotal >= threshold ? 0 : charge;
}
export async function buildQuote(userId, pincode, couponCode, session) {
  const config = await settings(session);
  const cart = await CartModel.findOne({ userId }).session(session || null);
  if (!cart?.items.length) fail(400, "Your cart is empty");
  const products = await ProductModel.find({
    _id: { $in: cart.items.map((item) => item.productId) },
  }).session(session || null);
  const items = cart.items.map((item) => {
    const product = products.find(
      (product) => String(product._id) === String(item.productId),
    );
    const quantity = integer(item.quantity, "quantity");
    if (
      !product ||
      !product.status ||
      product.archived ||
      !product.stock ||
      product.stockQuantity < quantity
    )
      fail(
        409,
        `${product?.title || "A cart product"} is unavailable in the requested quantity`,
      );
    const price = priceOf(product);
    return {
      product_id: product._id,
      title: product.title,
      thumbnail: product.thumbnail,
      sku: product.sku,
      color: product.color,
      quantity,
      price,
      total: money(price * quantity),
    };
  });
  const subtotal = money(items.reduce((sum, item) => sum + item.total, 0));
  const shippingCharge = shippingFor(config, pincode, subtotal);
  let coupon = null;
  let couponDiscount = 0;
  if (couponCode) {
    const code = text(couponCode, "coupon", 40).toUpperCase();
    coupon = await Coupon.findOne({
      code,
      active: true,
      expiresAt: { $gt: new Date() },
    }).session(session || null);
    if (
      !coupon ||
      coupon.used >= coupon.usageLimit ||
      subtotal < coupon.minimum
    )
      fail(
        400,
        "Coupon is invalid, expired, exhausted or below its minimum spend",
      );
    const used = await OrderModel.countDocuments({
      user: userId,
      couponCode: code,
      couponReserved: true,
    }).session(session || null);
    if (used >= coupon.perUserLimit)
      fail(400, "Coupon usage limit reached for this account");
    couponDiscount =
      coupon.type === "percent"
        ? (subtotal * coupon.value) / 100
        : coupon.value;
    couponDiscount = money(
      Math.min(subtotal, coupon.maximumDiscount || subtotal, couponDiscount),
    );
  }
  const totalAmount = money(subtotal - couponDiscount + shippingCharge);
  if (totalAmount < 1) fail(400, "Order total must be at least ₹1");
  // Catalog prices include tax; show the included amount, do not add it twice.
  const taxAmount = money(
    ((subtotal - couponDiscount) * config.taxRate) / (100 + config.taxRate),
  );
  return {
    items,
    subtotal,
    shippingCharge,
    couponDiscount,
    couponCode: coupon?.code || "",
    taxRate: config.taxRate,
    taxAmount,
    totalAmount,
    amountPaise: Math.round(totalAmount * 100),
    currency: "INR",
    cartRevision: cart.revision,
    deliveryDaysMin: config.deliveryDaysMin,
    deliveryDaysMax: config.deliveryDaysMax,
    config,
  };
}
