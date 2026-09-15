import dotenv from "dotenv";
import mongoose from "mongoose";
import "../src/models/user.model.js";
import "../src/models/pendingUser.model.js";
import "../src/models/product.model.js";
import "../src/models/category.model.js";
import "../src/models/room.model.js";
import "../src/models/cart.model.js";
import "../src/models/order.model.js";
import "../src/models/commerce.model.js";
dotenv.config({ path: process.env.DOTENV_CONFIG_PATH || ".env" });
// Back up your database and stop API instances before --apply. Dry run is the default.
const apply = process.argv.includes("--apply");
if (!process.env.MONGO_URI) throw new Error("MONGO_URI is required");
await mongoose.connect(process.env.MONGO_URI, {
  autoIndex: false,
  serverSelectionTimeoutMS: 10000,
});
try {
  const db = mongoose.connection.db,
    carts = db.collection("carts"),
    products = db.collection("products"),
    orders = db.collection("orders");
  const duplicates = await carts
    .aggregate([
      { $group: { _id: "$userId", count: { $sum: 1 } } },
      { $match: { count: { $gt: 1 } } },
    ])
    .toArray();
  console.log(
    JSON.stringify({
      mode: apply ? "apply" : "dry-run",
      duplicateCartAccounts: duplicates.length,
      productsWithoutCount: await products.countDocuments({
        stockQuantity: { $exists: false },
      }),
      legacyOrders: await orders.countDocuments({
        inventoryState: { $exists: false },
      }),
    }),
  );
  if (apply) {
    const hello = await db.admin().command({ hello: 1 });
    if (!hello.setName && hello.msg !== "isdbgrid")
      throw new Error("Migration requires a replica set");
    await db.createCollection("nestro_migration_backup").catch((e) => {
      if (e.code !== 48) throw e;
    });
    for (const group of duplicates)
      await mongoose.connection.transaction(async (session) => {
        const docs = await carts
          .find({ userId: group._id }, { session })
          .sort({ updatedAt: 1, _id: 1 })
          .toArray();
        const merged = new Map();
        for (const doc of docs) {
          await db
            .collection("nestro_migration_backup")
            .updateOne(
              { _id: "cart:" + doc._id },
              { $setOnInsert: { original: doc, at: new Date() } },
              { upsert: true, session },
            );
          for (const item of doc.items || [])
            if (
              item.productId &&
              Number.isInteger(item.quantity) &&
              item.quantity > 0
            )
              merged.set(String(item.productId), {
                productId: item.productId,
                quantity: Math.min(99, item.quantity),
              });
        }
        if (merged.size > 100)
          throw new Error(
            "A merged cart exceeds 100 products; resolve it manually using the backup",
          );
        const keep = docs.at(-1);
        await carts.updateOne(
          { _id: keep._id },
          {
            $set: {
              items: [...merged.values()],
              revision: 0,
              mergedGuestIds: [],
            },
          },
          { session },
        );
        await carts.deleteMany(
          { _id: { $in: docs.slice(0, -1).map((d) => d._id) } },
          { session },
        );
      });
    await products.updateMany(
      { stockQuantity: { $exists: false } },
      { $set: { stockQuantity: 0 } },
    );
    await products.updateMany(
      { __v: { $exists: false } },
      { $set: { __v: 0 } },
    );
    await carts.updateMany(
      { revision: { $exists: false } },
      { $set: { revision: 0, mergedGuestIds: [] } },
    );
    await orders.updateMany(
      { inventoryState: { $exists: false } },
      { $set: { inventoryState: "legacy" } },
    );
    for (const field of ["razorpay_order_id", "idempotencyKey"])
      await orders.updateMany({ [field]: "" }, { $unset: { [field]: 1 } });
    for (const model of Object.values(mongoose.models)) {
      await model.createCollection();
      await model.createIndexes();
    }
    console.log(
      "Migration completed. Enter verified physical stock counts before enabling checkout.",
    );
  }
} finally {
  await mongoose.disconnect();
}
