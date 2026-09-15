import ProductModel from "../models/product.model.js";
import CategoryModel from "../models/category.model.js";
import RoomModel from "../models/room.model.js";
import { InventoryAdjustment } from "../models/commerce.model.js";
import {
  asyncRoute,
  fail,
  text,
  objectId,
  pageOf,
  money,
  integer,
  escapeRegex,
} from "../utils/validation.js";

const withAvailability = (product) => {
  const data =
    typeof product?.toObject === "function" ? product.toObject() : product;
  return {
    ...data,
    available: Boolean(
      data?.status &&
      !data?.archived &&
      data?.stock &&
      Number.isInteger(data?.stockQuantity) &&
      data.stockQuantity > 0,
    ),
  };
};
const isHttpsUrl = (value) =>
  typeof value === "string" && /^https:\/\//i.test(value);
const assertPublishable = (data) => {
  if (!data.status) return;
  if (!data.sku) fail(400, "Published products require an SKU");
  if (!Number.isInteger(data.stockQuantity) || data.stockQuantity < 0)
    fail(
      400,
      "Published products require an explicit non-negative stock quantity",
    );
  if (
    !data.dimensions ||
    [
      data.dimensions.length,
      data.dimensions.width,
      data.dimensions.height,
    ].some((value) => !Number.isFinite(value) || value <= 0)
  )
    fail(400, "Published products require positive length, width, and height");
};

