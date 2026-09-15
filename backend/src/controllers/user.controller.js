import { randomInt, randomBytes } from "node:crypto";
import UserModel from "../models/user.model.js";
import PendingUserModel from "../models/pendingUser.model.js";
import { Wishlist, Review } from "../models/commerce.model.js";
import OrderModel from "../models/order.model.js";
import {
  asyncRoute,
  fail,
  text,
  email,
  addressOf,
} from "../utils/validation.js";
import {
  hashPassword,
  verifyPassword,
  validatePassword,
  tokenHash,
  safeEqual,
} from "../utils/password.js";
import { sendMail } from "../utils/mail.js";
import { signIn, cookieOptions } from "../middleware/auth.js";

const publicUser = (user) => ({
  _id: user._id,
  name: user.name,
  email: user.email,
  mobile: user.mobile,
  role: user.role,
  isVerified: user.isVerified,
  addresses: user.addresses || [],
  preferences: user.preferences,
  pendingEmail: user.pendingEmail,
});
const otp = () => String(randomInt(100000, 1000000));
const origin = () =>
  (process.env.FRONTEND_URL || "http://localhost:3000").replace(/\/$/, "");

export const accountExists = asyncRoute(async (req, res) => {
  const normalizedEmail = email(req.body.email);
  const exists = Boolean(await UserModel.exists({ email: normalizedEmail }));
  res.json({ success: true, exists });
});

