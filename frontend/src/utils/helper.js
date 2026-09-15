import axios from "axios";

const client = axios.create({
  baseURL:
    typeof window === "undefined"
      ? process.env.API_BASE_URL ||
        process.env.NEXT_PUBLIC_API_BASE_URL ||
        "http://localhost:5000/api"
      : "/api",
  timeout: 10000,
  withCredentials: true,
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
