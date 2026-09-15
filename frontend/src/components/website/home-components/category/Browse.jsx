import CategoryCircle from "./CategoryCircle";
import { fetchCategory } from "@/api/api";

export default async function ShopByCategory() {
  const { success, data } = await fetchCategory();

  const categories = success ? data : [];

  return (
    <section className="w-full bg-[#fafaf9f7] px-4 sm:px-6 lg:px-8 py-8 sm:py-10">
      <div className="w-full">
        <p className="text-[11px] sm:text-[12px] font-medium tracking-[5px] sm:tracking-[6px] uppercase text-[#8b5e3c] mb-3">
          Browse
        </p>

        <h2 className="text-[22px] sm:text-[26px] font-medium text-[#111111] mb-7 sm:mb-8">
          Shop by Category
        </h2>

        <div className="flex items-start gap-5 sm:gap-8 lg:gap-10 overflow-x-auto pb-3 hide-scrollbar">
          {categories.map((item) => (
            <CategoryCircle
              key={item._id}
              image={item.image}
              title={item.name}
              slug={item.slug}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
