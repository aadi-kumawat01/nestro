import "server-only";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
export async function serverApi(path) {
  const jar = await cookies();
  if (!jar.get("token")) redirect("/sign-in");
  const api = (
    process.env.API_BASE_URL ||
    process.env.NEXT_PUBLIC_API_BASE_URL ||
    "http://localhost:5000/api"
  ).replace(/\/$/, "");
  const response = await fetch(`${api}/${path}`, {
    cache: "no-store",
    headers: { Cookie: jar.toString() },
  });
  if (response.status === 401) redirect("/sign-in");
  if (!response.ok) throw new Error("Unable to load data");
  return response.json();
}
export async function requireAdmin() {
  const result = await serverApi("user/get-me");
  if (!["admin", "superAdmin"].includes(result.user?.role)) redirect("/");
  return result.user;
}
