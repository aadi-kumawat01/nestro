import ProductModel from "../models/product.model.js";
import categoryModel from "../models/category.model.js";
import {
  sendBadRequest,
  sendConflict,
  sendCreated,
  sendNotFound,
  sendServerError,
  sendSuccess,
} from "../utils/response.js";

export const read = async (req, res) => {
  try {
    const query = req.query;
    const filter = req.adminCatalog ? {} : { status: true };
    const limit = Math.min(100, Math.max(1, Number(query.limit) || 100));
    if (req.adminCatalog && query.status) {
      filter.status = query.status === "true";
    }
    const category = await categoryModel.find(filter).limit(limit);
    const countdocument = await categoryModel.countDocuments();

    res.status(200).json({
      message: "Data fetched successfully",
      success: true,
      data: category,
      total: countdocument,
    });
  } catch (error) {
    return sendServerError(res);
  }
};

export const readById = async (req, res) => {
  try {
    const { id } = req.params;

    const category = await categoryModel.findOne({
      _id: id,
      ...(!req.adminCatalog ? { status: true } : {}),
    });

    if (!category) {
      return sendNotFound(res);
    }

    return res.status(200).json({
      success: true,
      message: "Category found",
      data: category,
    });
  } catch (error) {
    console.error(error);
    return sendServerError(res);
  }
};

export const create = async (req, res) => {
  try {
    const imageUrl = req.file?.path || "";
    const { name, slug } = req.body;
    if (!name || !slug) {
      return sendBadRequest(res, "name and slug is required");
    }

    const category = await categoryModel.findOne({ slug });
    if (category) return sendConflict(res);

    await categoryModel.create({ name, slug, image: imageUrl });
    return sendCreated(res);
  } catch (error) {
    console.error(error);
    return sendServerError(res);
  }
};

export const updateStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const category = await categoryModel.findById(id);
    if (!category) {
      return sendNotFound(res);
    }

    await categoryModel.findByIdAndUpdate(
      { _id: id },
      { $set: { status: !category.status } },
    );
    return sendSuccess(res, "category status update");
  } catch (error) {
    return sendServerError(res);
  }
};

export const edit = async (req, res) => {
  try {
    const { name, slug } = req.body;
    const { id } = req.params;

    const category = await categoryModel.findById(id);

    if (!category) {
      return sendNotFound(res, "Category not found");
    }

    if (name) {
      category.name = name;
    }

    if (slug) {
      category.slug = slug;
    }

    if (req.file) {
      const imageUrl =
        req.file.path || req.file.secure_url || req.file.url || "";

      if (!imageUrl) {
        return res.status(400).json({
          success: false,
          message: "Image uploaded but image URL was not generated",
        });
      }

      category.image = imageUrl;
    }

    await category.save();

    return sendSuccess(res, "Category updated successfully");
  } catch (error) {
    console.error("CATEGORY EDIT ERROR:", error);

    return res.status(500).json({
      success: false,
      message: error?.message || "Category update failed",
    });
  }
};

export const deleteById = async (req, res) => {
  try {
    const { id } = req.params;
    const category = await categoryModel.findById(id);
    if (!category) {
      return sendNotFound(res);
    }

    if (await ProductModel.exists({ category: id }))
      return sendConflict(
        res,
        "Reassign products before deleting this category",
      );
    await categoryModel.findByIdAndDelete(id);
    return sendSuccess(res, "Category delete successfully");
  } catch (error) {
    return sendServerError(res);
  }
};
