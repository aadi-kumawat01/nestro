import Link from "next/link";
import { ArrowUpRight, UserRound } from "lucide-react";
export default function DashNavbar() {
  return (
    <header className="sticky top-0 z-40 border-b border-[#e8ded0] bg-[#fffdfa]">
      <div className="flex min-h-20 items-center justify-between gap-3 py-3 pl-16 pr-4 sm:pr-6 lg:px-8">
        <div className="min-w-0">
          <p className="text-sm font-semibold text-[#2b1b11] sm:text-base">
            Store workspace
          </p>
          <p className="mt-1 hidden text-xs text-[#786454] sm:block">
            Your catalog, customers and operations in one place.
          </p>
        </div>
        <div className="flex shrink-0 items-center gap-2 sm:gap-3">
          <Link
            href="/"
            className="flex items-center gap-2 rounded-lg border border-[#d8c8b8] px-3 py-2 text-xs font-medium text-[#8b5e3c] hover:bg-[#f3ede5] focus-visible:outline-2"
          >
            <span>View store</span>
            <ArrowUpRight size={15} />
          </Link>
          <Link
            href="/profile"
            title="Your account"
            aria-label="Your account"
            className="rounded-full border border-[#d8c8b8] bg-[#f3ede5] p-2 text-[#8b5e3c] hover:bg-[#e8ded0] focus-visible:outline-2"
          >
            <UserRound size={19} />
          </Link>
        </div>
      </div>
    </header>
  );
}
