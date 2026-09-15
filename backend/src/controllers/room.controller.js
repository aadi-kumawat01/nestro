import ProductModel from "../models/product.model.js";
import roomModel from "../models/room.model.js";
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
    const room = await roomModel
      .find(req.adminCatalog ? {} : { status: true })
      .limit(100);
    const countdocument = await roomModel.countDocuments();

    res.status(200).json({
      message: "Data fetched successfully",
      success: true,
      data: room,
      total: countdocument,
    });
  } catch (error) {
    return sendServerError(res);
  }
};

export const readById = async (req, res) => {
  try {
    const { id } = req.params;

    const room = await roomModel.findOne({
      _id: id,
      ...(!req.adminCatalog ? { status: true } : {}),
    });

    if (!room) {
      return sendNotFound(res);
    }

    return res.status(200).json({
      success: true,
      message: "Room found",
      data: room,
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

    const room = await roomModel.findOne({ slug });

    if (room) {
      return sendConflict(res);
    }

    await roomModel.create({
      name,
      slug,
      image: imageUrl,
    });

    return sendCreated(res);
  } catch (error) {
    console.error(error);
    return sendServerError(res);
  }
};

export const updateStatus = async (req, res) => {
  try {
    const { id } = req.params;

    const room = await roomModel.findById(id);

    if (!room) {
      return sendNotFound(res);
    }

    await roomModel.findByIdAndUpdate(id, {
      $set: {
        status: !room.status,
      },
    });

    return sendSuccess(res, "Room status updated");
  } catch (error) {
    return sendServerError(res);
  }
};

export const edit = async (req, res) => {
  try {
    const imageUrl = req.file?.path || "";
    const { name, slug } = req.body;
    const { id } = req.params;

    const room = await roomModel.findById(id);

    if (!room) {
      return sendNotFound(res);
    }

    if (name) room.name = name;
    if (slug) room.slug = slug;
    if (imageUrl) room.image = imageUrl;

    await room.save();

    return sendSuccess(res, "Room updated successfully");
  } catch (error) {
    console.error(error);
    return sendServerError(res);
  }
};

export const deleteById = async (req, res) => {
  try {
    const { id } = req.params;

    const room = await roomModel.findById(id);

    if (!room) {
      return sendNotFound(res);
    }

    if (await ProductModel.exists({ roomType: id }))
      return sendConflict(res, "Reassign products before deleting this room");
    await roomModel.findByIdAndDelete(id);

    return sendSuccess(res, "Room deleted successfully");
  } catch (error) {
    console.error(error);
    return sendServerError(res);
  }
};