export const register = asyncRoute(async (req, res) => {
  const name = text(req.body.name, "name", 100);
  const normalizedEmail = email(req.body.email);
  validatePassword(req.body.password);
  const mobile = text(req.body.mobile || "", "mobile", 30, false);
  if (await UserModel.exists({ email: normalizedEmail }))
    return res.status(409).json({
      success: false,
      code: "ACCOUNT_EXISTS",
      message:
        "An account already exists with this email. Sign in or reset your password.",
    });
  const existing = await PendingUserModel.findOne({ email: normalizedEmail });
  if (existing?.otpSentAt > new Date(Date.now() - 60000))
    fail(429, "Wait one minute before requesting another OTP");
  const code = otp();
  await PendingUserModel.findOneAndUpdate(
    { email: normalizedEmail },
    {
      $set: {
        name,
        email: normalizedEmail,
        mobile,
        marketingEmail: req.body.marketingEmail === true,
        password: await hashPassword(req.body.password),
        otp: tokenHash(code),
        otpExpire: new Date(Date.now() + 600000),
        otpAttempts: 0,
        otpSentAt: new Date(),
      },
    },
    { upsert: true, runValidators: true },
  );
  await sendMail(
    normalizedEmail,
    "Verify your Nestro account",
    `Your verification code is ${code}. It expires in 10 minutes. Do not share it.`,
  );
  res.status(201).json({
    success: true,
    message:
      "If this email can be registered, a verification code has been sent.",
  });
});
export const resendOtp = asyncRoute(async (req, res) => {
  const normalizedEmail = email(req.body.email);
  const pending = await PendingUserModel.findOne({ email: normalizedEmail });
  if (!pending)
    return res.status(202).json({
      success: true,
      message: "If registration is pending, a verification code has been sent.",
    });
  const code = otp();
  const result = await PendingUserModel.updateOne(
    { _id: pending._id, otpSentAt: { $lte: new Date(Date.now() - 60000) } },
    {
      $set: {
        otp: tokenHash(code),
        otpExpire: new Date(Date.now() + 600000),
        otpAttempts: 0,
        otpSentAt: new Date(),
      },
    },
  );
  if (!result.modifiedCount)
    fail(429, "Wait one minute before requesting another OTP");
  await sendMail(
    normalizedEmail,
    "Your Nestro verification code",
    `Your code is ${code}. It expires in 10 minutes.`,
  );
  res.json({
    success: true,
    message: "If registration is pending, a verification code has been sent.",
  });
});
export const otpVerify = asyncRoute(async (req, res) => {
  const normalizedEmail = email(req.body.email);
  const code = text(req.body.otp, "OTP", 6);
  const pending = await PendingUserModel.findOneAndUpdate(
    {
      email: normalizedEmail,
      otpExpire: { $gt: new Date() },
      otpAttempts: { $lt: 5 },
    },
    { $inc: { otpAttempts: 1 } },
    { new: true },
  );
  if (!pending || !safeEqual(pending.otp, tokenHash(code)))
    fail(400, "Invalid or expired code. After 5 attempts, request a new code.");
  await UserModel.create({
    name: pending.name,
    email: pending.email,
    password: pending.password,
    mobile: pending.mobile,
    preferences: { marketingEmail: pending.marketingEmail === true },
    isVerified: true,
  });
  await PendingUserModel.deleteOne({ _id: pending._id });
  res.json({ success: true, message: "Email verified. You can now sign in." });
});
export const login = asyncRoute(async (req, res) => {
  const user = await UserModel.findOne({ email: email(req.body.email) });
  if (!user || !(await verifyPassword(req.body.password, user.password)))
    fail(401, "Invalid email or password");
  if (!user.status || !user.isVerified)
    fail(403, "This account is not active or verified");
  if (!user.password.startsWith("scrypt$")) {
    user.password = await hashPassword(req.body.password);
    await user.save();
  }
  signIn(res, user);
  res.json({ success: true, message: "Signed in", user: publicUser(user) });
});
export const logout = asyncRoute(async (req, res) => {
  await UserModel.updateOne(
    { _id: req.user._id },
    { $inc: { tokenVersion: 1 } },
  );
  res
    .clearCookie("token", cookieOptions())
    .json({ success: true, message: "Signed out" });
});
export const getMe = asyncRoute(async (req, res) => {
  res.json({ success: true, user: publicUser(req.user) });
});
export const summary = asyncRoute(async (req, res) => {
  const [orders, spend, wishlist, reviews] = await Promise.all([
    OrderModel.countDocuments({ user: req.user._id }),
    OrderModel.aggregate([
      {
        $match: {
          user: req.user._id,
          paymentStatus: "paid",
          orderStatus: { $nin: ["cancelled", "returned"] },
        },
      },
      { $group: { _id: null, total: { $sum: "$totalAmount" } } },
    ]),
    Wishlist.countDocuments({ user: req.user._id }),
    Review.countDocuments({ user: req.user._id }),
  ]);
  res.json({
    success: true,
    data: { orders, spent: spend[0]?.total || 0, wishlist, reviews },
  });
});
export const updateProfile = asyncRoute(async (req, res) => {
  const user = await UserModel.findById(req.user._id);
  user.name = text(req.body.name, "name", 100);
  user.mobile = text(req.body.mobile, "mobile", 30);
  const nextEmail = email(req.body.email);
  let message = "Profile updated";
  if (nextEmail !== user.email) {
    if (await UserModel.exists({ email: nextEmail }))
      fail(409, "Email is already in use");
    const token = randomBytes(32).toString("hex");
    user.pendingEmail = nextEmail;
    user.emailChangeHash = tokenHash(token);
    user.emailChangeExpiresAt = new Date(Date.now() + 1800000);
    await sendMail(
      nextEmail,
      "Confirm your Nestro email change",
      `Confirm your new email: ${origin()}/verify-email?token=${token}`,
    );
    message =
      "Profile saved. Verify the link sent to your new email to change it.";
  }
  await user.save();
  res.json({ success: true, message, user: publicUser(user) });
});
export const verifyEmailChange = asyncRoute(async (req, res) => {
  const token = text(req.body.token, "token", 128);
  const user = await UserModel.findOne({
    emailChangeHash: tokenHash(token),
    emailChangeExpiresAt: { $gt: new Date() },
  });
  if (!user || !user.pendingEmail)
    fail(400, "Invalid or expired verification link");
  user.email = user.pendingEmail;
  user.pendingEmail = undefined;
  user.emailChangeHash = undefined;
  user.emailChangeExpiresAt = undefined;
  user.tokenVersion = (user.tokenVersion || 0) + 1;
  await user.save();
  res
    .clearCookie("token", cookieOptions())
    .json({ success: true, message: "Email changed. Please sign in again." });
});
export const forgotPassword = asyncRoute(async (req, res) => {
  const user = await UserModel.findOne({
    email: email(req.body.email),
    status: true,
  });
  if (user) {
    const token = randomBytes(32).toString("hex");
    user.resetTokenHash = tokenHash(token);
    user.resetExpiresAt = new Date(Date.now() + 1800000);
    await user.save();
    await sendMail(
      user.email,
      "Reset your Nestro password",
      `Reset your password: ${origin()}/reset-password?token=${token}\nThis link expires in 30 minutes.`,
    );
  }
  res.json({
    success: true,
    message: "If that account exists, a reset link has been sent.",
  });
});
export const resetPassword = asyncRoute(async (req, res) => {
  const token = text(req.body.token, "token", 128);
  validatePassword(req.body.password);
  const password = await hashPassword(req.body.password);
  const user = await UserModel.findOneAndUpdate(
    {
      resetTokenHash: tokenHash(token),
      resetExpiresAt: { $gt: new Date() },
      status: true,
    },
    {
      $set: { password },
      $inc: { tokenVersion: 1 },
      $unset: { resetTokenHash: 1, resetExpiresAt: 1 },
    },
  );
  if (!user) fail(400, "Invalid or expired reset link");
  res
    .clearCookie("token", cookieOptions())
    .json({ success: true, message: "Password reset. Please sign in." });
});
export const changePassword = asyncRoute(async (req, res) => {
  const user = await UserModel.findById(req.user._id);
  if (!(await verifyPassword(req.body.currentPassword, user.password)))
    fail(400, "Current password is incorrect");
  if (req.body.newPassword !== req.body.confirmPassword)
    fail(400, "Passwords do not match");
  validatePassword(req.body.newPassword);
  user.password = await hashPassword(req.body.newPassword);
  user.tokenVersion = (user.tokenVersion || 0) + 1;
  await user.save();
  signIn(res, user);
  res.json({
    success: true,
    message: "Password changed; other sessions have been signed out",
  });
});
export const preferences = asyncRoute(async (req, res) => {
  if (typeof req.body.marketingEmail !== "boolean")
    fail(400, "Invalid preference");
  await UserModel.updateOne(
    { _id: req.user._id },
    { $set: { "preferences.marketingEmail": req.body.marketingEmail } },
  );
  res.json({ success: true, message: "Preferences saved" });
});
export const addAddress = asyncRoute(async (req, res) => {
  const user = await UserModel.findById(req.user._id);
  if (user.addresses.length >= 20) fail(400, "You can save up to 20 addresses");
  const address = addressOf(req.body);
  const isDefault = req.body.isDefault === true || !user.addresses.length;
  if (isDefault)
    user.addresses.forEach((item) => {
      item.isDefault = false;
    });
  user.addresses.push({ ...address, isDefault });
  await user.save();
  res.json({
    success: true,
    message: "Address added",
    addresses: user.addresses,
  });
});
export const updateAddress = asyncRoute(async (req, res) => {
  const user = await UserModel.findById(req.user._id);
  const address = user.addresses.id(req.params.addressId);
  if (!address) fail(404, "Address not found");
  if (req.body.isDefault === true)
    user.addresses.forEach((item) => {
      item.isDefault = false;
    });
  Object.assign(address, addressOf(req.body));
  if (req.body.isDefault === true) address.isDefault = true;
  await user.save();
  res.json({
    success: true,
    message: "Address updated",
    addresses: user.addresses,
  });
});
export const deleteAddress = asyncRoute(async (req, res) => {
  const user = await UserModel.findById(req.user._id);
  const address = user.addresses.id(req.params.addressId);
  if (!address) fail(404, "Address not found");
  const wasDefault = address.isDefault;
  address.deleteOne();
  if (wasDefault && user.addresses.length) user.addresses[0].isDefault = true;
  await user.save();
  res.json({
    success: true,
    message: "Address removed",
    addresses: user.addresses,
  });
});
export const setDefaultAddress = asyncRoute(async (req, res) => {
  const user = await UserModel.findById(req.user._id);
  const address = user.addresses.id(req.params.addressId);
  if (!address) fail(404, "Address not found");
  user.addresses.forEach((item) => {
    item.isDefault = String(item._id) === String(address._id);
  });
  await user.save();
  res.json({
    success: true,
    message: "Default address updated",
    addresses: user.addresses,
  });
});
