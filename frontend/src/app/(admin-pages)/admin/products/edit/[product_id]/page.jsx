import AddProduct from "../../add/page";
export default async function Page({ params }) {
  const { product_id } = await params;
  return <AddProduct productId={product_id} />;
}
