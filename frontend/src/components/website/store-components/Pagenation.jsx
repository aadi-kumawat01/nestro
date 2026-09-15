"use client";

import { useSearchParams, useRouter } from "next/navigation";

export default function Pagenation({ pages = 1 }) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const currentPage = Number(searchParams.get("page")) || 1;

  function handelPage(page) {
    if (page < 1 || page > pages) {
      return;
    }

    const params = new URLSearchParams(searchParams.toString());

    params.set("page", page);

    router.push(`/store?${params.toString()}`, { scroll: false });
  }

  function getPages() {
    if (pages <= 7) {
      return Array.from({ length: pages }, (_, index) => index + 1);
    }

    const pageList = [];

    pageList.push(1);

    if (currentPage > 3) {
      pageList.push("...");
    }

    const start = Math.max(2, currentPage - 1);

    const end = Math.min(pages - 1, currentPage + 1);

    for (let page = start; page <= end; page++) {
      pageList.push(page);
    }

    if (currentPage < pages - 2) {
      pageList.push("...");
    }

    pageList.push(pages);

    return pageList;
  }

  const pageList = getPages();

  return (
    <div className="flex justify-center py-8">
      <div className="flex items-center gap-2 max-w-full overflow-x-auto hide-scrollbar">
        <button
          disabled={currentPage === 1}
          onClick={() => handelPage(currentPage - 1)}
          className={`w-10 h-10 sm:w-11 sm:h-11 shrink-0 rounded-lg border flex items-center justify-center text-[18px] transition ${
            currentPage === 1
              ? "border-[#e8ded0] text-[#c8c0b8] cursor-not-allowed"
              : "border-[#ddd4c8] bg-white text-[#344054] hover:border-[#98663e] hover:text-[#98663e]"
          }`}
        >
          ‹
        </button>

        {pageList.map((page, index) => {
          if (page === "...") {
            return (
              <span
                key={`dots-${index}`}
                className="w-8 h-10 sm:w-10 sm:h-11 shrink-0 flex items-center justify-center text-[#667085] text-[14px]"
              >
                ...
              </span>
            );
          }

          return (
            <button
              key={page}
              onClick={() => handelPage(page)}
              className={`w-10 h-10 sm:w-11 sm:h-11 shrink-0 rounded-lg border text-[14px] transition ${
                currentPage === page
                  ? "bg-[#98663e] border-[#98663e] text-white"
                  : "bg-white border-[#ddd4c8] text-[#344054] hover:border-[#98663e] hover:text-[#98663e]"
              }`}
            >
              {page}
            </button>
          );
        })}

        <button
          disabled={currentPage === pages}
          onClick={() => handelPage(currentPage + 1)}
          className={`w-10 h-10 sm:w-11 sm:h-11 shrink-0 rounded-lg border flex items-center justify-center text-[18px] transition ${
            currentPage === pages
              ? "border-[#e8ded0] text-[#c8c0b8] cursor-not-allowed"
              : "border-[#ddd4c8] bg-white text-[#344054] hover:border-[#98663e] hover:text-[#98663e]"
          }`}
        >
          ›
        </button>
      </div>
    </div>
  );
}
