import mongoose from "mongoose";

const schema = new mongoose.Schema(
  {
    name: {
      type: String,
      unique: true,
      minlength: 4,
    },
    slug: {
      type: String,
      unique: true,
    },
    image: {
      type: String,
      default: "",
    },
    status: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  },
);

const categoryModel = mongoose.model("categories", schema);

export default categoryModel;
