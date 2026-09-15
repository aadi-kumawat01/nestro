import { createHash } from "node:crypto";
import { RateLimit } from "../models/commerce.model.js";
import { asyncRoute } from "../utils/validation.js";

export const limitRequests = (scope, maximum, minutes = 15) =>
  asyncRoute(async (req, res, next) => {
    const window = minutes * 60000;
    const bucket = Math.floor(Date.now() / window);
    const identity = createHash("sha256")
      .update(`${scope}:${req.ip}:${bucket}`)
      .digest("hex");
    let record;
    try {
      record = await RateLimit.findOneAndUpdate(
        { _id: identity },
        {
          $inc: { count: 1 },
          $setOnInsert: { expiresAt: new Date((bucket + 2) * window) },
        },
        { upsert: true, new: true },
      );
    } catch (error) {
      if (error.code !== 11000) throw error;
      record = await RateLimit.findOneAndUpdate(
        { _id: identity },
        { $inc: { count: 1 } },
        { new: true },
      );
    }
    if (record.count > maximum)
      return res
        .set("Retry-After", String(Math.ceil(window / 1000)))
        .status(429)
        .json({
          success: false,
          message: "Too many attempts. Please try again later.",
        });
    next();
  });
