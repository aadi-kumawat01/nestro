import Link from "next/link";
export const metadata = {
  title: "Page Not Found",
  robots: { index: false, follow: true },
};
export default function NotFound() {
  return (
    <main className="relative flex min-h-[72vh] items-center justify-center overflow-hidden bg-[#f6f1ea] px-4 py-14 text-[#2b1b11]">
      <div className="absolute inset-0 opacity-40 [background-image:radial-gradient(#cdb9a6_1px,transparent_1px)] [background-size:22px_22px]" />
      <section className="relative w-full max-w-3xl rounded-[2rem] border border-[#dfd1c3] bg-[#fffdfa]/95 p-8 text-center shadow-[0_24px_80px_rgba(66,42,25,.12)] sm:p-14">
        <p className="text-7xl font-light tracking-[-.08em] text-[#c59a77] sm:text-9xl">
          404
        </p>
        <p className="mt-4 text-[11px] font-semibold uppercase tracking-[.35em] text-[#9a6944]">
          The room is empty
        </p>
        <h1 className="mt-3 text-3xl font-semibold sm:text-5xl">
          We couldn’t find that piece.
        </h1>
        <p className="mx-auto mt-5 max-w-xl text-sm leading-7 text-[#786454] sm:text-base">
          The page may have moved, or the link may no longer be available.
          Explore our furniture collection instead.
        </p>
        <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
          <Link
            href="/store"
            className="rounded-full bg-[#2b1b11] px-7 py-3 text-sm font-semibold text-white transition hover:bg-[#8b5e3c]"
          >
            Explore furniture
          </Link>
          <Link
            href="/"
            className="rounded-full border border-[#cdb9a6] px-7 py-3 text-sm font-semibold hover:bg-[#f7efe7]"
          >
            Back to homepage
          </Link>
        </div>
      </section>
    </main>
  );
}
