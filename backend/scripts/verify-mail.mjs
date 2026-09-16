import "dotenv/config";

const { BREVO_API_KEY, BREVO_SENDER_EMAIL } = process.env;

if (!BREVO_API_KEY || !BREVO_SENDER_EMAIL) {
  throw new Error("BREVO_API_KEY and BREVO_SENDER_EMAIL are required");
}

const response = await fetch("https://api.brevo.com/v3/account", {
  headers: { "api-key": BREVO_API_KEY },
  signal: AbortSignal.timeout(20000),
});

if (!response.ok)
  throw new Error(`Brevo API authentication failed (HTTP ${response.status})`);
console.log("Brevo API authentication succeeded. Sender must be verified in Brevo.");
