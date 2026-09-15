import express from "express";
import * as controller from "../controllers/commerce.controller.js";
import { protect, authorized } from "../middleware/auth.js";
import { limitRequests } from "../middleware/limits.js";
const router = express.Router();
router.get("/settings", controller.publicSettings);
router.get("/delivery", controller.delivery);
router.get("/reviews", controller.reviews);
router.get("/reviews/product/:id", controller.reviews);
router.post("/contact", limitRequests("contact", 5), controller.contact);
router.post(
  "/newsletter",
  limitRequests("newsletter", 5),
  controller.subscribe,
);
router.post(
  "/newsletter/confirm",
  limitRequests("newsletter-confirm", 10),
  controller.confirmSubscription,
);
router.post(
  "/newsletter/unsubscribe",
  limitRequests("newsletter-unsubscribe", 10),
  controller.unsubscribe,
);
router.use(protect);
router.get("/wishlist", controller.wishlist);
router.put("/wishlist/:id", controller.saveWishlist);
router.delete("/wishlist/:id", controller.removeWishlist);
router.post(
  "/reviews/product/:id",
  limitRequests("review", 10),
  controller.createReview,
);
router.use("/admin", authorized("admin", "superAdmin"));
router.get("/admin/dashboard", controller.dashboard);
router.get("/admin/settings", controller.adminSettings);
router.put("/admin/settings", controller.updateSettings);
router.get("/admin/coupons", controller.coupons);
router.put("/admin/coupons", controller.saveCoupon);
router.get(
  "/admin/reviews",
  (req, res, next) => {
    req.adminReviews = true;
    next();
  },
  controller.reviews,
);
router.patch("/admin/reviews/:id", controller.moderateReview);
router.get("/admin/support", controller.supportList);
router.post("/admin/support/:id/reply", controller.supportReply);
router.get("/admin/users", controller.users);
router.patch("/admin/users/:id", controller.updateUser);
export default router;
