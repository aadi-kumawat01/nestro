import express from "express";
import * as user from "../controllers/user.controller.js";
import { protect } from "../middleware/auth.js";
import { limitRequests } from "../middleware/limits.js";
const router = express.Router();
router.post(
  "/account-exists",
  limitRequests("account-exists", 12),
  user.accountExists,
);
router.post("/register", limitRequests("register", 8), user.register);
router.post("/login", limitRequests("login", 20), user.login);
router.post("/verify-otp", limitRequests("otp", 20), user.otpVerify);
router.post("/resend-otp", limitRequests("resend", 5), user.resendOtp);
router.post(
  "/forgot-password",
  limitRequests("forgot", 5),
  user.forgotPassword,
);
router.post("/reset-password", limitRequests("reset", 10), user.resetPassword);
router.post(
  "/verify-email",
  limitRequests("email-change", 10),
  user.verifyEmailChange,
);
router.use(protect);
router.get("/get-me", user.getMe);
router.get("/summary", user.summary);
router.put("/update-profile", user.updateProfile);
router.put("/preferences", user.preferences);
router.post("/address", user.addAddress);
router.put("/address/:addressId", user.updateAddress);
router.delete("/address/:addressId", user.deleteAddress);
router.patch("/address/:addressId/default", user.setDefaultAddress);
router.post("/logout", user.logout);
router.put(
  "/change-password",
  limitRequests("password-change", 10),
  user.changePassword,
);
export default router;
