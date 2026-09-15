import { randomBytes, scrypt, timingSafeEqual, createHmac } from "node:crypto";
import { promisify } from "node:util";
import Cryptr from "cryptr";
import { fail } from "./validation.js";

const derive = promisify(scrypt);
export function validatePassword(password) {
  if (
    typeof password !== "string" ||
    password.length < 10 ||
    password.length > 128
  )
    fail(400, "Password must contain 10–128 characters");
  return password;
}
export async function hashPassword(password) {
  // Callers validate new passwords; legacy logins may have shorter passwords.
  const salt = randomBytes(16).toString("hex");
  const key = await derive(password, salt, 64, {
    N: 131072,
    r: 8,
    p: 1,
    maxmem: 256 * 1024 * 1024,
  });
  return `scrypt$${salt}$${key.toString("hex")}`;
}
export async function verifyPassword(password, stored) {
  if (typeof password !== "string" || password.length > 128 || !stored)
    return false;
  if (!stored.startsWith("scrypt$")) {
    // Compatibility only: successful legacy logins are migrated to scrypt.
    try {
      return (
        new Cryptr(process.env.CRYPTR_SECRET_KEY).decrypt(stored) === password
      );
    } catch {
      return false;
    }
  }
  const [, salt, hex] = stored.split("$");
  if (!salt || !/^[a-f0-9]{128}$/.test(hex || "")) return false;
  const key = await derive(password, salt, 64, {
    N: 131072,
    r: 8,
    p: 1,
    maxmem: 256 * 1024 * 1024,
  });
  return timingSafeEqual(key, Buffer.from(hex, "hex"));
}
export const tokenHash = (token) =>
  createHmac(
    "sha256",
    process.env.OTP_SECRET ||
      process.env.JWT_SECRET ||
      process.env.CRYPTR_SECRET_KEY,
  )
    .update(String(token))
    .digest("hex");
export function safeEqual(a, b) {
  if (typeof a !== "string" || typeof b !== "string") return false;
  const left = Buffer.from(a);
  const right = Buffer.from(b);
  return left.length === right.length && timingSafeEqual(left, right);
}
