import mongoose from "mongoose";

class HttpError extends Error {
  constructor(status, message) {
    super(message);
    this.status = status;
  }
}
export const fail = (status, message) => {
  throw new HttpError(status, message);
};
export const asyncRoute = (fn) => (req, res, next) =>
  Promise.resolve(fn(req, res, next)).catch(next);
export function text(value, name, max = 200, required = true) {
  if (
    typeof value !== "string" ||
    (!value.trim() && required) ||
    value.length > max
  )
    fail(400, `Invalid ${name}`);
  return value.trim();
}
export function email(value) {
  const result = text(value, "email", 254).toLowerCase();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(result))
    fail(400, "Enter a valid email address");
  return result;
}
export function objectId(value, name = "ID") {
  if (typeof value !== "string" || !mongoose.isObjectIdOrHexString(value))
    fail(400, `Invalid ${name}`);
  return value.toLowerCase();
}
export function integer(value, name, min = 1, max = 99) {
  const n =
    typeof value === "number" || typeof value === "string"
      ? Number(value)
      : NaN;
  if (!Number.isSafeInteger(n) || n < min || n > max)
    fail(400, `Invalid ${name} (${min}–${max})`);
  return n;
}
export function money(value, name = "price", min = 0) {
  const n =
    typeof value === "number" || typeof value === "string"
      ? Number(value)
      : NaN;
  if (!Number.isFinite(n) || n < min || n > 10000000)
    fail(400, `Invalid ${name}`);
  return Math.round(n * 100) / 100;
}
export function priceOf(product) {
  const price = money(product.price);
  return product.salePrice > 0 && product.salePrice < price
    ? money(product.salePrice)
    : price;
}
export function addressOf(value) {
  if (!value || typeof value !== "object" || Array.isArray(value))
    fail(400, "Delivery address is required");
  const result = {};
  for (const field of [
    "fullName",
    "mobile",
    "pincode",
    "addressLine",
    "city",
    "state",
  ])
    result[field] = text(
      value[field],
      field,
      field === "addressLine" ? 500 : 100,
    );
  result.mobile = result.mobile
    .replace(/\D/g, "")
    .replace(/^91(?=\d{10}$)/, "");
  if (
    !/^[6-9]\d{9}$/.test(result.mobile) ||
    !/^[1-9]\d{5}$/.test(result.pincode)
  )
    fail(400, "Enter a valid Indian mobile number and pincode");
  result.country = text(value.country || "India", "country", 50);
  if (result.country.toLowerCase() !== "india")
    fail(400, "Delivery is currently available in India only");
  return result;
}
export function pageOf(query) {
  const page = integer(query.page || 1, "page", 1, 100000);
  const limit = integer(query.limit || 15, "limit", 1, 100);
  return { page, limit, skip: (page - 1) * limit };
}
export const escapeRegex = (value) =>
  value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
