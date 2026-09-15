import fs from "node:fs/promises";
import path from "node:path";
import mongoose from "mongoose";

const outputPath = path.resolve(process.argv[2] || "inventory-source.json");

if (!process.env.MONGO_URI) {
  throw new Error(
    "MONGO_URI is required. Run with the staging environment file.",
  );
}

await mongoose.connect(process.env.MONGO_URI, {
  autoIndex: false,
  serverSelectionTimeoutMS: 10000,
});

try {
  const products = await mongoose.connection.db
    .collection("products")
    .find(
      {},
      {
        projection: {
          _id: 1,
          title: 1,
          slug: 1,
          sku: 1,
          stockQuantity: 1,
          stock: 1,
          status: 1,
          archived: 1,
        },
      },
    )
    .sort({ title: 1, slug: 1 })
    .toArray();

  await fs.mkdir(path.dirname(outputPath), { recursive: true });
  await fs.writeFile(outputPath, JSON.stringify(products, null, 2), "utf8");
  console.log(
    JSON.stringify({ exportedProducts: products.length, outputPath }),
  );
} finally {
  await mongoose.disconnect();
}