export const read = asyncRoute(async (req, res) => {
  const query = req.query;
  const { page, limit, skip } = pageOf(query);
  const filter = req.adminCatalog
    ? { archived: { $ne: true } }
    : { status: true, archived: { $ne: true } };
  if (req.adminCatalog && query.status) filter.status = query.status === "true";
  for (const [param, field] of [
    ["bestseller", "bestSeller"],
    ["newarrival", "newArrival"],
  ])
    if (query[param]) filter[field] = query[param] === "true";
  if (query.stock === "true") {
    filter.stock = true;
    filter.stockQuantity = { $gt: 0 };
  }
  if (query.stock === "false")
    filter.$or = [
      { stock: false },
      { stockQuantity: { $lte: 0 } },
      { stockQuantity: { $exists: false } },
    ];
  for (const field of ["color", "material"])
    if (query[field])
      filter[field] = {
        $in: text(query[field], field, 1000)
          .split(",")
          .map((value) => new RegExp("^" + escapeRegex(value) + "$", "i")),
      };
  if (query.search)
    filter.title = {
      $regex: escapeRegex(text(query.search, "search", 100)),
      $options: "i",
    };
  if (query.variantGroup)
    filter.variantGroup = text(query.variantGroup, "variant group", 100);
  if (query.category) {
    const slugs = text(query.category, "categories", 1000).split(",");
    const categories = await CategoryModel.find({
      slug: { $in: slugs },
      ...(!req.adminCatalog ? { status: true } : {}),
    }).select("_id");
    filter.category = { $in: categories.map((item) => item._id) };
  }
  if (query.room) {
    const rooms = await RoomModel.find({
      slug: { $in: text(query.room, "rooms", 1000).split(",") },
      ...(!req.adminCatalog ? { status: true } : {}),
    }).select("_id");
    filter.roomType = { $in: rooms.map((item) => item._id) };
  }
  const effectivePrice = {
    $cond: [
      { $and: [{ $gt: ["$salePrice", 0] }, { $lt: ["$salePrice", "$price"] }] },
      "$salePrice",
      "$price",
    ],
  };
  const range = [];
  if (query.minprice)
    range.push({ $gte: [effectivePrice, money(query.minprice)] });
  if (query.maxprice)
    range.push({ $lte: [effectivePrice, money(query.maxprice)] });
  if (range.length) filter.$expr = { $and: range };
  const sort = {
    "salePrice-asc": { effectivePrice: 1 },
    "salePrice-dsc": { effectivePrice: -1 },
    bestSelling: { sold: -1 },
  }[query.sortFilter] || { createdAt: -1 };
  const [rows, total] = await Promise.all([
    ProductModel.aggregate([
      { $match: filter },
      { $addFields: { effectivePrice } },
      { $sort: { ...sort, _id: 1 } },
      { $skip: skip },
      { $limit: limit },
    ]),
    ProductModel.countDocuments(filter),
  ]);
  const data = await ProductModel.populate(rows, [
    { path: "category" },
    { path: "roomType" },
  ]);
  res.json({
    success: true,
    data: data.map(withAvailability),
    total,
    page,
    limit,
    pages: Math.ceil(total / limit),
  });
});
export const readById = asyncRoute(async (req, res) => {
  const data = await ProductModel.findOne({
    _id: objectId(req.params.id),
    archived: { $ne: true },
    ...(!req.adminCatalog ? { status: true } : {}),
  }).populate("category roomType");
  if (!data) fail(404, "Product not found");
  res.json({ success: true, data: withAvailability(data) });
});
async function productFields(body, existing) {
  const data = {};
  for (const field of ["title", "description"])
    data[field] = text(
      body[field] ?? existing?.[field],
      field,
      field === "description" ? 15000 : 200,
    );
  data.slug = text(existing?.slug ?? body.slug, "slug", 200);
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(data.slug))
    fail(400, "Slug must contain lowercase letters, numbers and hyphens");
  for (const field of ["shortDescription", "color", "assembly", "variantGroup"])
    data[field] = text(
      body[field] ?? existing?.[field] ?? "",
      field,
      1000,
      false,
    );
  data.sku = text(existing?.sku ?? body.sku ?? "", "sku", 1000, false);
  data.warranty =
    text(
      body.warranty ?? existing?.warranty ?? "6 months",
      "warranty",
      1000,
      false,
    ) || "6 months";
  data.category = objectId(
    String(body.category ?? existing?.category ?? ""),
    "category",
  );
  data.roomType = objectId(
    String(body.roomType ?? existing?.roomType ?? ""),
    "room",
  );
  if (
    !(await CategoryModel.exists({ _id: data.category })) ||
    !(await RoomModel.exists({ _id: data.roomType }))
  )
    fail(400, "Choose a valid category and room");
  data.price = money(body.price ?? existing?.price, "price", 200);
  const rawSale =
    body.salePrice === undefined ? existing?.salePrice : body.salePrice;
  data.salePrice =
    rawSale === "" || rawSale === null || rawSale === undefined
      ? null
      : money(rawSale, "sale price", 0.01);
  if (data.salePrice > data.price)
    fail(400, "Sale price cannot exceed the regular price");
  data.discount = data.salePrice
    ? Math.round(((data.price - data.salePrice) / data.price) * 100)
    : 0;
  data.stockQuantity = integer(
    body.stockQuantity ?? existing?.stockQuantity ?? 0,
    "stock quantity",
    0,
    1000000,
  );
  for (const field of [
    "stock",
    "status",
    "featured",
    "bestSeller",
    "newArrival",
  ]) {
    const value =
      body[field] ?? existing?.[field] ?? ["stock", "status"].includes(field);
    if (![true, false, "true", "false"].includes(value))
      fail(400, `Invalid ${field}`);
    data[field] = value === true || value === "true";
  }
  data.material = text(
    body.material ?? existing?.material ?? "Wood",
    "material",
    100,
  );
  data.dimensions = { unit: "cm" };
  for (const field of ["length", "width", "height"])
    data.dimensions[field] = money(
      body[field] ?? existing?.dimensions?.[field] ?? 0,
      field,
    );
  data.weight = {
    value: money(body.weight ?? existing?.weight?.value ?? 0, "weight"),
    unit: "kg",
  };
  assertPublishable(data);
  return data;
}
export const create = asyncRoute(async (req, res) => {
  if (!req.file?.path) fail(400, "Upload a product thumbnail");
  if (!isHttpsUrl(req.file.path))
    fail(400, "Product thumbnail must be a secure hosted image");
  const data = await ProductModel.create({
    ...(await productFields(req.body)),
    thumbnail: req.file.path,
  });
  res.status(201).json({ success: true, message: "Product created", data });
});
export const edit = asyncRoute(async (req, res) => {
  const product = await ProductModel.findById(objectId(req.params.id));
  if (!product || product.archived) fail(404, "Product not found");
  if (
    req.body.stockQuantity !== undefined &&
    Number(req.body.__v) !== product.__v
  )
    fail(
      409,
      "Stock or product details changed. Reload the editor before saving.",
    );
  Object.assign(product, await productFields(req.body, product));
  if (req.file?.path) product.thumbnail = req.file.path;
  await product.save();
  res.json({ success: true, message: "Product updated", data: product });
});
export const addImages = asyncRoute(async (req, res) => {
  const product = await ProductModel.findById(objectId(req.params.id));
  if (!product) fail(404, "Product not found");
  const images = [
    ...product.images,
    ...(req.files || []).map((file) => file.path),
  ];
  if (images.length > 6) fail(400, "Maximum 6 gallery images are allowed");
  product.images = images;
  await product.save();
  res.json({ success: true, message: "Images added" });
});
export const removeImage = asyncRoute(async (req, res) => {
  const product = await ProductModel.findById(objectId(req.params.id));
  if (!product) fail(404, "Product not found");
  const url = text(req.body.url, "image URL", 1000);
  product.images = product.images.filter((image) => image !== url);
  await product.save();
  res.json({ success: true, message: "Image removed from product" });
});
export const updateStatus = asyncRoute(async (req, res) => {
  const product = await ProductModel.findById(objectId(req.params.id));
  if (!product) fail(404, "Product not found");
  if (!product.status)
    assertPublishable({ ...product.toObject(), status: true });
  product.status = !product.status;
  await product.save();
  res.json({ success: true, message: "Product status updated" });
});
export const updateFlag = asyncRoute(async (req, res) => {
  const field = req.body.field;
  if (!["stock", "featured", "bestSeller", "newArrival"].includes(field))
    fail(400, "Invalid product flag");
  const product = await ProductModel.findById(objectId(req.params.id));
  if (!product) fail(404, "Product not found");
  product[field] = !product[field];
  await product.save();
  res.json({ success: true, message: "Product updated" });
});
export const adjustInventory = asyncRoute(async (req, res) => {
  const productId = objectId(req.params.id);
  const quantityDelta = integer(
    req.body.quantityDelta,
    "quantity delta",
    -1000000,
    1000000,
  );
  if (!quantityDelta) fail(400, "Quantity delta must not be zero");
  const reason = text(req.body.reason, "adjustment reason", 250);
  let product;
  await ProductModel.db.transaction(async (session) => {
    product = await ProductModel.findOne({
      _id: productId,
      archived: { $ne: true },
    }).session(session);
    if (!product) fail(404, "Product not found");
    if (
      req.body.__v !== undefined &&
      integer(req.body.__v, "product version", 0, Number.MAX_SAFE_INTEGER) !==
        product.__v
    )
      fail(409, "Product changed. Reload before adjusting stock.");
    const previousQuantity = product.stockQuantity;
    const resultingQuantity = previousQuantity + quantityDelta;
    if (resultingQuantity < 0)
      fail(409, "Adjustment would make stock negative");
    product.stockQuantity = resultingQuantity;
    await product.save({ session });
    await InventoryAdjustment.create(
      [
        {
          product: product._id,
          actor: req.user._id,
          previousQuantity,
          quantityDelta,
          resultingQuantity,
          reason,
        },
      ],
      { session },
    );
  });
  res.json({
    success: true,
    data: withAvailability(product),
    message: "Inventory adjusted",
  });
});
export const deleteById = asyncRoute(async (req, res) => {
  const product = await ProductModel.findByIdAndUpdate(
    objectId(req.params.id),
    { $set: { status: false, archived: true } },
  );
  if (!product) fail(404, "Product not found");
  res.json({
    success: true,
    message: "Product archived; order history preserved",
  });
});
export const facets = asyncRoute(async (req, res) => {
  const filter = { status: true, archived: { $ne: true } };
  const [colors, materials] = await Promise.all([
    ProductModel.distinct("color", filter),
    ProductModel.distinct("material", filter),
  ]);
  res.json({
    success: true,
    data: {
      colors: colors.filter(Boolean).sort(),
      materials: materials.filter(Boolean).sort(),
    },
  });
});
