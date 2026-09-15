"use client";

import React from "react";
import { FiX } from "react-icons/fi";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

export default function Righttop({ total }) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const category = searchParams.get("category");
  const room = searchParams.get("room");
  const minprice = searchParams.get("minprice");
  const maxprice = searchParams.get("maxprice");
  const stock = searchParams.get("stock");
  const bestSeller = searchParams.get("bestSeller");
  const newArrival = searchParams.get("newArrival");
  const sortFilter = searchParams.get("sortFilter");

  function removeFilter(queryKey) {
    const params = new URLSearchParams(searchParams.toString());

    params.delete(queryKey);
    params.delete("page");

    router.push(`${pathname}?${params.toString()}`, { scroll: false });
  }

  function removePriceFilter() {
    const params = new URLSearchParams(searchParams.toString());

    params.delete("minprice");
    params.delete("maxprice");
    params.delete("page");

    router.push(`${pathname}?${params.toString()}`, { scroll: false });
  }

  function sortHandler(e) {
    const value = e.target.value;

    const params = new URLSearchParams(searchParams.toString());

    if (value === "featured") {
      params.delete("sortFilter");
    } else {
      params.set("sortFilter", value);
    }

    params.delete("page");

    router.push(`${pathname}?${params.toString()}`, { scroll: false });
  }

  function formatLabel(value) {
    if (!value) {
      return "";
    }

    return value
      .split("-")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  }

  const filters = [];

  if (category) {
    filters.push({
      key: "category",
      label: formatLabel(category),
      remove: () => removeFilter("category"),
    });
  }

  if (room) {
    filters.push({
      key: "room",
      label: formatLabel(room),
      remove: () => removeFilter("room"),
    });
  }

  if (minprice) {
    filters.push({
      key: "minprice",
      label: `Min ₹${Number(minprice).toLocaleString("en-IN")}`,
      remove: () => removeFilter("minprice"),
    });
  }

  if (maxprice) {
    filters.push({
      key: "maxprice",
      label: `Max ₹${Number(maxprice).toLocaleString("en-IN")}`,
      remove: () => removeFilter("maxprice"),
    });
  }

  if (stock) {
    let stockLabel = stock;

    if (stock === "true") {
      stockLabel = "In Stock";
    }

    if (stock === "false") {
      stockLabel = "Out of Stock";
    }

    filters.push({
      key: "stock",
      label: stockLabel,
      remove: () => removeFilter("stock"),
    });
  }

  if (bestSeller === "true") {
    filters.push({
      key: "bestSeller",
      label: "Best Seller",
      remove: () => removeFilter("bestSeller"),
    });
  }

  if (newArrival === "true") {
    filters.push({
      key: "newArrival",
      label: "New Arrival",
      remove: () => removeFilter("newArrival"),
    });
  }

  return (
    <div className="w-full bg-white border border-[#e8ded0] rounded-lg lg:rounded-xl px-3 sm:px-5 lg:px-6 py-3 lg:py-4 flex items-center justify-between gap-3">
      <div>
        <p className="hidden lg:block text-[12px] tracking-[4px] uppercase text-[#667085] mb-1">
          Store
        </p>

        <div className="text-[13px] sm:text-[16px] lg:text-[18px] whitespace-nowrap">
          <span className="font-semibold text-[#111111]">{total}</span>

          <span className="text-[#667085] ml-1">products found</span>
        </div>
      </div>

      <div className="flex min-w-0 flex-1 items-center justify-end gap-2 lg:gap-3">
        {filters.length > 0 && (
          <div className="hidden lg:flex items-center gap-2 flex-wrap">
            {filters.map((item) => (
              <button
                key={item.key}
                onClick={item.remove}
                className="flex items-center gap-2 bg-[#f7f2ec] text-[#98663e] px-3 py-1.5 rounded-full text-[13px] font-medium hover:bg-[#eadbcb] transition"
              >
                <span>{item.label}</span>

                <FiX size={14} />
              </button>
            ))}
          </div>
        )}

        <select
          value={sortFilter || "featured"}
          onChange={sortHandler}
          className="h-9 min-w-0 max-w-[170px] border border-[#ddd4c8] rounded-md px-2 sm:px-3 lg:px-4 text-[12px] lg:text-[13px] outline-none bg-white text-[#344054] focus:border-[#98663e]"
        >
          <option value="featured">Sort: Featured</option>

          <option value="createdAt-desc">Newest</option>

          <option value="salePrice-asc">Price: Low to High</option>

          <option value="salePrice-dsc">Price: High to Low</option>

          <option value="bestSelling">Best Selling</option>
        </select>
      </div>
    </div>
  );
}
