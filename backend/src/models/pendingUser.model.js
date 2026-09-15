import mongoose from "mongoose";

const pendingUserSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
    },

    password: {
      type: String,
      required: true,
    },

    mobile: {
      type: String,
      default: null,
    },

    marketingEmail: { type: Boolean, default: false },
    otp: {
      type: String,
      required: true,
    },

    otpExpire: {
      type: Date,
      required: true,
    },
    otpAttempts: { type: Number, default: 0 },
    otpSentAt: { type: Date, default: Date.now },
  },
  {
    timestamps: true,
  },
);
pendingUserSchema.index({ otpExpire: 1 }, { expireAfterSeconds: 0 });

const PendingUserModel = mongoose.model("PendingUser", pendingUserSchema);

export default PendingUserModel;
