import { fetchProduct } from "@/api/api";
import ProductCard from "@/components/website/store-components/ProductCard";
import Pagenation from "@/components/website/store-components/Pagenation";
import Righttop from "@/components/website/store-components/Righttop";
import Left from "@/components/website/store-components/Left";

import React from "react";
import Hero from "@/components/website/store-components/Hero";

const labelFromSlug = (value) =>
  String(value || "")
    .split("-")
    .filter(Boolean)
    .map((word) => word[0]?.toUpperCase() + word.slice(1))
    .join(" ");

export async function generateMetadata({ searchParams }) {
  const query = await searchParams;
  const page = Math.max(1, Number(query.page) || 1);
  const category =
    typeof query.category === "string" ? labelFromSlug(query.category) : "";
  const room = typeof query.room === "string" ? labelFromSlug(query.room) : "";
  const collection =
    query.bestSeller === "true"
      ? "Best-Selling Furniture"
      : query.newArrival === "true"
        ? "New Furniture Arrivals"
        : "";
  const heading = category
    ? `${category} Furniture`
    : room
      ? `${room} Furniture`
      : collection || "Modern Furniture Online";
  const canonicalParams = new URLSearchParams();
  for (const key of ["category", "room", "bestSeller", "newArrival"])
    if (typeof query[key] === "string") canonicalParams.set(key, query[key]);
  if (page > 1) canonicalParams.set("page", String(page));
  const canonical = `/store${canonicalParams.size ? `?${canonicalParams}` : ""}`;
  const nonIndexable = [
    "search",
    "color",
    "material",
    "stock",
    "minprice",
    "maxprice",
    "sortFilter",
  ].some((key) => query[key] != null);
  const title = `${heading}${page > 1 ? ` — Page ${page}` : ""}`;
  const description = `Shop ${heading.toLowerCase()} at Nestro. Compare thoughtfully designed furniture by room, material, colour and price with secure checkout across India.`;
  return {
    title,
    description,
    alternates: { canonical },
    robots: nonIndexable
      ? { index: false, follow: true }
      : { index: true, follow: true },
    openGraph: {
      type: "website",
      url: canonical,
      title: `${title} | Nestro Furniture`,
      description,
    },
  };
}

export default async function Page({ searchParams }) {
  const query = await searchParams;

  const search = typeof query.search === "string" ? query.search : "";
  const category = query.category || null;
  const room = query.room || null;
  const stock = query.stock || null;
  const minPrice = query.minprice || null;
  const maxPrice = query.maxprice || null;
  const bestSeller = query.bestSeller || null;
  const newArrival = query.newArrival || null;
  const sortFilter = query.sortFilter || null;

  const page = Number(query.page) || 1;

  const response = await fetchProduct({
    search,
    color: query.color,
    material: query.material,
    category,
    room,
    stock,
    minPrice,
    maxPrice,
    page,
    bestSeller,
    newArrival,
    sortFilter,
  });

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
  const listSchema = response?.data?.length
    ? {
        "@context": "https://schema.org",
        "@type": "ItemList",
        name: category
          ? `${labelFromSlug(category)} Furniture`
          : room
            ? `${labelFromSlug(room)} Furniture`
            : "Nestro Furniture Collection",
        numberOfItems: response.data.length,
        itemListElement: response.data.map((product, index) => ({
          "@type": "ListItem",
          position: index + 1,
          name: product.title,
          url: `${siteUrl}/store/${product._id}`,
        })),
      }
    : null;

  return (
    <div className="px-2.5 py-3 sm:px-5 sm:py-5 lg:px-6">
      {listSchema && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(listSchema).replace(/</g, "\\u003c"),
          }}
        />
      )}

      <Hero />

      <Righttop total={response?.total || 0} />

      <details className="lg:hidden mt-3 rounded-lg bg-white border border-[#e8ded0] px-3 py-2.5">
        <summary className="cursor-pointer font-semibold text-[#8b5e3c]">
          Filter products
        </summary>

        <div className="mt-4">
          <Left />
        </div>
      </details>

      <div className="flex lg:items-start gap-5 mt-3 lg:mt-5 min-w-0">
        <div
          className="
          hidden
          lg:block
          w-[280px]
          shrink-0
          self-start
          sticky
          top-[72px]
          h-[calc(100vh-88px)]
          overflow-y-auto
          overscroll-contain
          [scrollbar-width:thin]
          [scrollbar-color:#c7aa91_transparent]
        "
        >
          <Left />
        </div>

        <main className="flex-1 min-w-0">
          {!response.success && (
            <p role="alert" className="p-4 bg-red-50 rounded-xl text-red-700">
              Unable to load products. Please refresh.
            </p>
          )}

          {response.success && !response.data?.length && (
            <p className="p-4 bg-white rounded-xl">
              No products match your filters.
            </p>
          )}

          <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-3 2xl:grid-cols-4 gap-x-2 gap-y-3 sm:gap-4 lg:gap-5 min-w-0">
            {response?.data?.map((product) => (
              <ProductCard key={product._id} product={product} />
            ))}
          </div>

          <Pagenation pages={response?.pages || 1} />
        </main>
      </div>
    </div>
  );
}
