"use client";

import { useSearchParams, useRouter } from "next/navigation";
import React, { useState } from "react";

export default function Pricefilter() {
  const [minPrice, setminPrice] = useState(0);
  const [maxPrice, setmaxPrice] = useState(0);

  const searchParams = useSearchParams();
  const router = useRouter();

  const minprice = Number(searchParams.get("minprice")) || minPrice;
  const maxprice = Number(searchParams.get("maxprice")) || maxPrice;

  function Pricehandle() {
    if (Number(minPrice) > Number(maxPrice)) {
      return;
    }

    const params = new URLSearchParams(searchParams.toString());

    params.set("minprice", minPrice);
    params.set("maxprice", maxPrice);

    params.delete("page");
    router.push(`/store?${params.toString()}`, { scroll: false });
  }

  function Clerehandle() {
    const params = new URLSearchParams(searchParams.toString());

    params.delete("minprice");
    params.delete("maxprice");

    params.delete("page");
    router.push(`/store?${params.toString()}`, { scroll: false });
  }

  return (
    <div>
      <h3 className="text-[16px] font-medium text-[#111111] mb-4">
        Price Range
      </h3>

      <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-3">
        <input
          type="text"
          value={minprice}
          onChange={(e) => {
            setminPrice(e.target.value);
          }}
          placeholder="₹8,000"
          className="min-w-0 w-full h-10 rounded-md border border-[#ddd4c8] bg-white px-3 text-[14px] outline-none focus:border-[#98663e] text-[#444444]"
        />

        <span className="text-[#667085]">—</span>

        <input
          type="text"
          value={maxprice}
          onChange={(e) => {
            setmaxPrice(e.target.value);
          }}
          placeholder="₹2,00,000"
          className="min-w-0 w-full h-10 rounded-md border border-[#ddd4c8] bg-white px-3 text-[14px] outline-none focus:border-[#98663e] text-[#444444]"
        />
      </div>

      <div className="flex justify-between gap-3 mt-4">
        <button
          onClick={Pricehandle}
          className="px-4 py-2 rounded-md bg-[#98663e] text-white text-[12px] font-medium hover:bg-[#815431] transition"
        >
          Set Price
        </button>

        <button
          onClick={Clerehandle}
          className="px-4 py-2 rounded-md border border-[#d8cabc] text-[#667085] text-[12px] font-medium hover:bg-[#f7f2ec] transition"
        >
          Clear
        </button>
      </div>

      {Number(minPrice) > Number(maxPrice) && (
        <p className="text-red-700 text-[11px] mt-2">
          Minimum price cannot be greater than maximum price
        </p>
      )}
    </div>
  );
}
