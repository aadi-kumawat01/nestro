"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useDispatch, useSelector } from "react-redux";
import { FiLoader, FiShield } from "react-icons/fi";
import { toast } from "sonner";
import { client } from "@/utils/helper";
import {
  refreshCart,
  cannotCheckout,
  isOutOfStock,
} from "@/redux/fetures/cartSlice";
import {
  removeOrderedWishlistItems,
  isSuccessfulWishlistOrder,
} from "@/redux/fetures/wishlistSlice";
import CheckoutSummary, {
  matchesCartQuote,
} from "@/components/website/cart/CheckoutSummary";
import useOrderPayment from "@/components/website/orders/useOrderPayment";
import { playOrderSuccessSound } from "@/utils/sound";

const inputStyle =
  "w-full rounded-xl border border-[#d8c8b8] bg-[#faf8f4] px-4 py-3 text-sm outline-none focus:border-[#8b5e3c] focus:ring-2 focus:ring-[#8b5e3c]/20";

export default function CheckoutPage() {
  const cart = useSelector((state) => state.cart),
    user = cart.user;
  const dispatch = useDispatch(),
    router = useRouter();
  const { pay, isLoading: paymentLoading } = useOrderPayment();
  const [addressId, setAddressId] = useState(null);
  const addresses = user?.addresses || [];
  const address =
    addresses.find((item) => item._id === addressId) ||
    addresses.find((item) => item.isDefault) ||
    addresses[0];
  const [method, setMethod] = useState("cod");
  const [couponInput, setCouponInput] = useState(""),
    [coupon, setCoupon] = useState("");
  const [billing, setBilling] = useState({ businessName: "", gstin: "" });
  const [quoteState, setQuoteState] = useState(null),
    [retry, setRetry] = useState(0);
  const [placing, setPlacing] = useState(false),
    lock = useRef(false);
  const [error, setError] = useState(""),
    [orderId, setOrderId] = useState(null);
  const blocked = cannotCheckout(cart);
  const stockBlocked = cart.item.some(
    (item) => isOutOfStock(item) || item.quantity > Number(item.stockQuantity),
  );
  const userId = user?._id,
    pincode = address?.pincode;
  const cartSignature = JSON.stringify(
    cart.item.map((item) => [
      item._id,
      item.quantity,
      item.salePrice,
      item.originalPrice,
      item.stock,
      item.stockQuantity,
    ]),
  );
  const quoteKey = JSON.stringify([
    userId,
    pincode,
    cart.revision,
    cartSignature,
    coupon,
    retry,
    blocked,
  ]);
  const current = quoteState?.key === quoteKey ? quoteState : null;
  const quote =
    !blocked && matchesCartQuote(current?.data, cart.item)
      ? current.data
      : null;
  const quoting = Boolean(userId && pincode && !blocked && !current);
  const paymentMethod = quote?.codAvailable === false ? "online" : method;

  useEffect(() => {
    if (!userId || !pincode || blocked) return;
    const controller = new AbortController();
    client
      .post(
        "order/quote",
        { pincode, couponCode: coupon },
        { signal: controller.signal },
      )
      .then(({ data }) => {
        if (!controller.signal.aborted)
          setQuoteState({
            key: quoteKey,
            data: data.success ? data.data : null,
            error: data.success
              ? ""
              : data.message || "Unable to calculate your order.",
          });
      })
      .catch((e) => {
        if (!controller.signal.aborted)
          setQuoteState({
            key: quoteKey,
            error:
              e.response?.data?.message ||
              "Unable to calculate your order. Please retry.",
          });
      });
    return () => controller.abort();
  }, [userId, pincode, coupon, blocked, quoteKey]);

  async function placeOrder() {
    if (
      lock.current ||
      blocked ||
      !quote ||
      !address ||
      !user ||
      orderId ||
      (paymentMethod === "online" && paymentLoading)
    )
      return;
    lock.current = true;
    setPlacing(true);
    setError("");
    let createdId;
    try {
      const fresh = await dispatch(refreshCart());
      if (
        !fresh ||
        cannotCheckout(fresh) ||
        fresh.revision !== quote.cartRevision
      )
        throw new Error(
          "Cart or stock changed. Please review the refreshed summary.",
        );
      const body = {
        paymentMethod,
        shippingAddress: address,
        couponCode: coupon,
        cartRevision: quote.cartRevision,
        amountPaise: quote.amountPaise,
        billing,
      };
      // Amount is a quote acknowledgement only: the backend rebuilds and checks it.
      const fingerprint = JSON.stringify(body),
        storageKey = `nestro:checkout:${user._id}`;
      let saved;
      try {
        saved = JSON.parse(sessionStorage.getItem(storageKey));
      } catch {
        /* A new request gets a fresh key. */
      }
      if (saved?.fingerprint !== fingerprint) {
        saved = { fingerprint, key: crypto.randomUUID() };
        sessionStorage.setItem(storageKey, JSON.stringify(saved));
      }
      const { data } = await client.post("order/place", body, {
        headers: { "Idempotency-Key": saved.key },
      });
      if (!data.success || !data.orderId)
        throw new Error(data.message || "Your order could not be created.");
      createdId = String(data.orderId);
      setOrderId(createdId);
      let result = data;
      if (paymentMethod === "online" && data.paymentStatus !== "paid") {
        if (!data.razorpayOrderId)
          throw new Error(
            data.message ||
              "Payment setup is pending. Open your order to resume safely.",
          );
        result = await pay(data, user);
      }
      if (
        !result.success ||
        !isSuccessfulWishlistOrder({ ...result, paymentMethod })
      )
        throw new Error(
          result.message ||
            "Payment is awaiting confirmation. Check your order status before retrying.",
        );
      if (paymentMethod === "cod")
        await dispatch(removeOrderedWishlistItems(createdId));
      sessionStorage.removeItem(storageKey);
      await dispatch(refreshCart());
      playOrderSuccessSound();
      toast.success(
        paymentMethod === "cod"
          ? "COD order placed successfully"
          : "Payment verified. Order confirmed",
      );
      router.push(`/orders/${createdId}`);
    } catch (e) {
      const message =
        e.response?.data?.message ||
        e.message ||
        "Unable to complete checkout.";
      setError(message);
      toast.error(message);
      if (!createdId) setRetry((value) => value + 1);
    } finally {
      lock.current = false;
      setPlacing(false);
    }
  }

  return (
    <section className="min-h-[70vh] bg-[#faf8f4] px-4 py-10 text-[#2b1b11] sm:px-8 lg:py-14">
      <div className="mx-auto max-w-6xl">
        <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="mb-3 text-xs font-semibold uppercase tracking-[0.25em] text-[#8b5e3c]">
              The finishing touch
            </p>
            <h1 className="text-3xl font-medium sm:text-4xl">Checkout</h1>
            <p className="mt-3 text-sm text-[#786454]">
              Review your pieces and choose how to pay.
            </p>
          </div>
          <span className="flex items-center gap-2 text-xs text-[#786454]">
            <FiShield />
            Secure checkout
          </span>
        </div>
        {!cart.ready ? (
          <div className="rounded-2xl border border-[#e8ded0] bg-[#fffdfa] p-6">
            <CheckoutSummary cart={cart} />
          </div>
        ) : !cart.item.length ? (
          <div className="rounded-2xl border border-[#e8ded0] bg-[#fffdfa] p-6">
            <CheckoutSummary cart={cart} />
          </div>
        ) : !user ? (
          <div>
            <p className="rounded-xl border border-[#e8ded0] bg-[#fffdfa] p-6">
              Please{" "}
              <Link
                className="text-[#8b5e3c] underline"
                href="/sign-in?next=/checkout"
              >
                sign in
              </Link>{" "}
              to complete checkout.
            </p>
            <aside className="mt-6 rounded-2xl border border-[#e8ded0] bg-[#fffdfa] p-6">
              <h2 className="mb-5 text-xl font-medium">Order summary</h2>
              <CheckoutSummary cart={cart} />
            </aside>
          </div>
        ) : (
          <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_390px]">
            <div className="min-w-0 space-y-6">
              <fieldset
                disabled={placing || Boolean(orderId)}
                className="rounded-2xl border border-[#e8ded0] bg-[#fffdfa] p-5 sm:p-7"
              >
                <legend className="sr-only">
                  Delivery and payment details
                </legend>
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <h2 className="text-xl font-medium">Delivery address</h2>
                  <Link
                    href="/profile?tab=addresses&addAddress=true"
                    className="text-sm text-[#8b5e3c] underline underline-offset-4"
                  >
                    Add new address
                  </Link>
                </div>
                {addresses.length ? (
                  <div className="mt-5 grid gap-3 sm:grid-cols-2">
                    {addresses.map((item) => (
                      <label
                        key={item._id}
                        className={`flex cursor-pointer items-start gap-3 rounded-xl border p-4 text-sm ${item._id === address?._id ? "border-[#8b5e3c] bg-[#f3ede5]" : "border-[#e8ded0]"}`}
                      >
                        <input
                          type="radio"
                          name="address"
                          className="mt-1 accent-[#8b5e3c]"
                          checked={item._id === address?._id}
                          onChange={() => setAddressId(item._id)}
                        />
                        <span className="min-w-0 break-words leading-6">
                          <strong className="block">{item.fullName}</strong>
                          {item.addressLine}
                          <br />
                          {item.city}, {item.state} {item.pincode}
                          <br />
                          {item.country}
                          <br />
                          {item.mobile}
                        </span>
                      </label>
                    ))}
                  </div>
                ) : (
                  <p className="mt-5 rounded-xl border border-dashed border-[#d8c8b8] p-6 text-sm text-[#786454]">
                    Add a delivery address to calculate shipping and continue.
                  </p>
                )}
                <div className="mt-7 border-t border-[#e8ded0] pt-6">
                  <label
                    htmlFor="coupon"
                    className="mb-2 block text-sm font-medium"
                  >
                    Coupon code
                  </label>
                  <div className="flex flex-wrap gap-2">
                    <input
                      id="coupon"
                      value={couponInput}
                      onChange={(e) => setCouponInput(e.target.value)}
                      className={`${inputStyle} min-w-0 flex-1`}
                    />
                    <button
                      type="button"
                      onClick={() => {
                        setCoupon(couponInput.trim().toUpperCase());
                        setRetry((value) => value + 1);
                      }}
                      className="rounded-xl border border-[#8b5e3c] px-4 text-sm text-[#8b5e3c]"
                    >
                      Apply
                    </button>
                    {coupon && (
                      <button
                        type="button"
                        onClick={() => {
                          setCoupon("");
                          setCouponInput("");
                        }}
                        className="text-sm underline"
                      >
                        Remove
                      </button>
                    )}
                  </div>
                </div>
                <details className="mt-5 text-sm">
                  <summary className="cursor-pointer text-[#786454]">
                    Business invoice (optional)
                  </summary>
                  <div className="mt-3 grid gap-3 sm:grid-cols-2">
                    <label>
                      Business name
                      <input
                        className={inputStyle}
                        value={billing.businessName}
                        onChange={(e) =>
                          setBilling({
                            ...billing,
                            businessName: e.target.value,
                          })
                        }
                      />
                    </label>
                    <label>
                      GSTIN
                      <input
                        className={inputStyle}
                        maxLength={15}
                        value={billing.gstin}
                        onChange={(e) =>
                          setBilling({ ...billing, gstin: e.target.value })
                        }
                      />
                    </label>
                  </div>
                </details>
                <div className="mt-7 border-t border-[#e8ded0] pt-6">
                  <h2 className="text-xl font-medium">Payment method</h2>
                  <div className="mt-4 space-y-3">
                    {[
                      [
                        "cod",
                        "Cash on Delivery",
                        quote?.codAvailable === false
                          ? `Available up to ₹${Number(quote?.codMaxOrderValue || 50000).toLocaleString("en-IN")}`
                          : "Pay when your order arrives",
                      ],
                      [
                        "online",
                        "Pay online",
                        "UPI, cards and netbanking via Razorpay",
                      ],
                    ].map(([value, title, description]) => (
                      <label
                        key={value}
                        className={`flex items-center gap-3 rounded-xl border p-4 ${paymentMethod === value ? "border-[#8b5e3c] bg-[#f3ede5]" : "border-[#e8ded0]"}`}
                      >
                        <input
                          type="radio"
                          name="payment"
                          className="accent-[#8b5e3c]"
                          disabled={
                            value === "cod" && quote?.codAvailable === false
                          }
                          checked={paymentMethod === value}
                          onChange={() => setMethod(value)}
                        />
                        <span>
                          <strong className="block text-sm">{title}</strong>
                          <span className="text-xs text-[#786454]">
                            {description}
                          </span>
                        </span>
                      </label>
                    ))}
                  </div>
                </div>
              </fieldset>
              {stockBlocked && (
                <p
                  role="alert"
                  className="rounded-xl bg-[#f8eae5] p-4 text-sm text-[#9b3f2e]"
                >
                  Out of Stock or insufficient stock.{" "}
                  <Link href="/cart" className="underline">
                    Update your cart
                  </Link>{" "}
                  before checkout.
                </p>
              )}
              {(error || current?.error) && (
                <div
                  role="alert"
                  className="rounded-xl border border-[#e8ded0] bg-[#fffdfa] p-4 text-sm text-[#9b3f2e]"
                >
                  {error || current.error}
                  {!orderId && (
                    <button
                      type="button"
                      onClick={() => {
                        setError("");
                        setRetry((value) => value + 1);
                      }}
                      className="ml-3 underline"
                    >
                      Refresh summary
                    </button>
                  )}
                </div>
              )}
              {orderId && !placing && (
                <Link
                  href={`/orders/${orderId}`}
                  className="block rounded-xl border border-[#8b5e3c] p-4 text-sm font-medium text-[#8b5e3c]"
                >
                  View your order / resume payment
                </Link>
              )}
            </div>
            <aside className="rounded-2xl border border-[#e8ded0] bg-[#fffdfa] p-5 sm:p-7 lg:sticky lg:top-24">
              <h2 className="mb-5 text-xl font-medium">Order summary</h2>
              <CheckoutSummary
                cart={cart}
                quote={quote}
                quoting={quoting}
                hasAddress={Boolean(address)}
                quoteError={current?.error}
              />
              <button
                type="button"
                onClick={placeOrder}
                disabled={
                  blocked ||
                  !quote ||
                  !address ||
                  placing ||
                  Boolean(orderId) ||
                  (paymentMethod === "online" && paymentLoading)
                }
                aria-busy={placing}
                className="mt-6 flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-[#8b5e3c] px-4 py-3 text-sm font-semibold text-white hover:bg-[#70482e] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#8b5e3c] disabled:cursor-not-allowed disabled:opacity-50"
              >
                {placing && (
                  <FiLoader className="animate-spin" aria-hidden="true" />
                )}
                {placing
                  ? "Processing your order..."
                  : paymentMethod === "cod"
                    ? "Place COD Order"
                    : paymentLoading
                      ? "Loading secure payment..."
                      : "Pay online"}
              </button>
            </aside>
          </div>
        )}
      </div>
    </section>
  );
}
