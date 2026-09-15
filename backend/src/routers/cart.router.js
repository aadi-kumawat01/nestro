import express from "express";
import { read, sync, updateItem } from "../controllers/cart.controller.js";
import { protect } from "../middleware/auth.js";
const router = express.Router();
router.use(protect);
router.get("/", read);
router.post("/sync", sync);
router.put("/items/:id", updateItem);
export default router;
