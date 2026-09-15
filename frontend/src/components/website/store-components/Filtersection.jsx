"use client";
import { useSearchParams, useRouter } from "next/navigation";
import React from "react";

export default function Filtersection({ title, data = [], queryKey = "" }) {
  const searchParams = useSearchParams();
  const router = useRouter();

  const selectValue = searchParams.get(queryKey)?.split(",") || [];

  function handleChange(slug) {
    const params = new URLSearchParams(searchParams.toString());
    const currentValues = params.get(queryKey)?.split(",") || [];
    let updatedValues;
    if (currentValues.includes(slug)) {
      updatedValues = currentValues.filter((Value) => Value !== slug);
    } else {
      updatedValues = [...currentValues, slug];
    }

    params.set(queryKey, updatedValues.join(","));
    if (updatedValues.length === 0) {
      params.delete(queryKey);
    }
    params.delete("page");
    router.push(`/store?${params.toString()}`, { scroll: false });
  }

  return (
    <div className="mb-6 pb-4">
      <h3 className="text-[16px] text-[#8b5e3c] font-medium mb-4">{title}</h3>

      <div className="max-h-[155px] overflow-y-auto pr-2 overscroll-contain [scrollbar-width:thin]">
        {data.map((item) => {
          const active = selectValue.includes(item.slug);

          return (
            <label
              key={item._id}
              className="flex justify-between items-center min-h-[30px] text-[#444444] text-[12px]"
            >
              <div className="flex gap-2 items-center">
                <input
                  type="checkbox"
                  checked={active}
                  onChange={() => handleChange(item.slug)}
                  className="w-4 h-4 accent-[#98663e]"
                />

                <span className="text-[14px]">{item.name}</span>
              </div>

              {item.count !== undefined && <span>{item.count}</span>}
            </label>
          );
        })}
      </div>
    </div>
  );
}
