import mongoose from "mongoose";

const productSchema = new mongoose.Schema(
  {
    // Basic Information
    title: {
      type: String,
      required: true,
      trim: true,
    },

    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    shortDescription: {
      type: String,
      trim: true,
    },

    description: {
      type: String,
      required: true,
    },

    // Category
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "categories",
      required: true,
    },
    roomType: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "rooms",
      required: true,
    },

    // Pricing
    price: {
      type: Number,
      required: true,
      min: 200,
    },

    salePrice: {
      type: Number,
      default: null,
      min: 0,
    },

    discount: {
      type: Number,
      default: 0,
    },

    // Inventory
    stock: {
      type: Boolean,
      default: true,
      required: true,
    },

    sold: {
      type: Number,
      default: 0,
    },
    stockQuantity: {
      type: Number,
      min: 0,
      default: 0,
      validate: Number.isInteger,
    },
    sku: { type: String, trim: true, unique: true, sparse: true },
    warranty: { type: String, default: "6 months" },
    assembly: { type: String, default: "" },
    variantGroup: { type: String, default: "", index: true },
    archived: { type: Boolean, default: false, index: true },

    // Images
    thumbnail: {
      type: String,
      required: true,
    },

    images: [
      {
        type: String,
      },
    ],

    // Furniture Details
    material: {
      type: String,
      enum: [
        "Wood",
        "Sheesham",
        "Engineered Wood",
        "Metal",
        "Steel",
        "Plastic",
        "Glass",
        "Marble",
        "Fabric",
        "Leather",
      ],
      default: "Wood",
    },

    color: {
      type: String,
    },

    dimensions: {
      length: Number,
      width: Number,
      height: Number,
      unit: {
        type: String,
        default: "cm",
      },
    },

    weight: {
      value: Number,
      unit: {
        type: String,
        default: "kg",
      },
    },

    // Flags
    featured: {
      type: Boolean,
      default: false,
    },

    bestSeller: {
      type: Boolean,
      default: false,
    },

    newArrival: {
      type: Boolean,
      default: false,
    },

    status: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
    optimisticConcurrency: true,
  },
);

const productModel = mongoose.model("Product", productSchema);
export default productModel;
