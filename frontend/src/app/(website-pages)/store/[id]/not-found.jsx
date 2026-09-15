import Link from "next/link";
export default function ProductNotFound() {
  return (
    <main className="min-h-[70vh] bg-[#faf8f4] px-4 py-12">
      <section className="mx-auto grid max-w-5xl items-center gap-8 overflow-hidden rounded-[2rem] border border-[#e2d5c8] bg-white p-6 shadow-[0_22px_70px_rgba(66,42,25,.1)] md:grid-cols-2 md:p-10">
        <div
          aria-hidden="true"
          className="flex aspect-square items-center justify-center rounded-3xl bg-[#f0e9e1]"
        >
          <svg
            viewBox="0 0 120 120"
            className="w-2/3 fill-none stroke-[#b78a66]"
            strokeWidth="2"
          >
            <path d="M22 86V55h76v31M30 55V38h60v17M32 86v10m56-10v10M46 38V25h28v13" />
            <circle
              cx="60"
              cy="60"
              r="48"
              strokeDasharray="3 7"
              opacity=".45"
            />
          </svg>
        </div>
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[.35em] text-[#9a6944]">
            Item unavailable
          </p>
          <h1 className="mt-4 text-3xl font-semibold text-[#2b1b11] sm:text-5xl">
            This piece has left the collection.
          </h1>
          <p className="mt-5 text-sm leading-7 text-[#786454]">
            It may be archived, sold out permanently, or the link may be
            incorrect. Discover a similar design in our current collection.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              href="/store"
              className="rounded-full bg-[#2b1b11] px-7 py-3 text-sm font-semibold text-white hover:bg-[#8b5e3c]"
            >
              Browse collection
            </Link>
            <Link
              href="/"
              className="rounded-full border border-[#cdb9a6] px-7 py-3 text-sm font-semibold"
            >
              Home
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
