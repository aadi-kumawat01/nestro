import Link from "next/link";
import Image from "next/image";
import React from "react";
import { FiTruck } from "react-icons/fi";
import { fetchProduct } from "@/api/api";

export default async function NewArrivals() {
  const { success, data } = await fetchProduct({
    newArrival: true,
    limit: 3,
  });

  const products = success ? data : [];

  const featuredProduct = products[0];
  const otherProducts = products.slice(1, 3);

  return (
    <section className="w-full bg-[#fafaf9f7] px-3 sm:px-6 lg:px-8 py-7 sm:py-10">
      <div className="flex items-end justify-between gap-4 mb-4 sm:mb-7">
        <div>
          <p className="text-[10px] sm:text-[12px] font-medium tracking-[3px] sm:tracking-[6px] uppercase text-[#8b5e3c] mb-2 sm:mb-3">
            New Arrivals
          </p>

          <h2 className="text-[21px] sm:text-[28px] font-medium text-[#111111]">
            Just Landed
          </h2>
        </div>

        <Link
          href="/store?newArrival=true"
          className="text-[14px] text-[#98663e] underline hover:text-[#70482d] transition"
        >
          View all
        </Link>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-[1.8fr_1fr_1fr] gap-2 sm:gap-5">
        {featuredProduct && (
          <Link
            href={`/store/${featuredProduct._id}`}
            className="group col-span-2 block lg:col-span-1"
          >
            <div className="h-full min-h-[285px] sm:min-h-[360px] lg:min-h-[420px] bg-[#2b1b11] rounded-xl sm:rounded-2xl p-5 sm:p-8 flex flex-col sm:flex-row lg:flex-col justify-between gap-4 overflow-hidden">
              <div>
                <p className="text-[12px] tracking-[5px] uppercase text-[#d49b67] mb-4">
                  Featured
                </p>

                <h3 className="text-white text-[21px] sm:text-[30px] font-semibold leading-tight line-clamp-2">
                  {featuredProduct.title}
                </h3>

                <p className="text-[#b9ada5] text-[13px] sm:text-[15px] mt-2 sm:mt-4">
                  {featuredProduct.category?.name || featuredProduct.category}
                </p>

                <p className="text-white text-[18px] sm:text-[22px] font-semibold mt-3 sm:mt-7">
                  ₹
                  {(featuredProduct.salePrice > 0 &&
                  featuredProduct.salePrice < featuredProduct.price
                    ? featuredProduct.salePrice
                    : featuredProduct.price
                  )?.toLocaleString("en-IN")}
                </p>

                <span className="inline-flex items-center gap-2 mt-4 sm:mt-6 bg-[#98663e] text-white px-4 sm:px-6 py-2.5 sm:py-3 rounded-md text-[12px] sm:text-[14px] font-semibold group-hover:bg-[#b47a4c] transition">
                  View in Store
                </span>
              </div>

              <div className="relative mt-2 sm:mt-0 lg:mt-8 h-[100px] sm:h-[210px] lg:h-[160px] sm:w-[45%] lg:w-full rounded-xl overflow-hidden">
                <Image
                  src={featuredProduct.thumbnail}
                  alt={featuredProduct.title || "Featured Nestro furniture"}
                  fill
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 45vw, 25vw"
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                />
              </div>
            </div>
          </Link>
        )}

        <div className="col-span-2 grid grid-cols-2 gap-2 sm:gap-5 lg:col-span-1 lg:grid-cols-1">
          {otherProducts.map((item) => (
            <ArrivalProductCard
              key={item._id}
              image={item.thumbnail}
              category={item.category?.name || item.category}
              title={item.title}
              price={`₹${(item.salePrice > 0 && item.salePrice < item.price ? item.salePrice : item.price)?.toLocaleString("en-IN")}`}
              href={`/store/${item._id}`}
            />
          ))}
        </div>

        <div className="hidden md:grid grid-cols-1 gap-5">
          <div className="bg-white border border-[#e8ded0] rounded-2xl p-6 min-h-[210px]">
            <p className="text-[12px] tracking-[5px] uppercase text-[#667085] mb-4">
              Free Delivery
            </p>

            <h3 className="text-[20px] font-semibold text-[#111111]">
              On orders above ₹100,000
            </h3>

            <p className="text-[14px] text-[#667085] mt-2">
              Delivery availability is confirmed at checkout.
            </p>

            <div className="mt-7 text-[#98663e] text-[24px]">
              <FiTruck />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function ArrivalProductCard({ image, category, title, price, href }) {
  return (
    <Link href={href} className="group block">
      <div className="bg-white border border-[#e8ded0] rounded-2xl overflow-hidden transition-all duration-300 hover:shadow-[0_18px_45px_rgba(43,27,17,0.12)]">
        <div className="relative h-[125px] sm:h-[170px] overflow-hidden bg-[#f0ebe3]">
          <Image
            src={image}
            alt={title}
            fill
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
            className="object-cover transition-transform duration-500 group-hover:scale-105"
          />
        </div>

        <div className="p-2.5 sm:p-4">
          <p className="truncate text-[9px] sm:text-[12px] uppercase tracking-[1.5px] sm:tracking-[4px] text-[#667085]">
            {category}
          </p>

          <h3 className="line-clamp-2 min-h-9 text-[12px] sm:text-[16px] leading-[1.45] font-medium text-[#111111] mt-1.5 sm:mt-2">
            {title}
          </h3>

          <div className="flex items-center justify-between mt-4">
            <span className="text-[#c69a6b] text-[13px]">★★★★</span>

            <p className="text-[16px] font-semibold text-[#111111]">{price}</p>
          </div>
        </div>
      </div>
    </Link>
  );
}
