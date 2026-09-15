"use client";
import { useEffect, useState } from "react";
import { FiChevronLeft, FiChevronRight, FiStar } from "react-icons/fi";
import Link from "next/link";
import Image from "next/image";
import { useDispatch, useSelector } from "react-redux";
import { useRouter } from "next/navigation";
import { addToCart, isOutOfStock } from "@/redux/fetures/cartSlice";
import { client } from "@/utils/helper";
import AddToCartBtn from "./AddToCartBtn";
import WishlistButton from "./WishlistButton";
export function ProductActions({ product }) {
  const dispatch = useDispatch(),
    router = useRouter();
  const cart = useSelector((state) => state.cart);
  const item = cart.item.find((item) => item._id === product._id);
  const unavailable =
    isOutOfStock(product) || Boolean(item && isOutOfStock(item));
  async function buy() {
    try {
      if (!item) await dispatch(addToCart(product));
      router.push("/checkout");
    } catch {
      /* Cart state displays the error toast. */
    }
  }
  return (
    <div className="mt-5 sm:mt-6 grid grid-cols-[1fr_1fr_auto] items-center gap-2 sm:flex sm:flex-wrap sm:gap-3">
      <AddToCartBtn product={product} />
      <button
        type="button"
        disabled={
          unavailable ||
          !cart.ready ||
          cart.busy ||
          Object.keys(cart.pending || {}).length > 0 ||
          cart.item.some(
            (entry) =>
              isOutOfStock(entry) ||
              entry.quantity > Number(entry.stockQuantity),
          )
        }
        onClick={buy}
        className="min-h-10 rounded-lg cursor-pointer border border-[#8b5e3c] px-3 sm:px-5 py-2 sm:py-3 text-xs sm:text-sm text-[#8b5e3c] disabled:opacity-40 disabled:cursor-not-allowed"
      >
        Buy now
      </button>
      <WishlistButton id={product._id} />
    </div>
  );
}

