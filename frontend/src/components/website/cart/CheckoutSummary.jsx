"use client";

import Link from "next/link";

const finiteNumber = (value) => {
  if (value === null || value === undefined || value === "") return null;

  const number = Number(value);
  return Number.isFinite(number) ? number : null;
};

const nonnegative = (value) => {
  const number = finiteNumber(value);
  return number !== null && number >= 0 ? number : null;
};

const positiveInteger = (value) => {
  const number = finiteNumber(value);

  return number !== null && Number.isInteger(number) && number > 0
    ? number
    : null;
};

const money = (value) =>
  `₹${Number(value).toLocaleString("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;

const round = (value) => Math.round(Number(value) * 100) / 100;

const productId = (row) =>
  row?.product_id?._id ||
  row?.product_id ||
  row?.productId?._id ||
  row?.productId;

/*
  Redux item:
  {
    _id,
    name,
    originalPrice,
    salePrice,
    thumbnail,
    quantity
  }

  Quote item:
  {
    product_id,
    title,
    price,
    total,
    quantity
  }
*/
function summaryItems(items = [], quote = null) {
  if (!Array.isArray(items)) return [];

  return items
    .filter((item) => item?._id)
    .map((item) => {
      const quoted = Array.isArray(quote?.items)
        ? quote.items.find((row) => String(productId(row)) === String(item._id))
        : null;

      const quantity = positiveInteger(item.quantity);

      const cartOriginal = nonnegative(item.originalPrice);
      const cartSale = nonnegative(item.salePrice);

      // Quote price is authoritative when available.
      // Otherwise immediately use Redux cart price.
      const quotedPrice = nonnegative(quoted?.price);

      const unitPrice = quotedPrice ?? cartSale ?? cartOriginal;

      const originalPrice =
        cartOriginal !== null && unitPrice !== null && cartOriginal > unitPrice
          ? cartOriginal
          : null;

      const localTotal =
        unitPrice !== null && quantity !== null
          ? round(unitPrice * quantity)
          : null;

      const quotedTotal = nonnegative(quoted?.total);

      return {
        id: item._id,
        title: quoted?.title || item.name || "Unavailable product",
        thumbnail: quoted?.thumbnail || item.thumbnail,
        quantity,
        unitPrice,

        // Never let a missing quote blank a usable local total.
        total: quotedTotal ?? localTotal,

        originalPrice,
      };
    });
}

export function matchesCartQuote(quote, items = []) {
  if (
    !quote ||
    !Array.isArray(quote.items) ||
    !Array.isArray(items) ||
    items.length === 0 ||
    quote.items.length !== items.length
  ) {
    return false;
  }

  const cartMatches = items.every((item) => {
    const row = quote.items.find(
      (quoteItem) => String(productId(quoteItem)) === String(item._id),
    );

    if (!row) return false;

    return (
      Number(row.quantity) === Number(item.quantity) &&
      nonnegative(row.price) !== null &&
      nonnegative(row.total) !== null
    );
  });

  if (!cartMatches) return false;

  return (
    nonnegative(quote.subtotal) !== null &&
    nonnegative(quote.totalAmount) !== null &&
    nonnegative(quote.shippingCharge) !== null
  );
}

export default function CheckoutSummary({
  cart,
  quote,
  quoting = false,
  hasAddress = false,
  quoteError = "",
}) {
  if (!cart?.ready) {
    return (
      <div
        role="status"
        aria-label="Loading order summary"
        className="space-y-4"
      >
        <p className="text-sm text-[#786454]">Loading your cart...</p>

        {[0, 1].map((key) => (
          <div key={key} aria-hidden="true" className="flex gap-3">
            <div className="h-16 w-16 rounded-xl bg-[#f3ede5]" />

            <div className="flex-1 space-y-3 py-2">
              <div className="h-3 w-3/4 rounded bg-[#f3ede5]" />
              <div className="h-3 w-1/2 rounded bg-[#f3ede5]" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (!Array.isArray(cart.item) || !cart.item.length) {
    return (
      <div className="py-6 text-center">
        <p className="text-lg font-medium">Your cart is empty</p>

        <p className="mt-2 text-sm text-[#786454]">
          Find the perfect pieces for your home.
        </p>

        <Link
          href="/store"
          className="mt-5 inline-flex rounded-xl bg-[#8b5e3c] px-6 py-3 text-sm font-semibold text-white hover:bg-[#70482e]"
        >
          Browse Store
        </Link>
      </div>
    );
  }

  /*
    Quote is only authoritative when it still exactly matches
    the current Redux cart.

    IMPORTANT:
    Rows themselves do NOT depend on quote availability.
  */
  const validQuote = quote && matchesCartQuote(quote, cart.item) ? quote : null;

  const rows = summaryItems(cart.item, validQuote);

  /*
    Local subtotal should always be available as soon as
    Redux contains valid product prices.
  */
  const localSubtotal =
    rows.length > 0 && rows.every((row) => row.total !== null)
      ? round(rows.reduce((sum, row) => sum + Number(row.total), 0))
      : null;

  const quotedSubtotal = nonnegative(validQuote?.subtotal);

  const subtotal = quotedSubtotal ?? localSubtotal;

  const savings = round(
    rows.reduce((sum, row) => {
      if (
        row.originalPrice === null ||
        row.unitPrice === null ||
        row.quantity === null
      ) {
        return sum;
      }

      return (
        sum + Math.max(0, (row.originalPrice - row.unitPrice) * row.quantity)
      );
    }, 0),
  );

  const couponDiscount = nonnegative(validQuote?.couponDiscount) ?? 0;

  const shippingCharge = nonnegative(validQuote?.shippingCharge);

  const totalAmount = nonnegative(validQuote?.totalAmount);

  return (
    <>
      <div className="space-y-4">
        {rows.map((row) => (
          <div key={row.id} className="flex items-start gap-3">
            <div className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-[#f3ede5]">
              {row.thumbnail ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={row.thumbnail}
                  alt={row.title}
                  className="h-full w-full object-cover"
                />
              ) : (
                <span className="text-[10px] tracking-wider text-[#8b5e3c]">
                  NESTRO
                </span>
              )}
            </div>

            <div className="min-w-0 flex-1">
              <p className="break-words text-sm font-medium leading-5">
                {row.title}
              </p>

              <p className="mt-1 text-xs text-[#786454]">
                Quantity: {row.quantity !== null ? row.quantity : "Unavailable"}
              </p>

              <div className="mt-1 flex flex-wrap gap-x-2 text-xs">
                <span>
                  {row.unitPrice !== null
                    ? `${money(row.unitPrice)} each`
                    : "Price unavailable"}
                </span>

                {row.originalPrice !== null && (
                  <del className="text-[#786454]">
                    {money(row.originalPrice)}
                  </del>
                )}
              </div>
            </div>

            <span className="max-w-28 break-words text-right text-sm font-medium">
              {row.total !== null ? money(row.total) : "Unavailable"}
            </span>
          </div>
        ))}
      </div>

      <dl className="mt-6 space-y-3 border-t border-[#e8ded0] pt-5 text-sm">
        <Row
          label={validQuote ? "Subtotal" : "Items subtotal"}
          value={subtotal !== null ? money(subtotal) : "Price unavailable"}
        />

        {savings > 0 && (
          <Row label="Product savings" value={`−${money(savings)}`} />
        )}

        {validQuote && couponDiscount > 0 && (
          <Row label="Coupon discount" value={`−${money(couponDiscount)}`} />
        )}

        <Row
          label="Shipping"
          value={
            validQuote
              ? shippingCharge === 0
                ? "Free"
                : shippingCharge !== null
                  ? money(shippingCharge)
                  : "Awaiting confirmation"
              : hasAddress
                ? "Awaiting confirmation"
                : "Select delivery address"
          }
        />

        <div className="border-t border-[#e8ded0] pt-4 text-base font-semibold">
          <Row
            label="Total payable"
            value={
              validQuote && totalAmount !== null
                ? money(totalAmount)
                : "Awaiting confirmation"
            }
          />
        </div>
      </dl>

      <p role="status" className="mt-3 text-xs leading-5 text-[#786454]">
        {quoting
          ? "Confirming shipping, discounts and final payable total..."
          : validQuote
            ? "Final payable total confirmed by the store."
            : quoteError
              ? "Item prices are shown from your cart. Shipping and final payable total could not be confirmed."
              : "Item prices update immediately with your cart. Shipping and final payable total are confirmed before payment."}
      </p>
    </>
  );
}

function Row({ label, value }) {
  return (
    <div className="flex justify-between gap-4">
      <dt>{label}</dt>
      <dd className="text-right">{value}</dd>
    </div>
  );
}
