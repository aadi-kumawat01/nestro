import express from "express";
import {
  read,
  readById,
  create,
  updateStatus,
  edit,
  deleteById,
} from "../controllers/category.controller.js";
import upload from "../middleware/upload.js";
import { protect, authorized } from "../middleware/auth.js";
const router = express.Router();

router.get(
  "/admin",
  protect,
  authorized("admin", "superAdmin"),
  (req, res, next) => {
    req.adminCatalog = true;
    next();
  },
  read,
);
router.get(
  "/admin/:id",
  protect,
  authorized("admin", "superAdmin"),
  (req, res, next) => {
    req.adminCatalog = true;
    next();
  },
  readById,
);
router.get("/", read);
router.get("/:id", readById);
router.post(
  "/create",
  protect,
  authorized("admin", "superAdmin"),
  upload.single("image"),
  create,
);
router.patch(
  "/status-update/:id",
  protect,
  authorized("admin", "superAdmin"),
  updateStatus,
);
router.put(
  "/edit/:id",
  protect,
  authorized("admin", "superAdmin"),

  (req, res, next) => {
    upload.single("image")(req, res, (error) => {
      if (error) {
        console.error("CATEGORY IMAGE MIDDLEWARE ERROR:", error);

        return res.status(500).json({
          success: false,
          message: error.message || "Category image upload failed",
        });
      }

      next();
    });
  },

  edit,
);
router.delete(
  "/delete/:id",
  protect,
  authorized("admin", "superAdmin"),
  deleteById,
);

export default router;
