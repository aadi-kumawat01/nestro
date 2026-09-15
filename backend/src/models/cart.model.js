import mongoose from "mongoose";

const cartSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },
    items: [
      {
        _id: false,
        productId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Product",
        },

        quantity: {
          type: Number,
          default: 1,
          min: 1,
          max: 99,
          validate: Number.isInteger,
        },
      },
    ],
    revision: { type: Number, default: 0 },
    mergedGuestIds: { type: [String], default: [] },
  },
  {
    timestamps: true,
  },
);

const cartModel = mongoose.model("Cart", cartSchema);
export default cartModel;
