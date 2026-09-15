import mongoose from "mongoose";

const apply = process.argv.includes("--apply");

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
  const db = mongoose.connection.db;
  if (db.databaseName !== "nestro_staging") {
    throw new Error(
      `Refusing to clear test orders outside nestro_staging (connected to ${db.databaseName}).`,
    );
  }

  const orders = db.collection("orders");
  const paymentEvents = db.collection("paymentevents");
  const outbox = db.collection("outboxes");
  const orderIds = (
    await orders.find({}, { projection: { _id: 1 } }).toArray()
  ).map(({ _id }) => String(_id));
  const outboxMessages = orderIds.length
    ? await outbox
        .find(
          { key: { $regex: `^(${orderIds.join("|")}):` } },
          { projection: { _id: 1 } },
        )
        .toArray()
    : [];

  const summary = {
    mode: apply ? "apply" : "dry-run",
    database: db.databaseName,
    orders: orderIds.length,
    paymentEvents: await paymentEvents.countDocuments({}),
    orderNotificationMessages: outboxMessages.length,
  };

  if (apply) {
    const [deletedOrders, deletedPaymentEvents, deletedOutboxMessages] =
      await Promise.all([
        orders.deleteMany({}),
        paymentEvents.deleteMany({}),
        outboxMessages.length
          ? outbox.deleteMany({
              _id: { $in: outboxMessages.map(({ _id }) => _id) },
            })
          : Promise.resolve({ deletedCount: 0 }),
      ]);
    summary.deleted = {
      orders: deletedOrders.deletedCount,
      paymentEvents: deletedPaymentEvents.deletedCount,
      orderNotificationMessages: deletedOutboxMessages.deletedCount,
    };
  }

  console.log(JSON.stringify(summary));
} finally {
  await mongoose.disconnect();
}
