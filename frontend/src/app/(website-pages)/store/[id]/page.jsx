import {
  ProductActions,
  ProductGallery,
  ProductExtras,
} from "@/components/website/store-components/ProductInteractions";
import { notFound } from "next/navigation";
import { fetchProductById } from "@/api/api";
import Link from "next/link";
import { FiArrowLeft } from "react-icons/fi";

export default async function ProductOverviewPage({ params }) {
  const { id } = await params;

  const response = await fetchProductById(id);
  const product = response?.data;

  if (!response?.success || !product) {
    notFound();
  }

  const finalPrice =
    Number(product.salePrice) > 0 &&
    Number(product.salePrice) < Number(product.price)
      ? product.salePrice
      : product.price;

  const hasDiscount =
    Number(product.salePrice) > 0 &&
    Number(product.salePrice) < Number(product.price);
  const canonical = `/store/${id}`;
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
  const canonicalUrl = new URL(canonical, siteUrl).toString();
  const inStock = product.stock !== false && Number(product.stockQuantity) > 0;
  const productSchema = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.title,
    description: product.shortDescription || product.description,
    image: [product.thumbnail, ...(product.images || [])].filter(
      (image) => typeof image === "string" && image.startsWith("https://"),
    ),
    sku: product.sku || undefined,
    category: product.category?.name || undefined,
    brand: { "@type": "Brand", name: "Nestro" },
    offers: {
      "@type": "Offer",
      priceCurrency: "INR",
      price: Number(finalPrice),
      availability: inStock
        ? "https://schema.org/InStock"
        : "https://schema.org/OutOfStock",
      itemCondition: "https://schema.org/NewCondition",
      url: canonicalUrl,
      seller: { "@type": "Organization", name: "Nestro Furniture" },
    },
  };
  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: siteUrl },
      {
        "@type": "ListItem",
        position: 2,
        name: "Furniture Store",
        item: `${siteUrl}/store`,
      },
      {
        "@type": "ListItem",
        position: 3,
        name: product.title,
        item: canonicalUrl,
      },
    ],
  };

  return (
    <div className="min-h-screen bg-[#faf8f4] px-2.5 sm:px-6 lg:px-10 py-4 sm:py-10">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(productSchema).replace(/</g, "\\u003c"),
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(breadcrumbSchema).replace(/</g, "\\u003c"),
        }}
      />

      <div className="max-w-[1200px] mx-auto mb-3 sm:mb-7 px-1">
        <Link
          href="/store"
          className="inline-flex items-center gap-2 text-[13px] text-[#786454] hover:text-[#8b5e3c] transition"
        >
          <FiArrowLeft />
          Back to Store
        </Link>
      </div>

      <div className="max-w-[1200px] mx-auto">
        <div className="bg-[#fffdfa] border border-[#e8ded0] rounded-2xl overflow-hidden">
          <div className="flex flex-col lg:flex-row">
            <div className="w-full lg:w-[52%] p-2.5 sm:p-6">
              <ProductGallery key={product._id} product={product} />
            </div>

            <div className="w-full lg:w-[48%] p-4 sm:p-8 lg:p-9 flex flex-col justify-center min-w-0">
              <p className="text-[11px] uppercase tracking-[4px] text-[#8b5e3c]">
                {product.category?.name || "Furniture"}
              </p>

              <h1 className="text-[23px] sm:text-[34px] lg:text-[40px] leading-[1.15] font-medium tracking-tight text-[#2b1b11] mt-3 sm:mt-4">
                {product.title}
              </h1>

              {product.shortDescription && (
                <p className="text-[14px] sm:text-[15px] leading-7 text-[#786454] mt-5">
                  {product.shortDescription}
                </p>
              )}

              <div className="h-px bg-[#e8ded0] my-7"></div>

              <div className="flex items-end gap-3 flex-wrap">
                <span className="text-[28px] sm:text-[32px] font-semibold text-[#2b1b11]">
                  ₹{finalPrice?.toLocaleString("en-IN")}
                </span>

                {hasDiscount && (
                  <span className="text-[16px] text-[#98A2B3] line-through mb-1">
                    ₹{product.price?.toLocaleString("en-IN")}
                  </span>
                )}
              </div>

              {hasDiscount && (
                <p className="mt-3 w-fit rounded-full bg-[#f0ebe3] px-3 py-1 text-xs font-semibold text-[#8b5e3c]">
                  Save{" "}
                  {Math.round(
                    (1 - Number(product.salePrice) / Number(product.price)) *
                      100,
                  )}
                  %
                </p>
              )}

              <div className="mt-4">
                {product.stock !== false && product.stockQuantity > 0 ? (
                  <span className="inline-flex items-center gap-2 rounded-full bg-green-50 px-3 py-1.5 text-xs font-medium text-green-800">
                    <span className="w-2 h-2 rounded-full bg-green-600"></span>
                    In Stock
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-2 rounded-full bg-[#f8eae5] px-3 py-1.5 text-xs font-medium text-[#9b3f2e]">
                    <span className="w-2 h-2 rounded-full bg-red-600"></span>
                    Out of Stock
                  </span>
                )}
              </div>

              <ProductActions product={product} />

              <div className="mt-8 border-t border-[#e8ded0] pt-6 space-y-3">
                <div className="flex items-center justify-between gap-4 text-[13px]">
                  <span className="text-[#786454]">Category</span>

                  <span className="text-[#2b1b11] font-medium">
                    {product.category?.name || "Furniture"}
                  </span>
                </div>

                {product.roomType?.name && (
                  <div className="flex items-center justify-between gap-4 text-[13px]">
                    <span className="text-[#786454]">Room</span>

                    <span className="text-[#2b1b11] font-medium">
                      {product.roomType.name}
                    </span>
                  </div>
                )}

                <div className="flex items-center justify-between gap-4 text-[13px]">
                  <span className="text-[#786454]">Availability</span>

                  <span className="text-[#2b1b11] font-medium">
                    {product.stock !== false && product.stockQuantity > 0
                      ? "Available"
                      : "Unavailable"}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {product.description && (
          <div className="mt-6 bg-[#fffdfa] border border-[#e8ded0] rounded-2xl p-5 sm:p-8">
            <p className="text-[11px] uppercase tracking-[4px] text-[#8b5e3c]">
              Product Details
            </p>

            <h2 className="text-[21px] sm:text-[24px] font-semibold text-[#2b1b11] mt-3">
              About this product
            </h2>

            <p className="text-[14px] leading-7 text-[#786454] mt-4 max-w-[900px]">
              {product.description}
            </p>
          </div>
        )}

        <ProductExtras product={product} />
      </div>
    </div>
  );
}
export async function generateMetadata({ params }) {
  const { id } = await params;
  const { data: p } = await fetchProductById(id);
  const title = p?.title ? `${p.title} — Buy Online` : "Furniture Product";
  const raw =
    p?.shortDescription ||
    p?.description ||
    "Explore modern furniture from Nestro.";
  const description = String(raw)
    .replace(/<[^>]*>/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 160);
  const image =
    typeof p?.thumbnail === "string" && p.thumbnail.startsWith("https://")
      ? p.thumbnail
      : undefined;
  return {
    title,
    description,
    alternates: { canonical: `/store/${id}` },
    robots: p?._id
      ? { index: true, follow: true }
      : { index: false, follow: true },
    openGraph: {
      type: "website",
      title,
      description,
      url: `/store/${id}`,
      ...(image ? { images: [{ url: image, alt: p.title }] } : {}),
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      ...(image ? { images: [image] } : {}),
    },
  };
}
