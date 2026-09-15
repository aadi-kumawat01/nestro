import mongoose from "mongoose";
import CartModel from "../models/cart.model.js";
import ProductModel from "../models/product.model.js";
import {
  asyncRoute,
  fail,
  objectId,
  integer,
  text,
} from "../utils/validation.js";

async function getCart(userId) {
  let cart = await CartModel.findOne({ userId });
  if (!cart) {
    try {
      cart = await CartModel.create({ userId, items: [] });
    } catch (error) {
      if (error.code !== 11000) throw error;
      cart = await CartModel.findOne({ userId });
    }
  }
  const rawItems = cart.items.map((item) => ({
    productId: String(item.productId),
    quantity: item.quantity,
  }));
  await cart.populate({
    path: "items.productId",
    select:
      "title slug price salePrice thumbnail category stock stockQuantity status archived color",
    populate: { path: "category", select: "name" },
  });
  // Tombstones stay removable: silently hiding an item would leave checkout blocked.
  const data = cart.toObject();
  data.items = data.items.map((item, index) => ({
    ...item,
    productId: item.productId
      ? {
          ...item.productId,
          available: Boolean(
            item.productId.stock &&
            item.productId.status &&
            !item.productId.archived &&
            Number.isInteger(item.productId.stockQuantity) &&
            item.productId.stockQuantity > 0,
          ),
          stock: item.productId.stock && !item.productId.archived,
          status: item.productId.status && !item.productId.archived,
        }
      : {
          _id: rawItems[index].productId,
          title: "Unavailable product",
          price: 0,
          stock: false,
          status: false,
          stockQuantity: 0,
          available: false,
        },
  }));
  return data;
}
export const read = asyncRoute(async (req, res) =>
  res.json({ success: true, cart: await getCart(req.user._id) }),
);
export function normalizeCartItems(items) {
  if (typeof items === "string") {
    try {
      items = JSON.parse(items);
    } catch {
      fail(400, "Invalid cart items");
    }
  }
  if (!Array.isArray(items) || items.length > 100)
    fail(400, "Cart supports up to 100 products");
  const ids = new Set();
  return items.map((item) => {
    const productId = objectId(item?.productId, "product ID");
    if (ids.has(productId)) fail(400, "Duplicate product in cart");
    ids.add(productId);
    return { productId, quantity: integer(item.quantity, "quantity") };
  });
}
export const sync = asyncRoute(async (req, res) => {
  const items = normalizeCartItems(req.body.items);
  const mergeId = req.body.mergeId
    ? text(req.body.mergeId, "guest cart ID", 80)
    : null;
  if (!mergeId && req.body.replace !== true)
    fail(400, "Guest cart ID is required");
  await getCart(req.user._id);
  await mongoose.connection.transaction(async (session) => {
    const cart = await CartModel.findOne({ userId: req.user._id }).session(
      session,
    );
    if (mergeId && cart.mergedGuestIds.includes(mergeId)) return;
    if (
      req.body.replace === true &&
      integer(
        req.body.revision,
        "cart revision",
        0,
        Number.MAX_SAFE_INTEGER,
      ) !== cart.revision
    )
      fail(409, "Cart changed on another device. Refresh and try again.");
    const products = await ProductModel.find({
      _id: { $in: items.map((item) => item.productId) },
      status: true,
      archived: { $ne: true },
      stock: true,
    }).session(session);
    const valid = items.filter((item) =>
      products.some(
        (product) =>
          String(product._id) === item.productId &&
          Number.isInteger(product.stockQuantity) &&
          product.stockQuantity >= item.quantity,
      ),
    );
    if (req.body.replace === true) cart.items = valid;
    else
      for (const item of valid) {
        const existing = cart.items.find(
          (entry) => String(entry.productId) === item.productId,
        );
        if (existing) existing.quantity = item.quantity;
        else cart.items.push(item);
      }
    if (cart.items.length > 100) fail(400, "Cart supports up to 100 products");
    if (mergeId)
      cart.mergedGuestIds = [...cart.mergedGuestIds.slice(-49), mergeId];
    cart.revision += 1;
    await cart.save({ session });
  });
  res.json({
    success: true,
    cart: await getCart(req.user._id),
    message: "Cart synchronized",
  });
});
export const updateItem = asyncRoute(async (req, res) => {
  const productId = objectId(req.params.id, "product ID");
  const quantity = integer(req.body.quantity, "quantity", 0, 99);
  const revision = integer(
    req.body.revision,
    "cart revision",
    0,
    Number.MAX_SAFE_INTEGER,
  );
  await getCart(req.user._id);
  await mongoose.connection.transaction(async (session) => {
    const cart = await CartModel.findOne({ userId: req.user._id }).session(
      session,
    );
    if (cart.revision !== revision)
      fail(409, "Cart changed on another device. Please try again.");
    if (quantity) {
      const product = await ProductModel.findOne({
        _id: productId,
        status: true,
        archived: { $ne: true },
        stock: true,
        stockQuantity: { $gte: quantity },
      }).session(session);
      if (!product) fail(409, "Requested quantity is unavailable");
      const existing = cart.items.find(
        (item) => String(item.productId) === productId,
      );
      if (existing) existing.quantity = quantity;
      else cart.items.push({ productId, quantity });
    } else
      cart.items = cart.items.filter(
        (item) => String(item.productId) !== productId,
      );
    if (cart.items.length > 100) fail(400, "Cart supports up to 100 products");
    cart.revision += 1;
    await cart.save({ session });
  });
  res.json({ success: true, cart: await getCart(req.user._id) });
});
