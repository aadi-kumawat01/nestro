"use client";

import Link from "next/link";
import Image from "next/image";
import WishlistButton from "./WishlistButton";
import AddToCartBtn from "./AddToCartBtn";

export default function ProductCard({ product, compact = false }) {
  const {
    thumbnail,
    title,
    price,
    salePrice,
    discount,
    bestSeller,
    newArrival,
    category,
    stock,
  } = product;

  const badge = bestSeller
    ? "BESTSELLER"
    : newArrival
      ? "NEW"
      : discount > 0
        ? `-${discount}%`
        : "";

  const finalPrice = salePrice && salePrice < price ? salePrice : price;

  return (
    <div className="group block">
      <div className="h-full bg-white border border-[#e8ded0] rounded-lg sm:rounded-xl overflow-hidden transition-all duration-300 hover:shadow-[0_18px_45px_rgba(43,27,17,0.12)] flex flex-col">
        <div
          className={`relative ${compact ? "h-[138px] sm:h-[210px] lg:h-[250px]" : "h-[145px] sm:h-[220px] lg:h-[280px]"} overflow-hidden bg-[#f0ebe3]`}
        >
          <Link href={`/store/${product._id}`} className="block w-full h-full">
            <Image
              src={thumbnail}
              alt={title}
              fill
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
              className="object-cover transition-transform duration-500 group-hover:scale-105"
            />

            {badge && (
              <span
                className={`absolute top-2 left-2 sm:top-3 sm:left-3 px-1.5 sm:px-3 py-1 rounded-sm text-[9px] sm:text-[12px] font-semibold tracking-[.5px] sm:tracking-[1px] text-white z-20 ${
                  bestSeller ? "bg-[#2b1b11]" : "bg-[#98663e]"
                }`}
              >
                {badge}
              </span>
            )}

            <div className="hidden lg:flex absolute left-0 right-0 bottom-0 h-11 bg-[#2b1b11]/85 translate-y-full group-hover:translate-y-0 transition-transform duration-300 items-center justify-center z-10">
              <span
                className="relative inline-block text-[#e6c3a0] text-[13px] font-semibold tracking-[3px]
  after:absolute after:left-0 after:-bottom-1 after:h-[1px] after:w-0
  after:bg-[#e6c3a0] after:transition-all after:duration-300
  hover:after:w-full"
              >
                VIEW PRODUCT
              </span>
            </div>
          </Link>

          <div className="absolute top-1.5 right-1.5 sm:top-3 sm:right-3 bg-white rounded-full z-20">
            <WishlistButton id={product._id} />
          </div>
        </div>

        <Link href={`/store/${product._id}`} className="flex-1">
          <div className="p-2.5 sm:p-4">
            <p className="truncate text-[9px] sm:text-[11px] lg:text-[12px] uppercase text-[#667085] tracking-[1.5px] lg:tracking-[4px]">
              {category?.name || "Furniture"}
            </p>

            <h3 className="line-clamp-2 min-h-9 sm:min-h-11 text-[12px] sm:text-[15px] lg:text-[17px] leading-[1.45] font-medium text-[#111111] mt-1.5 sm:mt-2">
              {title}
            </h3>

            <div className="flex items-center gap-x-1.5 gap-y-0.5 flex-wrap mt-2 sm:mt-3 lg:mt-4">
              <p className="text-[14px] sm:text-[16px] lg:text-[18px] font-semibold text-[#111111]">
                ₹{finalPrice?.toLocaleString("en-IN")}
              </p>

              {salePrice && salePrice < price && (
                <p className="text-[10px] sm:text-[12px] lg:text-[14px] text-[#667085] line-through">
                  ₹{price?.toLocaleString("en-IN")}
                </p>
              )}
            </div>
          </div>
        </Link>

        <div className="px-2.5 pb-2.5 sm:px-4 sm:pb-4 flex justify-stretch sm:justify-end">
          <AddToCartBtn stock={stock} product={product} />
        </div>
      </div>
    </div>
  );
}
