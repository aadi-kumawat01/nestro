import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
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
      minlength: 6,
    },

    mobile: {
      type: String,
      default: null,
    },

    role: {
      type: String,
      enum: ["user", "admin", "superAdmin"],
      default: "user",
    },
    tokenVersion: { type: Number, default: 0 },
    resetTokenHash: String,
    resetExpiresAt: Date,
    pendingEmail: String,
    emailChangeHash: String,
    emailChangeExpiresAt: Date,
    preferences: {
      marketingEmail: { type: Boolean, default: false },
    },

    addresses: {
      type: [
        {
          fullName: {
            type: String,
            required: true,
          },

          mobile: {
            type: String,
            required: true,
          },

          pincode: {
            type: String,
            required: true,
          },

          addressLine: {
            type: String,
            required: true,
          },

          city: {
            type: String,
            required: true,
          },

          state: {
            type: String,
            required: true,
          },

          country: {
            type: String,
            default: "India",
          },

          isDefault: {
            type: Boolean,
            default: false,
          },
        },
      ],
      default: [],
    },

    isVerified: {
      type: Boolean,
      default: false,
    },

    otp: {
      type: String,
    },

    otpExpire: Date,

    status: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  },
);

const UserModel = mongoose.model("User", userSchema);

export default UserModel;
