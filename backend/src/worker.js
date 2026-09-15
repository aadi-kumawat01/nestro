import dotenv from "dotenv";
import mongoose from "mongoose";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { expireReservations } from "./services/orders.js";
import { deliverOutbox } from "./utils/mail.js";

dotenv.config({ path: process.env.DOTENV_CONFIG_PATH || ".env" });

const intervalMs = Number(process.env.WORKER_INTERVAL_MS || 60000);
if (!Number.isInteger(intervalMs) || intervalMs < 10000 || intervalMs > 3600000)
  throw new Error(
    "WORKER_INTERVAL_MS must be an integer between 10000 and 3600000",
  );
const maxConsecutiveFailures = Number(
  process.env.WORKER_MAX_CONSECUTIVE_FAILURES || 3,
);
if (
  !Number.isInteger(maxConsecutiveFailures) ||
  maxConsecutiveFailures < 1 ||
  maxConsecutiveFailures > 20
)
  throw new Error(
    "WORKER_MAX_CONSECUTIVE_FAILURES must be an integer between 1 and 20",
  );

async function runWorker() {
  if (!process.env.MONGO_URI) throw new Error("MONGO_URI is required");
  await mongoose.connect(process.env.MONGO_URI, {
    autoIndex: process.env.NODE_ENV !== "production",
    serverSelectionTimeoutMS: 10000,
    maxPoolSize: 5,
  });
  let running = false;
  let stopping = false;
  let timer;
  let consecutiveFailures = 0;
  const shutdown = async () => {
    if (stopping) return;
    stopping = true;
    clearInterval(timer);
    while (running) await new Promise((resolve) => setTimeout(resolve, 100));
    await mongoose.disconnect();
  };
  const tick = async () => {
    if (running || stopping) return;
    running = true;
    let fatal = false;
    const startedAt = Date.now();
    try {
      await expireReservations();
      await deliverOutbox();
      consecutiveFailures = 0;
      console.info("Worker cycle completed", {
        durationMs: Date.now() - startedAt,
      });
    } catch (error) {
      consecutiveFailures += 1;
      console.error("Worker cycle failed", {
        type: error.name,
        durationMs: Date.now() - startedAt,
        consecutiveFailures,
      });
      if (consecutiveFailures >= maxConsecutiveFailures) {
        console.error("Worker is unhealthy; stopping for platform recovery", {
          maxConsecutiveFailures,
        });
        fatal = true;
      }
    } finally {
      running = false;
    }
    if (fatal) {
      await shutdown();
      process.exitCode = 1;
    }
  };
  await tick();
  if (stopping) return undefined;
  timer = setInterval(tick, intervalMs);
  process.once("SIGTERM", shutdown);
  process.once("SIGINT", shutdown);
  console.info("Nestro worker ready", { intervalMs, maxConsecutiveFailures });
  return timer;
}

if (
  process.argv[1] &&
  fileURLToPath(import.meta.url) === resolve(process.argv[1])
) {
  runWorker().catch((error) => {
    console.error(error.message);
    process.exitCode = 1;
  });
}
