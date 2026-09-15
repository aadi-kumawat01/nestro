import Link from "next/link";
export default function Page() {
  return (
    <main className="p-8">
      <h1 className="text-2xl mb-4">Product colours</h1>
      <p>
        Set a colour on each product. Give related products the same variant
        group to show colour choices on their product pages. Each variant keeps
        its own price and stock.
      </p>
      <Link className="underline block mt-5" href="/admin/products">
        Manage products
      </Link>
    </main>
  );
}
