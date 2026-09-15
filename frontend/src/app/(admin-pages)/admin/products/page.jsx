/* eslint-disable @next/next/no-img-element -- Admin thumbnails should accept legacy image hosts. */
import Link from "next/link";
import {
  PackagePlus,
  Search,
  Boxes,
  AlertTriangle,
  Pencil,
  Images,
  PackageCheck,
  Star,
  RotateCcw,
  ChevronLeft,
  ChevronRight,
  Tag,
} from "lucide-react";

import { serverApi } from "@/api/server";
import StatusBadge from "@/components/admin/category/StatusBadge";
import DeleteButton from "@/components/admin/category/DeleteButton";

const money = (value) => `₹${Number(value || 0).toLocaleString("en-IN")}`;

export default async function ProductsPage({ searchParams }) {
  const query = await searchParams;

  const page = Math.max(1, Number(query.page) || 1);

  const params = new URLSearchParams({
    page: String(page),
    limit: "20",
  });

  if (query.search) {
    params.set("search", query.search);
  }

  if (query.status === "true" || query.status === "false") {
    params.set("status", query.status);
  }

  if (query.stock === "true" || query.stock === "false") {
    params.set("stock", query.stock);
  }

  const response = await serverApi(`product/admin?${params}`);

  if (!response.success) {
    throw new Error(response.message || "Unable to load products");
  }

  const products = response.data || [];

  const pages = Math.max(1, response.pages || 1);

  const totalProducts = Number(response.total ?? products.length);

  const activeProducts = products.filter((item) => item.status === true).length;

  const lowStock = products.filter(
    (item) => Number(item.stockQuantity) <= 5,
  ).length;

  const featuredProducts = products.filter(
    (item) => item.featured || item.bestSeller || item.newArrival,
  ).length;

  return (
    <main className="mx-auto w-full max-w-[1500px] space-y-6">
      <section className="rounded-3xl border border-[#e8ded0] bg-[#fffdfa] p-5 shadow-sm sm:p-7">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.24em] text-[#9a6a43]">
              Catalog Management
            </p>

            <h1 className="text-3xl font-semibold tracking-tight text-[#2b1b11] sm:text-4xl">
              Products
            </h1>

            <p className="mt-2 max-w-2xl text-sm leading-6 text-[#786454]">
              Manage your furniture catalog, pricing, stock, visibility and
              product media.
            </p>
          </div>

          <Link
            href="/admin/products/add"
            className="
              inline-flex
              min-h-11
              w-full
              cursor-pointer
              items-center
              justify-center
              gap-2
              rounded-xl
              bg-[#8b5e3c]
              px-5
              py-3
              text-sm
              font-semibold
              text-white
              transition
              hover:bg-[#70482e]
              sm:w-auto
            "
          >
            <PackagePlus size={18} />
            Add Product
          </Link>
        </div>
      </section>

      <section className="grid grid-cols-2 gap-3 xl:grid-cols-4">
        <Metric
          label="Total Products"
          value={totalProducts}
          icon={<Boxes size={19} />}
        />

        <Metric
          label="Published"
          value={activeProducts}
          icon={<PackageCheck size={19} />}
        />

        <Metric
          label="Low / No Stock"
          value={lowStock}
          icon={<AlertTriangle size={19} />}
          warning={lowStock > 0}
        />

        <Metric
          label="Featured"
          value={featuredProducts}
          icon={<Star size={19} />}
        />
      </section>

      <form
        method="get"
        className="
          rounded-2xl
          border
          border-[#e8ded0]
          bg-[#fffdfa]
          p-4
          shadow-sm
        "
      >
        <div className="grid gap-3 lg:grid-cols-[minmax(260px,1fr)_180px_180px_auto_auto]">
          <label className="relative">
            <span className="sr-only">Search products</span>

            <Search
              size={17}
              className="
                absolute
                left-4
                top-1/2
                -translate-y-1/2
                text-[#9c8775]
              "
            />

            <input
              name="search"
              defaultValue={query.search || ""}
              placeholder="Search by product name..."
              className="
                h-12
                w-full
                rounded-xl
                border
                border-[#d8c8b8]
                bg-white
                pl-11
                pr-4
                text-sm
                text-[#2b1b11]
                outline-none
                transition
                placeholder:text-[#aa998a]
                focus:border-[#8b5e3c]
                focus:ring-2
                focus:ring-[#8b5e3c]/10
              "
            />
          </label>

          <select
            name="status"
            defaultValue={query.status || ""}
            className="
              h-12
              cursor-pointer
              rounded-xl
              border
              border-[#d8c8b8]
              bg-white
              px-4
              text-sm
              text-[#5c4535]
              outline-none
              focus:border-[#8b5e3c]
            "
          >
            <option value="">All visibility</option>

            <option value="true">Published</option>

            <option value="false">Hidden</option>
          </select>

          <select
            name="stock"
            defaultValue={query.stock || ""}
            className="
              h-12
              cursor-pointer
              rounded-xl
              border
              border-[#d8c8b8]
              bg-white
              px-4
              text-sm
              text-[#5c4535]
              outline-none
              focus:border-[#8b5e3c]
            "
          >
            <option value="">All stock</option>

            <option value="true">In stock</option>

            <option value="false">Out of stock</option>
          </select>

          <button
            type="submit"
            className="
              h-12
              cursor-pointer
              rounded-xl
              bg-[#8b5e3c]
              px-6
              text-sm
              font-semibold
              text-white
              transition
              hover:bg-[#70482e]
            "
          >
            Apply
          </button>

          <Link
            href="/admin/products"
            className="
              flex
              h-12
              cursor-pointer
              items-center
              justify-center
              gap-2
              rounded-xl
              border
              border-[#d8c8b8]
              bg-white
              px-4
              text-sm
              font-medium
              text-[#786454]
              transition
              hover:bg-[#f3ede5]
              hover:text-[#8b5e3c]
            "
          >
            <RotateCcw size={16} />

            <span className="hidden xl:inline">Reset</span>
          </Link>
        </div>
      </form>

      <section className="overflow-hidden rounded-2xl border border-[#e8ded0] bg-[#fffdfa] shadow-sm">
        <div className="flex items-center justify-between gap-4 border-b border-[#e8ded0] px-5 py-4 sm:px-6">
          <div>
            <h2 className="text-[16px] font-semibold text-[#2b1b11]">
              Product Inventory
            </h2>

            <p className="mt-1 text-xs text-[#8f7a68]">
              Showing {products.length} products
            </p>
          </div>

          <div className="shrink-0 rounded-full bg-[#f3ede5] px-3 py-1.5 text-xs font-medium text-[#8b5e3c]">
            Page {page} of {pages}
          </div>
        </div>

        <div className="hidden min-[1800px]:block">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[1200px] table-fixed text-left">
              <thead className="bg-[#f7f2ec]">
                <tr className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[#786454]">
                  <th className="w-[28%] px-6 py-4">Product</th>

                  <th className="w-[14%] px-4 py-4">SKU</th>

                  <th className="w-[11%] px-4 py-4">Price</th>

                  <th className="w-[11%] px-4 py-4">Inventory</th>

                  <th className="w-[11%] px-4 py-4">Visibility</th>

                  <th className="w-[12%] px-4 py-4">Tags</th>

                  <th className="w-[13%] px-4 py-4 text-center">Actions</th>
                </tr>
              </thead>

              <tbody>
                {products.map((item) => (
                  <tr
                    key={item._id}
                    className="
                        group
                        border-t
                        border-[#eee5da]
                        transition
                        first:border-t-0
                        hover:bg-[#faf8f4]
                      "
                  >
                    <td className="px-6 py-4">
                      <div className="flex min-w-0 items-center gap-4">
                        <div className="h-16 w-16 shrink-0 overflow-hidden rounded-xl border border-[#e8ded0] bg-[#f3ede5]">
                          <img
                            src={item.thumbnail}
                            alt={item.title || "Product"}
                            className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
                          />
                        </div>

                        <div className="min-w-0">
                          <p className="truncate text-[14px] font-semibold text-[#2b1b11]">
                            {item.title}
                          </p>

                          <p className="mt-1 truncate text-xs text-[#8f7a68]">
                            {item.category?.name || "Uncategorised"}

                            {" · "}

                            {item.roomType?.name || "No room"}
                          </p>
                        </div>
                      </div>
                    </td>

                    <td className="px-4 py-4">
                      {item.sku ? (
                        <span className="block truncate text-[12px] font-medium text-[#5c4535]">
                          {item.sku}
                        </span>
                      ) : (
                        <span className="inline-flex rounded-full bg-red-50 px-2 py-1 text-[10px] font-semibold text-red-600">
                          Missing
                        </span>
                      )}
                    </td>

                    <td className="px-4 py-4">
                      <p className="whitespace-nowrap text-[14px] font-semibold text-[#2b1b11]">
                        {money(item.salePrice || item.price)}
                      </p>

                      {item.salePrice && item.salePrice < item.price && (
                        <p className="mt-1 whitespace-nowrap text-[11px] text-[#9b897b] line-through">
                          {money(item.price)}
                        </p>
                      )}
                    </td>

                    <td className="px-4 py-4">
                      <StockBadge quantity={item.stockQuantity} />
                    </td>

                    <td className="px-4 py-4">
                      <StatusBadge
                        status={item.status}
                        path={`product/status-update/${item._id}`}
                      />
                    </td>

                    <td className="px-4 py-4">
                      <ProductFlags item={item} />
                    </td>

                    <td className="px-4 py-4">
                      <div className="flex items-center justify-center gap-2">
                        <Link
                          href={`/admin/products/edit/${item._id}`}
                          title="Edit product"
                          className="
                              flex
                              h-9
                              w-9
                              shrink-0
                              cursor-pointer
                              items-center
                              justify-center
                              rounded-lg
                              border
                              border-[#d8c8b8]
                              bg-white
                              text-[#70482e]
                              transition
                              hover:border-[#8b5e3c]
                              hover:bg-[#f3ede5]
                            "
                        >
                          <Pencil size={15} />
                        </Link>

                        <Link
                          href={`/admin/products/add-images/${item._id}`}
                          title="Manage product images"
                          className="
                              flex
                              h-9
                              w-9
                              shrink-0
                              cursor-pointer
                              items-center
                              justify-center
                              rounded-lg
                              border
                              border-[#d8c8b8]
                              bg-white
                              text-[#70482e]
                              transition
                              hover:border-[#8b5e3c]
                              hover:bg-[#f3ede5]
                            "
                        >
                          <Images size={15} />
                        </Link>

                        <div
                          title="Archive product"
                          className="
                              flex
                              h-9
                              w-9
                              shrink-0
                              items-center
                              justify-center
                              overflow-hidden
                              rounded-lg
                              border
                              border-red-200
                              bg-red-50/40

                              [&_button]:flex
                              [&_button]:h-9
                              [&_button]:w-9
                              [&_button]:cursor-pointer
                              [&_button]:items-center
                              [&_button]:justify-center
                              [&_button]:overflow-hidden
                              [&_button]:whitespace-nowrap
                              [&_button]:border-0
                              [&_button]:bg-transparent
                              [&_button]:p-0
                              [&_button]:text-[0px]
                              [&_button]:text-red-600
                              [&_button]:shadow-none

                              [&_svg]:h-4
                              [&_svg]:w-4
                              [&_svg]:shrink-0
                              [&_svg]:text-red-600
                            "
                        >
                          <DeleteButton path={`product/delete/${item._id}`} />
                        </div>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="grid gap-4 p-4 sm:grid-cols-2 min-[1800px]:hidden">
          {products.map((item) => (
            <article
              key={item._id}
              className="
                  overflow-hidden
                  rounded-2xl
                  border
                  border-[#e8ded0]
                  bg-white
                  transition
                  duration-200
                  hover:border-[#d4c1af]
                  hover:shadow-md
                "
            >
              <div className="flex gap-4 p-4">
                <div className="h-20 w-20 shrink-0 overflow-hidden rounded-xl border border-[#e8ded0] bg-[#f3ede5]">
                  <img
                    src={item.thumbnail}
                    alt={item.title || "Product"}
                    className="h-full w-full object-cover"
                  />
                </div>

                <div className="min-w-0 flex-1">
                  <h3 className="line-clamp-2 text-[15px] font-semibold leading-5 text-[#2b1b11]">
                    {item.title}
                  </h3>

                  <p className="mt-1 truncate text-xs text-[#8f7a68]">
                    {item.category?.name || "Uncategorised"}

                    {" · "}

                    {item.roomType?.name || "No room"}
                  </p>

                  <div className="mt-2 flex flex-wrap items-center gap-2">
                    <p className="text-[16px] font-semibold text-[#2b1b11]">
                      {money(item.salePrice || item.price)}
                    </p>

                    {item.salePrice && item.salePrice < item.price && (
                      <span className="text-[11px] text-[#9b897b] line-through">
                        {money(item.price)}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <div className="space-y-3 border-t border-[#eee5da] px-4 py-4">
                <div className="flex items-center justify-between gap-4">
                  <span className="text-xs text-[#8f7a68]">SKU</span>

                  <span className="max-w-[65%] truncate text-xs font-medium text-[#5c4535]">
                    {item.sku || "Missing"}
                  </span>
                </div>

                <div className="flex items-center justify-between gap-4">
                  <span className="text-xs text-[#8f7a68]">Inventory</span>

                  <StockBadge quantity={item.stockQuantity} />
                </div>

                <div className="flex items-center justify-between gap-4">
                  <span className="text-xs text-[#8f7a68]">Visibility</span>

                  <StatusBadge
                    status={item.status}
                    path={`product/status-update/${item._id}`}
                  />
                </div>

                <div className="flex items-start justify-between gap-4">
                  <span className="pt-1 text-xs text-[#8f7a68]">Tags</span>

                  <div className="flex justify-end">
                    <ProductFlags item={item} />
                  </div>
                </div>
              </div>

              <div className="border-t border-[#eee5da] bg-[#fffdfa] p-3">
                <div className="grid grid-cols-2 gap-2">
                  <Link
                    href={`/admin/products/edit/${item._id}`}
                    className="
                        flex
                        min-h-10
                        cursor-pointer
                        items-center
                        justify-center
                        gap-2
                        rounded-lg
                        border
                        border-[#d8c8b8]
                        bg-white
                        px-3
                        text-xs
                        font-medium
                        text-[#70482e]
                        transition
                        hover:border-[#8b5e3c]
                        hover:bg-[#f3ede5]
                      "
                  >
                    <Pencil size={14} />
                    Edit
                  </Link>

                  <Link
                    href={`/admin/products/add-images/${item._id}`}
                    className="
                        flex
                        min-h-10
                        cursor-pointer
                        items-center
                        justify-center
                        gap-2
                        rounded-lg
                        border
                        border-[#d8c8b8]
                        bg-white
                        px-3
                        text-xs
                        font-medium
                        text-[#70482e]
                        transition
                        hover:border-[#8b5e3c]
                        hover:bg-[#f3ede5]
                      "
                  >
                    <Images size={14} />
                    Images
                  </Link>
                </div>

                <div
                  className="
                      mt-2
                      flex
                      min-h-10
                      items-center
                      justify-center
                      overflow-hidden
                      rounded-lg
                      border
                      border-red-200
                      bg-red-50/40

                      [&_button]:flex
                      [&_button]:min-h-10
                      [&_button]:w-full
                      [&_button]:cursor-pointer
                      [&_button]:items-center
                      [&_button]:justify-center
                      [&_button]:gap-2
                      [&_button]:border-0
                      [&_button]:bg-transparent
                      [&_button]:px-4
                      [&_button]:py-0
                      [&_button]:text-xs
                      [&_button]:font-medium
                      [&_button]:text-red-600
                      [&_button]:shadow-none
                      [&_button]:transition
                      [&_button]:hover:bg-red-50

                      [&_svg]:h-4
                      [&_svg]:w-4
                    "
                >
                  <DeleteButton path={`product/delete/${item._id}`} />
                </div>
              </div>
            </article>
          ))}
        </div>

        {!products.length && (
          <div className="px-6 py-16 text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-[#f3ede5] text-[#8b5e3c]">
              <Search size={22} />
            </div>

            <h3 className="mt-4 text-[16px] font-semibold text-[#2b1b11]">
              No products found
            </h3>

            <p className="mt-2 text-sm text-[#786454]">
              Try changing your search or product filters.
            </p>

            <Link
              href="/admin/products"
              className="mt-5 inline-flex cursor-pointer items-center gap-2 text-sm font-semibold text-[#8b5e3c]"
            >
              <RotateCcw size={15} />
              Clear filters
            </Link>
          </div>
        )}

        {products.length > 0 && (
          <div className="flex flex-col gap-3 border-t border-[#e8ded0] px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
            <p className="text-center text-xs text-[#786454] sm:text-left">
              Page <span className="font-semibold text-[#2b1b11]">{page}</span>{" "}
              of <span className="font-semibold text-[#2b1b11]">{pages}</span>
            </p>

            <div className="grid grid-cols-2 gap-2">
              <Link
                href={buildPageHref(query, Math.max(1, page - 1))}
                className={`
                  inline-flex
                  min-h-10
                  items-center
                  justify-center
                  gap-2
                  rounded-lg
                  border
                  border-[#d8c8b8]
                  px-4
                  text-sm
                  font-medium
                  text-[#5c4535]
                  transition
                  ${
                    page <= 1
                      ? "pointer-events-none opacity-40"
                      : "hover:bg-[#f3ede5]"
                  }
                `}
              >
                <ChevronLeft size={16} />
                Previous
              </Link>

              <Link
                href={buildPageHref(query, Math.min(pages, page + 1))}
                className={`
                  inline-flex
                  min-h-10
                  items-center
                  justify-center
                  gap-2
                  rounded-lg
                  border
                  border-[#d8c8b8]
                  px-4
                  text-sm
                  font-medium
                  text-[#5c4535]
                  transition
                  ${
                    page >= pages
                      ? "pointer-events-none opacity-40"
                      : "hover:bg-[#f3ede5]"
                  }
                `}
              >
                Next
                <ChevronRight size={16} />
              </Link>
            </div>
          </div>
        )}
      </section>
    </main>
  );
}

function Metric({ label, value, icon, warning = false }) {
  return (
    <div
      className="
        rounded-2xl
        border
        border-[#e8ded0]
        bg-[#fffdfa]
        p-4
        shadow-sm
        sm:p-5
      "
    >
      <div className="flex items-center justify-between gap-3">
        <div
          className={`
            flex
            h-10
            w-10
            items-center
            justify-center
            rounded-xl
            ${
              warning
                ? "bg-amber-50 text-amber-700"
                : "bg-[#f3ede5] text-[#8b5e3c]"
            }
          `}
        >
          {icon}
        </div>

        <span className="text-[10px] font-semibold uppercase tracking-[0.14em] text-[#9b897b]">
          {label}
        </span>
      </div>

      <strong className="mt-4 block text-2xl font-semibold text-[#2b1b11] sm:text-3xl">
        {value}
      </strong>
    </div>
  );
}

function StockBadge({ quantity }) {
  const stock = Number(quantity || 0);

  if (stock <= 0) {
    return (
      <span className="inline-flex whitespace-nowrap rounded-full bg-red-50 px-2.5 py-1 text-[11px] font-semibold text-red-700">
        Out of stock
      </span>
    );
  }

  if (stock <= 5) {
    return (
      <span className="inline-flex whitespace-nowrap rounded-full bg-amber-50 px-2.5 py-1 text-[11px] font-semibold text-amber-700">
        {stock} units
      </span>
    );
  }

  return (
    <span className="inline-flex whitespace-nowrap rounded-full bg-emerald-50 px-2.5 py-1 text-[11px] font-semibold text-emerald-700">
      {stock} units
    </span>
  );
}

function ProductFlags({ item }) {
  const flags = [
    item.featured && "Featured",

    item.bestSeller && "Best seller",

    item.newArrival && "New",
  ].filter(Boolean);

  if (!flags.length) {
    return <span className="text-xs text-[#aa998a]">—</span>;
  }

  return (
    <div className="flex flex-wrap gap-1.5">
      {flags.map((flag) => (
        <span
          key={flag}
          className="
              inline-flex
              items-center
              gap-1
              whitespace-nowrap
              rounded-full
              bg-[#f3ede5]
              px-2
              py-1
              text-[10px]
              font-medium
              text-[#70482e]
            "
        >
          <Tag size={10} />

          {flag}
        </span>
      ))}
    </div>
  );
}

function buildPageHref(query, page) {
  const params = new URLSearchParams();

  Object.entries(query || {}).forEach(([key, value]) => {
    if (
      key === "page" ||
      value === undefined ||
      value === null ||
      value === ""
    ) {
      return;
    }

    if (Array.isArray(value)) {
      value.forEach((item) => params.append(key, String(item)));
    } else {
      params.set(key, String(value));
    }
  });

  params.set("page", String(page));

  return `?${params.toString()}`;
}
