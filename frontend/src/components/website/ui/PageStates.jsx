const Bone = ({ className = "" }) => (
  <div
    aria-hidden="true"
    className={`skeleton-shimmer rounded-xl bg-[#e9e1d8] ${className}`}
  />
);

export function PageSkeleton() {
  return (
    <div
      className="min-h-[70vh] bg-[#f6f2ec] px-3 py-5 sm:px-6 sm:py-9"
      role="status"
      aria-label="Loading page"
    >
      <div className="mx-auto max-w-[1200px] animate-pulse">
        <Bone className="h-3 w-24" />
        <Bone className="mt-4 h-9 w-3/5 max-w-md" />
        <Bone className="mt-3 h-4 w-4/5 max-w-xl" />
        <div className="mt-8 grid gap-4 md:grid-cols-3">
          <Bone className="h-52 md:col-span-2" />
          <Bone className="h-52" />
        </div>
        <span className="sr-only">Loading Nestro content…</span>
      </div>
    </div>
  );
}

export function CatalogSkeleton() {
  return (
    <div
      className="min-h-screen bg-[#efece6] px-2.5 py-4 sm:px-5 lg:px-6"
      role="status"
      aria-label="Loading products"
    >
      <div className="mx-auto max-w-[1540px] animate-pulse">
        <div className="flex items-center justify-between rounded-xl bg-white p-3 sm:p-5">
          <div>
            <Bone className="h-3 w-20" />
            <Bone className="mt-3 h-7 w-44" />
          </div>
          <Bone className="h-10 w-24" />
        </div>
        <div className="mt-4 flex gap-5">
          <Bone className="hidden h-[560px] w-[280px] shrink-0 lg:block" />
          <div className="grid min-w-0 flex-1 grid-cols-2 gap-x-2 gap-y-3 sm:gap-4 md:grid-cols-3 2xl:grid-cols-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <div
                key={i}
                className="overflow-hidden rounded-xl border border-[#e8ded0] bg-white p-2 sm:p-3"
              >
                <Bone className="aspect-square w-full" />
                <Bone className="mt-3 h-3 w-16" />
                <Bone className="mt-2 h-4 w-full" />
                <Bone className="mt-2 h-4 w-2/3" />
                <div className="mt-3 flex justify-between">
                  <Bone className="h-5 w-16" />
                  <Bone className="h-8 w-8 rounded-full" />
                </div>
              </div>
            ))}
          </div>
        </div>
        <span className="sr-only">Loading furniture collection…</span>
      </div>
    </div>
  );
}

export function ProductSkeleton() {
  return (
    <div
      className="min-h-screen bg-[#faf8f4] px-3 py-6 sm:px-6 sm:py-10"
      role="status"
      aria-label="Loading product"
    >
      <div className="mx-auto max-w-[1200px] animate-pulse">
        <Bone className="mb-5 h-4 w-28" />
        <div className="overflow-hidden rounded-2xl border border-[#e8ded0] bg-white p-3 sm:p-6">
          <div className="grid gap-7 lg:grid-cols-2">
            <Bone className="aspect-square w-full" />
            <div className="py-2 lg:py-8">
              <Bone className="h-3 w-24" />
              <Bone className="mt-5 h-10 w-4/5" />
              <Bone className="mt-3 h-10 w-3/5" />
              <Bone className="mt-8 h-4 w-full" />
              <Bone className="mt-3 h-4 w-5/6" />
              <Bone className="mt-8 h-9 w-32" />
              <div className="mt-7 flex gap-3">
                <Bone className="h-12 flex-1" />
                <Bone className="h-12 w-12" />
              </div>
            </div>
          </div>
        </div>
        <span className="sr-only">Loading product details…</span>
      </div>
    </div>
  );
}

export function AccountSkeleton() {
  return (
    <div
      className="min-h-[70vh] bg-[#faf8f5] px-3 py-6 sm:px-6 sm:py-10"
      role="status"
      aria-label="Loading account page"
    >
      <div className="mx-auto max-w-[1100px] animate-pulse">
        <Bone className="h-4 w-24" />
        <Bone className="mt-4 h-9 w-52" />
        <div className="mt-7 grid gap-5 lg:grid-cols-[1fr_360px]">
          <div className="space-y-3 rounded-2xl border border-[#e8ded0] bg-white p-4 sm:p-6">
            {Array.from({ length: 4 }).map((_, i) => (
              <div
                key={i}
                className="flex gap-4 border-b border-[#eee5dd] py-3 last:border-0"
              >
                <Bone className="h-16 w-16 shrink-0" />
                <div className="flex-1">
                  <Bone className="h-4 w-3/4" />
                  <Bone className="mt-3 h-3 w-1/2" />
                  <Bone className="mt-3 h-4 w-20" />
                </div>
              </div>
            ))}
          </div>
          <div className="rounded-2xl border border-[#e8ded0] bg-white p-5">
            <Bone className="h-6 w-32" />
            {Array.from({ length: 4 }).map((_, i) => (
              <Bone key={i} className="mt-5 h-4 w-full" />
            ))}
            <Bone className="mt-7 h-12 w-full" />
          </div>
        </div>
        <span className="sr-only">Loading your Nestro account…</span>
      </div>
    </div>
  );
}

export function AdminSkeleton() {
  return (
    <div
      className="min-h-[70vh] bg-[#faf8f4] p-4 sm:p-7"
      role="status"
      aria-label="Loading administration"
    >
      <div className="animate-pulse">
        <div className="flex justify-between gap-4">
          <div>
            <Bone className="h-8 w-48" />
            <Bone className="mt-3 h-4 w-64 max-w-full" />
          </div>
          <Bone className="h-11 w-32" />
        </div>
        <div className="mt-7 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div
              key={i}
              className="rounded-2xl border border-[#eadfd4] bg-white p-5"
            >
              <Bone className="h-3 w-20" />
              <Bone className="mt-5 h-8 w-24" />
            </div>
          ))}
        </div>
        <div className="mt-6 rounded-2xl border border-[#eadfd4] bg-white p-4 sm:p-6">
          <Bone className="h-6 w-40" />
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="mt-5 flex gap-4">
              <Bone className="h-10 w-10" />
              <Bone className="h-10 flex-1" />
            </div>
          ))}
        </div>
        <span className="sr-only">Loading administration…</span>
      </div>
    </div>
  );
}
