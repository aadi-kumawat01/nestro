import React from "react";
import Link from "next/link";
import Image from "next/image";
import {
  FiArrowRight,
  FiChevronLeft,
  FiChevronRight,
  FiX,
} from "react-icons/fi";

export default function Hero() {
  return (
    <div className="hidden lg:block px-4 sm:px-6 lg:px-8 py-6">
      <section className="w-full max-w-full overflow-hidden bg-[#2b1b11] rounded-2xl p-6 sm:p-10 lg:p-14">
        <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] gap-8 items-center">
          <div className="min-w-0">
            <p className="text-[11px] sm:text-[12px] tracking-[4px] sm:tracking-[6px] uppercase text-[#c69a6b] mb-5">
              New Collection — SS 2026
            </p>

            <h1 className="text-white text-[34px] sm:text-[48px] font-semibold leading-tight">
              Modern Living
              <br />
              <span className="italic font-light text-[#e0b58f]">
                Collection
              </span>
            </h1>

            <p className="text-[#b9ada5] text-[15px] sm:text-[16px] leading-7 mt-5">
              Timeless furniture crafted for elegant spaces.
              <br className="hidden sm:block" />
              Designed with intention, built to endure.
            </p>

            <Link
              href="/store"
              className="mt-8 w-fit bg-[#98663e] text-white px-7 py-3 rounded-md text-[14px] font-semibold flex items-center gap-3 hover:bg-[#815431] transition cursor-pointer"
            >
              Explore Collection
              <FiArrowRight />
            </Link>
          </div>

          <div className="relative min-w-0 h-[220px] sm:h-[320px] rounded-xl overflow-hidden">
            <Image
              src="https://images.unsplash.com/photo-1758448511322-8bfc73daf606?auto=format&fit=crop&w=1200&q=80"
              alt="Modern living collection"
              fill
              sizes="(max-width: 640px) 100vw, 50vw"
              className="object-cover"
            />
          </div>
        </div>
      </section>
    </div>
  );
}
