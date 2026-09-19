const RETRYABLE_STATUS_CODES = new Set([408, 425, 502, 503, 504]);
const RETRY_DELAYS_MS = [1200, 3000];

export function isRetryableStatus(status) {
  return RETRYABLE_STATUS_CODES.has(status);
}

export function isRetryableNetworkError(error) {
  return (
    !error?.response &&
    ["ECONNABORTED", "ECONNRESET", "ERR_NETWORK", "ETIMEDOUT"].includes(
      error?.code,
    )
  );
}

export function waitBeforeRetry(attempt) {
  const delay = RETRY_DELAYS_MS[Math.min(attempt, RETRY_DELAYS_MS.length - 1)];
  return new Promise((resolve) => setTimeout(resolve, delay));
}

export async function fetchWithRetry(input, init = {}) {
  const method = (init.method || "GET").toUpperCase();

  if (method !== "GET") {
    return fetch(input, init);
  }

  for (let attempt = 0; attempt <= RETRY_DELAYS_MS.length; attempt += 1) {
    try {
      const response = await fetch(input, init);

      if (
        !isRetryableStatus(response.status) ||
        attempt === RETRY_DELAYS_MS.length
      ) {
        return response;
      }
    } catch (error) {
      if (attempt === RETRY_DELAYS_MS.length) {
        throw error;
      }
    }

    await waitBeforeRetry(attempt);
  }

  throw new Error("Unable to reach the API");
}
