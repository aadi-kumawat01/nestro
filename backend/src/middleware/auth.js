import jwt from "jsonwebtoken";
import UserModel from "../models/user.model.js";
import { asyncRoute, fail } from "../utils/validation.js";

const jwtSecret = () => process.env.JWT_SECRET || process.env.CRYPTR_SECRET_KEY;
export const cookieOptions = () => ({
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: process.env.COOKIE_SAME_SITE || "strict",
  path: "/",
});
export function signIn(res, user) {
  const token = jwt.sign(
    { id: String(user._id), version: user.tokenVersion || 0 },
    jwtSecret(),
    { expiresIn: "7d", algorithm: "HS256" },
  );
  res.cookie("token", token, { ...cookieOptions(), maxAge: 7 * 86400000 });
}
export const protect = asyncRoute(async (req, res, next) => {
  const bearer = req.headers.authorization?.startsWith("Bearer ")
    ? req.headers.authorization.slice(7)
    : null;
  const token = bearer || req.cookies?.token;
  if (!token) fail(401, "Please sign in to continue");
  let decoded;
  try {
    decoded = jwt.verify(token, jwtSecret(), { algorithms: ["HS256"] });
  } catch {
    fail(401, "Session expired. Please sign in again");
  }
  const user = await UserModel.findById(decoded.id).select(
    "-password -resetTokenHash -emailChangeHash",
  );
  if (
    !user ||
    !user.status ||
    !user.isVerified ||
    (decoded.version || 0) !== (user.tokenVersion || 0)
  )
    fail(401, "Session is no longer valid");
  req.user = user;
  next();
});
export const authorized =
  (...roles) =>
  (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role))
      return res
        .status(403)
        .json({ success: false, message: "Admin access required" });
    next();
  };
