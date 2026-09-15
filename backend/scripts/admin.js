import "dotenv/config";
import mongoose from "mongoose";
import User from "../src/models/user.model.js";
const email = process.argv[2]?.trim().toLowerCase(),
  role = process.argv[3] || "admin";
if (!email || !["admin", "superAdmin", "user"].includes(role))
  throw new Error("Usage: node scripts/admin.js email admin|superAdmin|user");
await mongoose.connect(process.env.MONGO_URI, { autoIndex: false });
try {
  const result = await User.updateOne(
    { email, isVerified: true },
    { $set: { role, status: true }, $inc: { tokenVersion: 1 } },
  );
  if (!result.matchedCount)
    throw new Error(
      "Verified account not found. Register and verify the email first.",
    );
  console.log("Role updated; existing sessions invalidated.");
} finally {
  await mongoose.disconnect();
}
