import Link from "next/link";
import React from "react";
import HomeProductCard from "./HomeProductCard";
import { fetchProduct } from "@/api/api";

export default async function BestSellers() {
  const { success, data } = await fetchProduct({
    bestSeller: true,
    limit: 4,
  });

  const products = success ? data : [];

  return (
    <section className="w-full bg-[#fafaf9f7] px-3 sm:px-6 lg:px-8 py-7 sm:py-10">
      <div className="flex items-end justify-between gap-4 mb-4 sm:mb-7">
        <div>
          <p className="text-[10px] sm:text-[12px] font-medium tracking-[3px] sm:tracking-[6px] uppercase text-[#8b5e3c] mb-2 sm:mb-3">
            Handpicked For You
          </p>

          <h2 className="text-[21px] sm:text-[28px] font-medium text-[#111111]">
            Best Sellers
          </h2>
        </div>

        <Link
          href="/store?bestSeller=true"
          className="text-[14px] text-[#98663e] underline hover:text-[#70482d] transition"
        >
          View all
        </Link>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-x-2 gap-y-3 sm:gap-5">
        {products.map((item) => (
          <HomeProductCard
            key={item._id}
            href={`/store/${item._id}`}
            image={item.thumbnail}
            category={item.category?.name || item.category}
            title={item.title}
            price={`₹${(item.salePrice > 0 && item.salePrice < item.price ? item.salePrice : item.price)?.toLocaleString("en-IN")}`}
            oldPrice={
              (
                item.salePrice > 0 && item.salePrice < item.price
                  ? item.price
                  : null
              )
                ? `₹${(item.salePrice > 0 && item.salePrice < item.price ? item.price : null)?.toLocaleString("en-IN")}`
                : null
            }
          />
        ))}
      </div>
    </section>
  );
}
