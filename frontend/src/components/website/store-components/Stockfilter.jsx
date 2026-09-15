"use client";

import { useSearchParams, useRouter } from "next/navigation";
import React from "react";

export default function Stockfilter() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const selectValue = searchParams.get("stock") === "true";
  function stockhandle() {
    const params = new URLSearchParams(searchParams.toString());
    if (selectValue) {
      params.delete("stock");
    } else {
      params.set("stock", "true");
    }

    router.push(`/store?${params.toString()}`, { scroll: false });
  }
  return (
    <div className=" pb-4">
      <h3 className="text-[16px] text-[#8b5e3c] font-medium  mb-4 ">
        Availability
      </h3>

      <label className="flex gap-2 mb-1 text-[#444444] text-[12px]">
        <input
          type="checkbox"
          checked={selectValue}
          onChange={stockhandle}
          className="w-4 h-4 accent-[#98663e]"
        />
        <span className="text-[14px]">in stock</span>
      </label>
    </div>
  );
}
