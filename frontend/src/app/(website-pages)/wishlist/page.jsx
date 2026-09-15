"use client";
import Link from "next/link";
import { FiHeart } from "react-icons/fi";
import { useDispatch, useSelector } from "react-redux";
import { loadWishlist } from "@/redux/fetures/wishlistSlice";
import ProductCard from "@/components/website/store-components/ProductCard";
export default function Page() {
  const dispatch = useDispatch();
  const { user, ready } = useSelector((state) => state.cart);
  const wishlist = useSelector((state) => state.wishlist);
  const loading =
    !ready ||
    (user &&
      (wishlist.userId !== user._id ||
        ["idle", "loading"].includes(wishlist.status)));
  const items = user?._id === wishlist.userId ? wishlist.items : [];
  const buttonStyle =
    "inline-flex min-h-12 items-center justify-center rounded-lg bg-[#8b5e3c] px-7 py-3 text-sm font-medium text-white transition hover:bg-[#70482e] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#8b5e3c]";
  return (
    <section
      aria-labelledby="wishlist-heading"
      className="min-h-[70vh] px-2.5 py-6 sm:px-8 sm:py-10 lg:px-12 bg-[#faf8f4] text-[#2b1b11]"
    >
      {loading ? (
        <div role="status" className="py-24 text-center text-[#786454]">
          <h1 id="wishlist-heading" className="text-2xl mb-4">
            Your wishlist
          </h1>
          Loading your saved pieces...
        </div>
      ) : user && wishlist.status === "error" ? (
        <div className="py-24 text-center">
          <h1 id="wishlist-heading" className="text-3xl mb-4">
            Your wishlist
          </h1>
          <p role="alert" className="mb-6 text-[#786454]">
            {wishlist.error}
          </p>
          <button
            onClick={() => dispatch(loadWishlist(true))}
            className={buttonStyle}
          >
            Try again
          </button>
        </div>
      ) : items.length === 0 ? (
        <div className="mx-auto flex min-h-[55vh] max-w-lg flex-col items-center justify-center text-center">
          <div className="mb-7 flex h-24 w-24 items-center justify-center rounded-full border border-[#e8ded0] bg-[#f3ede5]">
            <FiHeart
              aria-hidden="true"
              className="h-11 w-11 text-[#8b5e3c]"
              strokeWidth={1.25}
            />
          </div>
          <h1
            id="wishlist-heading"
            className="text-3xl sm:text-4xl font-medium tracking-tight"
          >
            {user ? "Your wishlist is empty" : "Your wishlist awaits"}
          </h1>
          <p className="mt-4 max-w-sm text-sm sm:text-base leading-7 text-[#786454]">
            {user
              ? "Save the pieces you love and come back to them anytime."
              : "Sign in to save the pieces you love and find them here anytime."}
          </p>
          <Link
            href={user ? "/store" : "/sign-in?next=/wishlist"}
            className={`${buttonStyle} mt-8`}
          >
            {user ? "Create your wishlist" : "Sign in"}
          </Link>
          <Link
            href="/store"
            className="mt-5 rounded text-sm text-[#786454] underline underline-offset-4 hover:text-[#8b5e3c] focus-visible:outline-2 focus-visible:outline-offset-4"
          >
            Continue shopping
          </Link>
        </div>
      ) : (
        <>
          <div className="mb-8 flex flex-wrap items-end justify-between gap-4 border-b border-[#e8ded0] pb-6">
            <div>
              <p className="mb-2 text-xs uppercase tracking-[0.2em] text-[#8b5e3c]">
                Saved for later
              </p>
              <h1
                id="wishlist-heading"
                className="text-3xl sm:text-4xl font-medium"
              >
                Your wishlist
              </h1>
              <p aria-live="polite" className="mt-3 text-sm text-[#786454]">
                {items.length} {items.length === 1 ? "piece" : "pieces"} you
                love
              </p>
            </div>
            <Link
              href="/store"
              className="text-sm text-[#8b5e3c] underline underline-offset-4"
            >
              Continue shopping
            </Link>
          </div>
          <div className="grid grid-cols-2 gap-x-2 gap-y-3 sm:gap-5 md:grid-cols-3 xl:grid-cols-4">
            {items.map((product) => (
              <ProductCard key={product._id} product={product} compact />
            ))}
          </div>
        </>
      )}
    </section>
  );
}
