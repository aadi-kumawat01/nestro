import axios from "axios";
import {
  isRetryableNetworkError,
  isRetryableStatus,
  waitBeforeRetry,
} from "@/utils/retry";

const client = axios.create({
  baseURL:
    typeof window === "undefined"
      ? process.env.API_BASE_URL ||
        process.env.NEXT_PUBLIC_API_BASE_URL ||
        "http://localhost:5000/api"
      : "/api",
  timeout: 15000,
  withCredentials: true,
});

client.interceptors.response.use(undefined, async (error) => {
  const config = error.config;
  const method = config?.method?.toUpperCase();
  const retryCount = config?._transientRetryCount || 0;
  const retryable =
    isRetryableStatus(error.response?.status) || isRetryableNetworkError(error);

  if (method !== "GET" || !retryable || retryCount >= 2) {
    return Promise.reject(error);
  }

  config._transientRetryCount = retryCount + 1;
  await waitBeforeRetry(retryCount);
  return client(config);
});

function generateSlug(text) {
  return text
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

export { client, generateSlug };
