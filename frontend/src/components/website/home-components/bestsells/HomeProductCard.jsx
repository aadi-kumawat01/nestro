import Link from "next/link";
import Image from "next/image";
import React from "react";
import { FiHeart } from "react-icons/fi";

export default function HomeProductCard({
  href = "/store/ember-velvet-3-seater",
  image,
  category,
  title,
  reviews,
  price,
  oldPrice,
}) {
  return (
    <Link href={href} className="group block">
      <div className="h-full bg-white border border-[#e8ded0] rounded-lg sm:rounded-xl overflow-hidden transition-all duration-300 hover:shadow-[0_18px_45px_rgba(43,27,17,0.12)]">
        <div className="relative h-[145px] sm:h-[220px] lg:h-[280px] overflow-hidden bg-[#f0ebe3]">
          <Image
            src={image}
            alt={title}
            fill
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
            className="object-cover transition-transform duration-500 group-hover:scale-105"
          />

          <div className="hidden lg:flex absolute left-0 right-0 bottom-0 h-11 bg-[#2b1b11]/85 translate-y-full group-hover:translate-y-0 transition-transform duration-300 items-center justify-center z-10">
            <span className="text-[#e6c3a0] text-[13px] font-semibold tracking-[3px]">
              VIEW PRODUCT
            </span>
          </div>
        </div>

        <div className="p-2.5 sm:p-4">
          <p className="truncate text-[9px] sm:text-[12px] uppercase tracking-[1.5px] lg:tracking-[4px] text-[#667085]">
            {category}
          </p>

          <h3 className="line-clamp-2 min-h-9 sm:min-h-11 text-[12px] sm:text-[16px] lg:text-[17px] leading-[1.45] font-medium text-[#111111] mt-1.5 sm:mt-2">
            {title}
          </h3>

          <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 mt-2 sm:mt-4">
            <p className="text-[14px] sm:text-[18px] font-semibold text-[#111111]">
              {price}
            </p>

            {oldPrice && (
              <p className="text-[10px] sm:text-[14px] text-[#667085] line-through">
                {oldPrice}
              </p>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
}
