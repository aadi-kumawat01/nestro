import nodemailer from "nodemailer";
import { Outbox } from "../models/commerce.model.js";

function transporter() {
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS)
    throw new Error("Email delivery is not configured");
  return nodemailer.createTransport({
    ...(process.env.SMTP_HOST
      ? {
          host: process.env.SMTP_HOST,
          port: Number(process.env.SMTP_PORT || 587),
          secure: process.env.SMTP_SECURE === "true",
        }
      : { service: "gmail" }),
    auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS },
    connectionTimeout: 10000,
    socketTimeout: 20000,
  });
}
export async function sendMail(to, subject, message) {
  return transporter().sendMail({
    from: process.env.EMAIL_FROM || `Nestro <${process.env.EMAIL_USER}>`,
    to,
    subject,
    text: message,
  });
}
export async function queueMail(key, to, subject, message, session) {
  await Outbox.updateOne(
    { key },
    { $setOnInsert: { to, subject, text: message } },
    { upsert: true, session },
  );
}
export async function deliverOutbox() {
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) return;
  for (let i = 0; i < 10; i++) {
    const job = await Outbox.findOneAndUpdate(
      {
        sentAt: null,
        attempts: { $lt: 8 },
        nextAttempt: { $lte: new Date() },
        $or: [{ lockedUntil: null }, { lockedUntil: { $lt: new Date() } }],
      },
      {
        $set: { lockedUntil: new Date(Date.now() + 120000) },
        $inc: { attempts: 1 },
      },
      { new: true },
    );
    if (!job) break;
    try {
      await sendMail(job.to, job.subject, job.text);
      await Outbox.updateOne(
        { _id: job._id },
        { $set: { sentAt: new Date(), error: "" }, $unset: { lockedUntil: 1 } },
      );
    } catch {
      await Outbox.updateOne(
        { _id: job._id },
        {
          $set: {
            error: "Email delivery failed; check SMTP configuration",
            nextAttempt: new Date(
              Date.now() + Math.min(3600000, 60000 * 2 ** job.attempts),
            ),
          },
          $unset: { lockedUntil: 1 },
        },
      );
    }
  }
}
