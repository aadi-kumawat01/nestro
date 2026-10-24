const url = process.env.PING_URL;

if (!url || !/^https?:\/\//.test(url)) {
  console.error("PING_URL environment variable missing or invalid.");
  process.exit(2);
}

async function ping() {
  try {
    const response = await fetch(url, {
      headers: { "User-Agent": "SiteKeepAlive/1.0" },
      signal: AbortSignal.timeout(30_000),
    });

    console.log(`Ping successful: HTTP ${response.status}`);
    process.exit(response.ok ? 0 : 1);
  } catch (error) {
    console.error("Ping failed:", error.message);
    process.exit(1);
  }
}

ping();