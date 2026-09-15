import dotenv from "dotenv";
import { randomUUID } from "node:crypto";
import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import mongoose from "mongoose";
import categoryRouter from "./routers/category.router.js";
import roomRouter from "./routers/room.router.js";
import productRouter from "./routers/product.router.js";
import userRouter from "./routers/user.router.js";
import cartRouter from "./routers/cart.router.js";
import orderRouter from "./routers/order.router.js";
import commerceRouter from "./routers/commerce.router.js";
import { webhook } from "./controllers/order.controller.js";

dotenv.config({ path: process.env.DOTENV_CONFIG_PATH || ".env" });

export const app = express();
app.disable("x-powered-by");
if (process.env.TRUST_PROXY_HOPS)
  app.set("trust proxy", Number(process.env.TRUST_PROXY_HOPS));
const origins = (process.env.FRONTEND_URL || "http://localhost:3000")
  .split(",")
  .map((value) => value.trim().replace(/\/$/, ""));
app.use((req, res, next) => {
  const supplied = String(req.get("x-request-id") || "").trim();
  req.requestId = /^[A-Za-z0-9._-]{8,100}$/.test(supplied)
    ? supplied
    : randomUUID();
  res.set("X-Request-ID", req.requestId);
  const startedAt = Date.now();
  res.on("finish", () => {
    if (res.statusCode < 500 && process.env.LOG_CLIENT_ERRORS !== "true")
      return;
    console.warn("HTTP request completed", {
      requestId: req.requestId,
      method: req.method,
      path: req.baseUrl + (req.route?.path || req.path),
      status: res.statusCode,
      durationMs: Date.now() - startedAt,
    });
  });
  next();
});
app.use(cors({ origin: origins, credentials: true }));
app.use((req, res, next) => {
  res.set({
    "X-Content-Type-Options": "nosniff",
    "X-Frame-Options": "DENY",
    "Referrer-Policy": "strict-origin-when-cross-origin",
    "Permissions-Policy":
      "camera=(), microphone=(), geolocation=(), payment=()",
    "Content-Security-Policy":
      "default-src 'self'; base-uri 'self'; object-src 'none'; frame-ancestors 'none'; form-action 'self'; img-src 'self' https: data: blob:; script-src 'self' 'unsafe-inline' https://checkout.razorpay.com; style-src 'self' 'unsafe-inline'; connect-src 'self' https://api.razorpay.com; frame-src https://api.razorpay.com https://checkout.razorpay.com",
    "Cache-Control": "no-store",
  });
  if (process.env.NODE_ENV === "production")
    res.set("Strict-Transport-Security", "max-age=31536000; includeSubDomains");
  next();
});
// Raw bytes are required for webhook HMAC verification. Keep before JSON parsing.
app.post(
  "/api/order/webhook",
  express.raw({ type: "application/json", limit: "256kb" }),
  webhook,
);
app.use(cookieParser());
app.use(express.json({ limit: "256kb" }));
app.use((req, res, next) => {
  if (
    !["GET", "HEAD", "OPTIONS"].includes(req.method) &&
    req.cookies?.token &&
    !req.headers.authorization
  ) {
    if (!req.headers.origin || !origins.includes(req.headers.origin))
      return res
        .status(403)
        .json({ success: false, message: "Request origin is not allowed" });
  }
  next();
});
app.get("/health", (req, res) => res.status(200).json({ status: "ok" }));
app.get("/ready", (req, res) =>
  res.status(mongoose.connection.readyState === 1 ? 200 : 503).json({
    status: mongoose.connection.readyState === 1 ? "ready" : "unavailable",
  }),
);
app.use("/api/category", categoryRouter);
app.use("/api/room-type", roomRouter);
app.use("/api/product", productRouter);
app.use("/api/user", userRouter);
app.use("/api/cart", cartRouter);
app.use("/api/order", orderRouter);
app.use("/api/commerce", commerceRouter);
app.use((req, res) =>
  res.status(404).json({
    success: false,
    message: "Endpoint not found",
    requestId: req.requestId,
  }),
);
app.use((error, req, res, next) => {
  if (res.headersSent) return next(error);
  const status =
    error.status ||
    (error.code === 11000
      ? 409
      : ["ValidationError", "CastError", "MulterError"].includes(error.name)
        ? 400
        : error.name === "VersionError"
          ? 409
          : 500);
  if (error.name === "VersionError")
    error.message = "This record changed. Refresh and try again.";
  if (status >= 500)
    console.error("Request failed", {
      requestId: req.requestId,
      method: req.method,
      path: req.baseUrl + (req.route?.path || req.path),
      type: error.name,
    });
  res.status(status).json({
    success: false,
    message:
      status >= 500
        ? "Service temporarily unavailable. Please try again or contact support."
        : error.code === 11000
          ? "This record already exists or was updated concurrently"
          : error.message,
    requestId: req.requestId,
  });
});
async function start() {
  if (!process.env.MONGO_URI) throw new Error("MONGO_URI is required");
  if (!(process.env.JWT_SECRET || process.env.CRYPTR_SECRET_KEY))
    throw new Error("JWT_SECRET is required");
  if (
    process.env.NODE_ENV === "production" &&
    (!process.env.JWT_SECRET || process.env.JWT_SECRET.length < 32)
  )
    throw new Error(
      "Production requires a separate JWT_SECRET of at least 32 characters",
    );
  const maxPoolSize = Number(process.env.MONGO_MAX_POOL_SIZE || 10);
  if (!Number.isInteger(maxPoolSize) || maxPoolSize < 1 || maxPoolSize > 100)
    throw new Error("MONGO_MAX_POOL_SIZE must be an integer between 1 and 100");
  mongoose.connection.on("error", (error) =>
    console.error("MongoDB connection error", {
      name: error.name,
      message: error.message,
    }),
  );
  mongoose.connection.on("disconnected", () =>
    console.error(
      "MongoDB connection lost; API readiness is unavailable until Atlas reconnects",
    ),
  );
  mongoose.connection.on("reconnected", () =>
    console.info("MongoDB connection restored"),
  );
  await mongoose.connect(process.env.MONGO_URI, {
    autoIndex: process.env.NODE_ENV !== "production",
    serverSelectionTimeoutMS: 10000,
    maxPoolSize,
  });
  const hello = await mongoose.connection.db.admin().command({ hello: 1 });
  if (!hello.setName && hello.msg !== "isdbgrid")
    throw new Error(
      "Use MongoDB Atlas or a replica set; checkout requires transactions",
    );
  const server = app.listen(Number(process.env.PORT || 5000), () =>
    console.log("Nestro API ready", {
      maxPoolSize,
      backgroundJobsEnabled: false,
    }),
  );
  const shutdown = () => {
    server.close(async () => {
      await mongoose.disconnect();
      process.exit(0);
    });
  };
  process.once("SIGTERM", shutdown);
  process.once("SIGINT", shutdown);
  return server;
}
if (process.env.NODE_ENV !== "test")
  start().catch((error) => {
    console.error(error.message);
    process.exitCode = 1;
  });
