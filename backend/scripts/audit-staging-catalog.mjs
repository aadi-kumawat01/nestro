import mongoose from "mongoose";

if (!process.env.MONGO_URI)
  throw new Error(
    "MONGO_URI is required. Run with the staging environment file.",
  );
await mongoose.connect(process.env.MONGO_URI, {
  autoIndex: false,
  serverSelectionTimeoutMS: 10000,
});

try {
  const db = mongoose.connection.db;
  if (db.databaseName !== "nestro_staging")
    throw new Error(
      `Refusing to audit a non-staging database (${db.databaseName}).`,
    );
  const products = db.collection("products");
  const active = { status: true, archived: { $ne: true } };
  const dimensions = {
    $or: [
      { "dimensions.length": { $lte: 0 } },
      { "dimensions.width": { $lte: 0 } },
      { "dimensions.height": { $lte: 0 } },
      { dimensions: { $exists: false } },
    ],
  };
  const [
    total,
    published,
    missingSku,
    missingDimensions,
    insecureThumbnail,
    unavailable,
  ] = await Promise.all([
    products.countDocuments({}),
    products.countDocuments(active),
    products.countDocuments({
      ...active,
      $or: [{ sku: { $exists: false } }, { sku: "" }],
    }),
    products.countDocuments({ ...active, ...dimensions }),
    products.countDocuments({
      ...active,
      $or: [
        { thumbnail: { $not: /^https:\/\//i } },
        { thumbnail: { $exists: false } },
      ],
    }),
    products.countDocuments({
      ...active,
      $or: [{ stock: { $ne: true } }, { stockQuantity: { $lte: 0 } }],
    }),
  ]);
  console.log(
    JSON.stringify({
      database: db.databaseName,
      total,
      published,
      missingSku,
      missingDimensions,
      insecureThumbnail,
      unavailable,
    }),
  );
} finally {
  await mongoose.disconnect();
}
