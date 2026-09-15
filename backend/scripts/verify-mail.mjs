import "dotenv/config";
import nodemailer from "nodemailer";

const { EMAIL_USER, EMAIL_PASS, SMTP_HOST, SMTP_PORT, SMTP_SECURE } =
  process.env;

if (!EMAIL_USER || !EMAIL_PASS) {
  throw new Error("EMAIL_USER and EMAIL_PASS are required");
}

const transport = nodemailer.createTransport({
  ...(SMTP_HOST
    ? {
        host: SMTP_HOST,
        port: Number(SMTP_PORT || 587),
        secure: SMTP_SECURE === "true",
      }
    : { service: "gmail" }),
  auth: { user: EMAIL_USER, pass: EMAIL_PASS },
  connectionTimeout: 10000,
  socketTimeout: 20000,
});

await transport.verify();
console.log("SMTP connection and authentication succeeded.");
