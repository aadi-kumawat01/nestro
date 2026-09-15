import React from "react";
import { client } from "@/utils/helper";
import { fetchCategory, fetchRoom } from "@/api/api";
import Stockfilter from "./Stockfilter";
import Filtersection from "./Filtersection";
import Pricefilter from "./Pricefilter";

export default async function Left() {
  const [category_response, room_response, facets] = await Promise.all([
    fetchCategory(),
    fetchRoom(),
    client
      .get("product/facets")
      .then((r) => r.data.data)
      .catch(() => ({ colors: [], materials: [] })),
  ]);

  return (
    <aside className="w-full bg-white border border-[#e8ded0] rounded-xl p-5 sm:p-6">
      <p className="text-[12px] tracking-[6px] uppercase text-[#667085] mb-6">
        Filters
      </p>

      <div className="border-t-0 pt-0 mt-0">
        <Filtersection
          title="Category"
          queryKey="category"
          readOnly
          data={category_response.data}
        />
      </div>

      <div className="border-t border-[#e8ded0] pt-5 mt-5">
        <Filtersection
          title="Room Type"
          queryKey="room"
          readOnly
          data={room_response.data}
        />
      </div>

      <Filtersection
        title="Colour"
        queryKey="color"
        data={facets.colors.map((name) => ({ _id: name, name, slug: name }))}
      />
      <Filtersection
        title="Material"
        queryKey="material"
        data={facets.materials.map((name) => ({ _id: name, name, slug: name }))}
      />

      <div className="border-t border-[#e8ded0] pt-5 mt-5">
        <Pricefilter />
      </div>

      <div className="border-t border-[#e8ded0] pt-5 mt-5">
        <Stockfilter />
      </div>
    </aside>
  );
}
