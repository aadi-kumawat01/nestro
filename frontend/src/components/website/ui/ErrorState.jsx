"use client";

import Link from "next/link";

export default function ErrorState({
  retry,
  reset,
  homeHref = "/",
  eyebrow = "A small pause",
  title = "This room needs a moment",
  message = "We couldn’t finish loading this page. Your information is safe—please try again.",
}) {
  const tryAgain = retry || reset;
  return (
    <main className="relative flex min-h-[72vh] items-center justify-center overflow-hidden bg-[#f6f1ea] px-4 py-14 text-[#2b1b11]">
      <div
        aria-hidden="true"
        className="absolute -left-20 top-10 h-56 w-56 rounded-full bg-[#c58b5c]/15 blur-3xl"
      />
      <div
        aria-hidden="true"
        className="absolute -right-16 bottom-10 h-64 w-64 rounded-full bg-[#8b5e3c]/10 blur-3xl"
      />
      <section className="relative w-full max-w-2xl overflow-hidden rounded-[2rem] border border-[#dfd1c3] bg-white/90 p-7 text-center shadow-[0_24px_80px_rgba(66,42,25,.12)] backdrop-blur sm:p-12">
        <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full border border-[#dfc5ad] bg-[#f5ebe1]">
          <svg
            aria-hidden="true"
            viewBox="0 0 24 24"
            className="h-9 w-9 fill-none stroke-[#8b5e3c]"
            strokeWidth="1.5"
          >
            <path d="M12 7v6m0 4h.01" strokeLinecap="round" />
            <circle cx="12" cy="12" r="9" />
          </svg>
        </div>
        <p className="mt-7 text-[11px] font-semibold uppercase tracking-[.35em] text-[#9a6944]">
          {eyebrow}
        </p>
        <h1 className="mt-3 text-3xl font-semibold tracking-tight sm:text-5xl">
          {title}
        </h1>
        <p className="mx-auto mt-5 max-w-lg text-sm leading-7 text-[#786454] sm:text-base">
          {message}
        </p>
        <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
          {tryAgain && (
            <button
              onClick={() => tryAgain()}
              className="rounded-full bg-[#2b1b11] px-7 py-3 text-sm font-semibold text-white transition hover:-translate-y-0.5 hover:bg-[#8b5e3c] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#8b5e3c]"
            >
              Try again
            </button>
          )}
          <Link
            href={homeHref}
            className="rounded-full border border-[#cdb9a6] px-7 py-3 text-sm font-semibold transition hover:border-[#8b5e3c] hover:bg-[#f7efe7]"
          >
            {homeHref === "/admin" ? "Admin home" : "Return home"}
          </Link>
          <Link
            href="/contact"
            className="px-5 py-3 text-sm font-medium text-[#8b5e3c] underline-offset-4 hover:underline"
          >
            Contact support
          </Link>
        </div>
      </section>
    </main>
  );
}
