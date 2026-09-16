import { Outbox } from "../models/commerce.model.js";

export async function sendMail(to, subject, message) {
  const { BREVO_API_KEY, BREVO_SENDER_EMAIL, BREVO_SENDER_NAME } = process.env;
  if (!BREVO_API_KEY || !BREVO_SENDER_EMAIL)
    throw new Error("Email delivery is not configured");
  const response = await fetch("https://api.brevo.com/v3/smtp/email", {
    method: "POST",
    headers: {
      "api-key": BREVO_API_KEY,
      "content-type": "application/json",
      accept: "application/json",
    },
    body: JSON.stringify({
      sender: { email: BREVO_SENDER_EMAIL, name: BREVO_SENDER_NAME || "Nestro" },
      to: [{ email: to }],
      subject,
      textContent: message,
    }),
    signal: AbortSignal.timeout(20000),
  });
  if (!response.ok)
    throw new Error(`Brevo email delivery failed (HTTP ${response.status})`);
  return response.json();
}
export async function queueMail(key, to, subject, message, session) {
  await Outbox.updateOne(
    { key },
    { $setOnInsert: { to, subject, text: message } },
    { upsert: true, session },
  );
}
export async function deliverOutbox() {
  if (!process.env.BREVO_API_KEY || !process.env.BREVO_SENDER_EMAIL) return;
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
            error: "Email delivery failed; check Brevo configuration",
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
