import express from "express";
import * as order from "../controllers/order.controller.js";
import { authorized, protect } from "../middleware/auth.js";
import { limitRequests } from "../middleware/limits.js";
const router = express.Router();
router.use(protect);
router.get(
  "/admin",
  authorized("admin", "superAdmin"),
  (req, res, next) => {
    req.isAdminList = true;
    next();
  },
  order.read,
);
router.get("/", order.read);
router.post("/quote", order.quote);
router.post("/place", limitRequests("order", 30), order.orderPlace);
router.post(
  "/verify-payment",
  limitRequests("verify-payment", 60),
  order.verifyPayment,
);
router.get("/:id", order.detail);
router.post("/:id/cancel", order.cancel);
router.post("/:id/return", order.returnOrder);
router.patch(
  "/:id/status",
  authorized("admin", "superAdmin"),
  order.updateStatus,
);
router.post("/:id/refund", authorized("admin", "superAdmin"), order.refund);
router.post(
  "/:id/refund/reconcile",
  authorized("admin", "superAdmin"),
  order.refundStatus,
);
router.post(
  "/:id/refund/manual",
  authorized("admin", "superAdmin"),
  order.manualRefund,
);
export default router;
