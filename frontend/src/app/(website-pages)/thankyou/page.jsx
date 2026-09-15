import { redirect } from "next/navigation";
export default async function Page({ searchParams }) {
  const { orderId } = await searchParams;
  redirect(
    /^[a-f0-9]{24}$/i.test(orderId || "") ? "/orders/" + orderId : "/orders",
  );
}