export function ProductGallery({ product }) {
  const images = [
    ...new Set([product.thumbnail, ...(product.images || [])].filter(Boolean)),
  ];
  const [selected, setSelected] = useState(0);
  const index = Math.min(selected, Math.max(0, images.length - 1));
  return (
    <div className="min-w-0" aria-label="Product images">
      <div className="relative flex aspect-[4/3] sm:aspect-square items-center justify-center overflow-hidden rounded-xl sm:rounded-2xl border border-[#e8ded0] bg-[#f3ede5]">
        {images.length ? (
          <Image
            src={images[index]}
            alt={`${product.title}, view ${index + 1}`}
            fill
            sizes="(max-width: 640px) 100vw, 50vw"
            className="object-contain p-3 sm:p-5"
          />
        ) : (
          <p className="text-sm text-[#786454]">Image coming soon</p>
        )}
        {images.length > 1 && (
          <>
            <button
              type="button"
              aria-label="Previous product image"
              onClick={() =>
                setSelected((index - 1 + images.length) % images.length)
              }
              className="absolute left-3 rounded-full border border-[#e8ded0] bg-[#fffdfa] p-2 text-[#8b5e3c] focus-visible:outline-2"
            >
              <FiChevronLeft />
            </button>
            <button
              type="button"
              aria-label="Next product image"
              onClick={() => setSelected((index + 1) % images.length)}
              className="absolute right-3 rounded-full border border-[#e8ded0] bg-[#fffdfa] p-2 text-[#8b5e3c] focus-visible:outline-2"
            >
              <FiChevronRight />
            </button>
          </>
        )}
      </div>
      {images.length > 1 && (
        <div
          className="mt-4 flex gap-3 overflow-x-auto pb-2"
          aria-label="Choose product image"
        >
          {images.map((src, i) => (
            <button
              type="button"
              aria-label={`View image ${i + 1}`}
              aria-pressed={i === index}
              key={src}
              onClick={() => setSelected(i)}
              className={`relative h-16 w-16 shrink-0 overflow-hidden rounded-xl border-2 bg-[#faf8f4] p-1 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#8b5e3c] sm:h-20 sm:w-20 ${i === index ? "border-[#8b5e3c]" : "border-transparent hover:border-[#d8c8b8]"}`}
            >
              <Image
                src={src}
                alt=""
                fill
                sizes="80px"
                className="object-contain p-1"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
export function ProductExtras({ product }) {
  const [reviews, setReviews] = useState(null),
    [variants, setVariants] = useState([]),
    [pin, setPin] = useState(""),
    [message, setMessage] = useState(""),
    [busy, setBusy] = useState(false),
    [rating, setRating] = useState(5),
    [hoverRating, setHoverRating] = useState(0);
  useEffect(() => {
    client
      .get("commerce/reviews/product/" + product._id)
      .then((r) => setReviews(r.data))
      .catch(() => setReviews({ data: [], error: true }));
    if (product.variantGroup)
      client
        .get("product", { params: { variantGroup: product.variantGroup } })
        .then((r) => setVariants(r.data.data))
        .catch(() => {});
  }, [product._id, product.variantGroup]);
  async function submit(e) {
    e.preventDefault();
    const data = Object.fromEntries(new FormData(e.currentTarget));
    setBusy(true);
    try {
      const r = await client.post("commerce/reviews/product/" + product._id, {
        rating: Number(data.rating),
        comment: data.comment,
      });
      setMessage(r.data.message);
    } catch (e) {
      setMessage(e.response?.data?.message || "Unable to submit review");
    } finally {
      setBusy(false);
    }
  }
  return (
    <section className="mt-6 bg-[#fffdfa] border border-[#e8ded0] rounded-2xl p-5 sm:p-8 space-y-6 text-[#5c4535] [&_input]:max-w-full [&_input]:rounded-lg [&_input]:border-[#d8c8b8] [&_input]:bg-[#faf8f4] [&_input]:focus-visible:outline-[#8b5e3c] [&_button]:focus-visible:outline-2 [&_button]:focus-visible:outline-offset-2 [&_button]:focus-visible:outline-[#8b5e3c]">
      <div>
        <h2 className="mb-5 text-xl font-medium text-[#2b1b11]">
          Details & specifications
        </h2>
        <dl className="grid gap-x-8 sm:grid-cols-2">
          {["material", "color", "sku", "warranty", "assembly"]
            .filter((key) => product[key])
            .map((key) => (
              <div
                key={key}
                className="flex justify-between gap-4 border-b border-[#e8ded0] py-3 text-sm"
              >
                <dt className="capitalize text-[#786454]">{key}</dt>
                <dd className="text-right font-medium">{product[key]}</dd>
              </div>
            ))}
          {["length", "width", "height"]
            .filter((key) => product.dimensions?.[key] > 0)
            .map((key) => (
              <div
                key={key}
                className="flex justify-between gap-4 border-b border-[#e8ded0] py-3 text-sm"
              >
                <dt className="capitalize text-[#786454]">{key}</dt>
                <dd>
                  {product.dimensions[key]} {product.dimensions.unit || "cm"}
                </dd>
              </div>
            ))}
          {product.weight?.value > 0 && (
            <div className="flex justify-between gap-4 border-b border-[#e8ded0] py-3 text-sm">
              <dt className="text-[#786454]">Weight</dt>
              <dd>
                {product.weight.value} {product.weight.unit || "kg"}
              </dd>
            </div>
          )}
        </dl>
      </div>
      {variants.length > 1 && (
        <div>
          Other options:{" "}
          {variants.map((p) => (
            <Link
              key={p._id}
              className="underline mx-2"
              href={"/store/" + p._id}
            >
              {p.color || p.title}
            </Link>
          ))}
        </div>
      )}
      <form
        onSubmit={async (e) => {
          e.preventDefault();
          try {
            const { data } = await client.get("commerce/delivery", {
              params: {
                pincode: pin,
                subtotal: product.salePrice || product.price,
              },
            });
            setMessage(
              "Delivery in " +
                data.data.daysMin +
                "–" +
                data.data.daysMax +
                " business days. Final delivery charge at checkout.",
            );
          } catch (e) {
            setMessage(e.response?.data?.message || "Unable to check delivery");
          }
        }}
      >
        <label>
          Delivery pincode{" "}
          <input
            required
            pattern="[1-9][0-9]{5}"
            maxLength={6}
            value={pin}
            onChange={(e) => setPin(e.target.value)}
            className="border rounded p-2"
          />
        </label>
        <button className="ml-3 underline">Check delivery</button>
      </form>
      <p role="status">{message}</p>
      <h2 className="text-xl">
        Customer reviews{" "}
        {reviews?.total > 0 &&
          "(" + reviews.total + ", " + reviews.rating.toFixed(1) + "/5)"}
      </h2>
      {!reviews ? (
        <p role="status" className="text-sm text-[#786454]">
          Loading reviews...
        </p>
      ) : reviews?.error ? (
        <p>Reviews could not be loaded.</p>
      ) : reviews?.data?.length === 0 ? (
        <p>No published reviews yet.</p>
      ) : (
        reviews?.data?.map((r) => (
          <blockquote key={r._id} className="border-b pb-3">
            <strong>
              {r.user?.name} · {r.rating}/5 · Verified purchase
            </strong>
            <p>{r.comment}</p>
          </blockquote>
        ))
      )}
      <form onSubmit={submit} className="space-y-3">
        <h3>Review your delivered purchase</h3>
        <fieldset>
          <legend className="mb-2 text-sm font-medium">Your rating</legend>
          <input type="hidden" name="rating" value={rating} />
          <div
            className="flex w-fit gap-1"
            onMouseLeave={() => setHoverRating(0)}
          >
            {[1, 2, 3, 4, 5].map((n) => (
              <button
                key={n}
                type="button"
                onMouseEnter={() => setHoverRating(n)}
                onFocus={() => setHoverRating(n)}
                onBlur={() => setHoverRating(0)}
                onClick={() => setRating(n)}
                aria-label={`${n} star${n > 1 ? "s" : ""}`}
                aria-pressed={rating === n}
                className="rounded-md p-1 text-[#d6c3b2] transition hover:scale-110"
              >
                <FiStar
                  aria-hidden="true"
                  size={30}
                  className={
                    (hoverRating || rating) >= n
                      ? "fill-[#d49336] text-[#d49336]"
                      : "fill-transparent"
                  }
                />
              </button>
            ))}
          </div>
          <p className="mt-1 text-xs text-[#786454]">
            {rating} out of 5 stars selected
          </p>
        </fieldset>
        <textarea
          required
          name="comment"
          maxLength={2000}
          aria-label="Your review"
          className="border rounded p-3 w-full"
          placeholder="Share your experience"
        />
        <button disabled={busy} className="bg-[#8b5e3c] text-white rounded p-3">
          {busy ? "Submitting…" : "Submit review"}
        </button>
      </form>
    </section>
  );
}
