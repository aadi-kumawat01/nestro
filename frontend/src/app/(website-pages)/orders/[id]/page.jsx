import { OrderDetail } from "@/components/website/orders/Orders";
export default async function Page({ params }) {
  const { id } = await params;
  return <OrderDetail id={id} />;
}
