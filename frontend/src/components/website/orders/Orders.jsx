"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useDispatch, useSelector } from "react-redux";
import {
  ArrowLeft,
  RefreshCcw,
  CreditCard,
  Printer,
  ShoppingCart,
  MapPin,
  Store,
  Package,
  Truck,
  Clock3,
  ChevronLeft,
  ChevronRight,
  AlertTriangle,
  Banknote,
  ReceiptText,
  ExternalLink,
  Undo2,
  Loader2,
  Box,
} from "lucide-react";

import { toast } from "sonner";

import { client } from "@/utils/helper";

import { addToCart, refreshCart } from "@/redux/fetures/cartSlice";

import { removeOrderedWishlistItems } from "@/redux/fetures/wishlistSlice";

import useOrderPayment from "./useOrderPayment";

export const money = (value) =>
  `₹${Number(value || 0).toLocaleString("en-IN")}`;

const formatStatus = (value) => String(value || "").replaceAll("_", " ");

const formatDate = (value) => {
  if (!value) return "—";

  return new Date(value).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

const formatDateTime = (value) => {
  if (!value) return "—";

  return new Date(value).toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const fulfilmentStatuses = [
  "packed",
  "shipped",
  "out_for_delivery",
  "delivered",
  "return_approved",
  "returned",
];

export default function Orders({ admin = false }) {
  const [data, setData] = useState(null);

  const [error, setError] = useState("");

  const [page, setPage] = useState(1);

  useEffect(() => {
    let active = true;

    async function load() {
      try {
        setError("");

        const response = await client.get(admin ? "order/admin" : "order", {
          params: {
            page,
          },
        });

        if (active) {
          setData(response.data);
        }
      } catch (error) {
        if (active) {
          setError(error.response?.data?.message || "Unable to load orders");
        }
      }
    }

    void load();

    return () => {
      active = false;
    };
  }, [page, admin]);

  const orders = data?.data || [];

  const pages = Math.max(1, data?.pages || 1);

  return (
    <section className="w-full space-y-5">
      <div className="rounded-2xl border border-[#e8ded0] bg-[#fffdfa] p-5 shadow-sm sm:p-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[#9a6a43]">
              {admin ? "Order Operations" : "Your Purchases"}
            </p>

            <h1 className="mt-2 text-2xl font-semibold tracking-tight text-[#2b1b11]">
              {admin ? "Manage Orders" : "My Orders"}
            </h1>

            <p className="mt-1 text-sm text-[#786454]">
              {admin
                ? "Review customer orders, payments and fulfilment."
                : "Track your purchases, payments and delivery updates."}
            </p>
          </div>

          {data && (
            <span className="w-fit rounded-full bg-[#f3ede5] px-3 py-1.5 text-xs font-semibold text-[#8b5e3c]">
              Page {page} of {pages}
            </span>
          )}
        </div>
      </div>

      {error && (
        <div
          role="alert"
          className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
        >
          <AlertTriangle size={18} className="mt-0.5 shrink-0" />

          <span>{error}</span>
        </div>
      )}

      {!data && !error && (
        <div className="flex min-h-[180px] items-center justify-center rounded-2xl border border-[#e8ded0] bg-[#fffdfa]">
          <div className="text-center">
            <Loader2
              size={26}
              className="mx-auto animate-spin text-[#8b5e3c]"
            />

            <p className="mt-3 text-sm text-[#786454]">Loading orders...</p>
          </div>
        </div>
      )}

      {data && orders.length === 0 && (
        <div className="rounded-2xl border border-dashed border-[#d8c8b8] bg-[#fffdfa] px-6 py-12 text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-[#f3ede5] text-[#8b5e3c]">
            <Package size={24} />
          </div>

          <h2 className="mt-4 text-base font-semibold text-[#2b1b11]">
            No orders yet
          </h2>

          <p className="mt-2 text-sm text-[#786454]">
            {admin
              ? "There are no customer orders to display."
              : "Your furniture orders will appear here."}
          </p>

          {!admin && (
            <Link
              href="/store"
              className="mt-5 inline-flex min-h-10 items-center justify-center rounded-xl bg-[#8b5e3c] px-5 text-sm font-semibold text-white transition hover:bg-[#70482e]"
            >
              Browse Furniture
            </Link>
          )}
        </div>
      )}

      <div className="space-y-3">
        {orders.map((order) => (
          <Link
            key={order._id}
            href={(admin ? "/admin/orders/" : "/orders/") + order._id}
            className="
                                group
                                block
                                rounded-2xl
                                border
                                border-[#e8ded0]
                                bg-[#fffdfa]
                                p-4
                                shadow-sm
                                transition
                                hover:border-[#cdb9a5]
                                hover:shadow-md
                                sm:p-5
                            "
          >
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <strong className="text-[15px] text-[#2b1b11]">
                    Order #{order._id.slice(-8).toUpperCase()}
                  </strong>

                  <StatusPill status={order.orderStatus} />

                  <PaymentPill status={order.paymentStatus} />
                </div>

                <p className="mt-2 text-xs text-[#8f7a68]">
                  Placed on {formatDate(order.createdAt)}
                </p>

                <p className="mt-3 line-clamp-2 max-w-2xl text-sm leading-6 text-[#5c4535]">
                  {order.items
                    ?.map((item) => item.title || "Product")
                    .join(", ") || "Order items"}
                </p>
              </div>

              <div className="flex shrink-0 items-center justify-between gap-5 border-t border-[#eee5da] pt-4 lg:block lg:border-0 lg:pt-0 lg:text-right">
                <div>
                  <p className="text-[11px] uppercase tracking-[0.12em] text-[#9b897b]">
                    Order Total
                  </p>

                  <p className="mt-1 text-lg font-semibold text-[#2b1b11]">
                    {money(order.totalAmount)}
                  </p>
                </div>

                <span className="inline-flex items-center gap-1 text-xs font-semibold text-[#8b5e3c]">
                  View Order
                  <ChevronRight
                    size={15}
                    className="transition group-hover:translate-x-1"
                  />
                </span>
              </div>
            </div>
          </Link>
        ))}
      </div>

      {data && orders.length > 0 && (
        <div className="flex flex-col gap-3 rounded-2xl border border-[#e8ded0] bg-[#fffdfa] p-4 sm:flex-row sm:items-center sm:justify-between">
          <button
            type="button"
            disabled={page === 1}
            onClick={() => setPage((current) => Math.max(1, current - 1))}
            className="
                            inline-flex
                            min-h-10
                            cursor-pointer
                            items-center
                            justify-center
                            gap-2
                            rounded-lg
                            border
                            border-[#d8c8b8]
                            bg-white
                            px-4
                            text-sm
                            font-medium
                            text-[#5c4535]
                            transition
                            hover:bg-[#f3ede5]
                            disabled:cursor-not-allowed
                            disabled:opacity-40
                        "
          >
            <ChevronLeft size={16} />
            Previous
          </button>

          <span className="text-center text-xs text-[#786454]">
            Page <strong className="text-[#2b1b11]">{page}</strong> of{" "}
            <strong className="text-[#2b1b11]">{pages}</strong>
          </span>

          <button
            type="button"
            disabled={!data || page >= pages}
            onClick={() => setPage((current) => current + 1)}
            className="
                            inline-flex
                            min-h-10
                            cursor-pointer
                            items-center
                            justify-center
                            gap-2
                            rounded-lg
                            border
                            border-[#d8c8b8]
                            bg-white
                            px-4
                            text-sm
                            font-medium
                            text-[#5c4535]
                            transition
                            hover:bg-[#f3ede5]
                            disabled:cursor-not-allowed
                            disabled:opacity-40
                        "
          >
            Next
            <ChevronRight size={16} />
          </button>
        </div>
      )}
    </section>
  );
}

export function OrderDetail({ id, admin = false }) {
  const dispatch = useDispatch();

  const user = useSelector((state) => state.cart.user);

  const { pay, isLoading } = useOrderPayment();

  const [o, setOrder] = useState(null);

  const [error, setError] = useState("");

  const [busy, setBusy] = useState(false);

  const [reason, setReason] = useState("");

  const [status, setStatus] = useState("packed");

  const [tracking, setTracking] = useState({
    carrier: "",
    number: "",
    url: "",
  });

  const syncAdminControls = (order) => {
    if (!admin || !order) {
      return;
    }

    if (fulfilmentStatuses.includes(order.orderStatus)) {
      setStatus(order.orderStatus);
    }

    setTracking({
      carrier: order.tracking?.carrier || "",

      number: order.tracking?.number || "",

      url: order.tracking?.url || "",
    });
  };

  async function reload(reconcile = false) {
    const previousPaymentStatus = o?.paymentStatus;

    const { data } = await client.get("order/" + id, {
      params: {
        reconcile,
      },
    });

    const nextOrder = data.data;

    setOrder(nextOrder);

    syncAdminControls(nextOrder);

    if (
      !admin &&
      previousPaymentStatus === "pending" &&
      nextOrder.paymentStatus === "paid"
    ) {
      await dispatch(removeOrderedWishlistItems(nextOrder));
    }

    return nextOrder;
  }

  useEffect(() => {
    let active = true;

    void client
      .get("order/" + id)
      .then(({ data }) => {
        if (!active) {
          return;
        }

        setOrder(data.data);

        if (admin) {
          const order = data.data;

          if (fulfilmentStatuses.includes(order.orderStatus)) {
            setStatus(order.orderStatus);
          }

          setTracking({
            carrier: order.tracking?.carrier || "",

            number: order.tracking?.number || "",

            url: order.tracking?.url || "",
          });
        }
      })
      .catch((error) => {
        if (active) {
          setError(error.response?.data?.message || "Unable to load order");
        }
      });

    return () => {
      active = false;
    };
  }, [id, admin]);

  async function run(fn, successMessage = "") {
    if (busy) return;

    setBusy(true);

    setError("");

    try {
      await fn();

      await reload();

      await dispatch(refreshCart());

      if (successMessage) {
        toast.success(successMessage);
      }
    } catch (error) {
      const message =
        error.response?.data?.message ||
        error.message ||
        "Something went wrong";

      setError(message);

      toast.error(message);
    } finally {
      setBusy(false);
    }
  }

  if (!o) {
    return (
      <div className="mx-auto max-w-6xl p-5 sm:p-8">
        {error ? (
          <div className="rounded-2xl border border-red-200 bg-red-50 p-5 text-sm text-red-700">
            {error}
          </div>
        ) : (
          <div className="flex min-h-[300px] items-center justify-center rounded-2xl border border-[#e8ded0] bg-[#fffdfa]">
            <div className="text-center">
              <Loader2
                size={28}
                className="mx-auto animate-spin text-[#8b5e3c]"
              />

              <p className="mt-3 text-sm text-[#786454]">Loading order...</p>
            </div>
          </div>
        )}
      </div>
    );
  }

  const canCancel = (
    admin ? ["placed", "confirmed", "packed"] : ["placed"]
  ).includes(o.orderStatus);

  const canPay =
    o.paymentMethod === "online" &&
    o.paymentStatus === "pending" &&
    o.orderStatus === "placed";

  const items = o.items || [];

  const history = o.history || [];

  const address = o.shippingAddress || {};

  const inputClass = `
        h-11
        w-full
        rounded-xl
        border
        border-[#d8c8b8]
        bg-white
        px-4
        text-sm
        text-[#2b1b11]
        outline-none
        transition
        placeholder:text-[#aa998a]
        focus:border-[#8b5e3c]
        focus:ring-2
        focus:ring-[#8b5e3c]/10
    `;

  const textareaClass = `
        w-full
        rounded-xl
        border
        border-[#d8c8b8]
        bg-white
        px-4
        py-3
        text-sm
        leading-6
        text-[#2b1b11]
        outline-none
        transition
        placeholder:text-[#aa998a]
        focus:border-[#8b5e3c]
        focus:ring-2
        focus:ring-[#8b5e3c]/10
        resize-none
    `;

  return (
    <article className="mx-auto w-full max-w-6xl space-y-6 px-4 py-6 text-[#2b1b11] sm:px-6">
      <section className="rounded-3xl border border-[#e8ded0] bg-[#fffdfa] p-5 shadow-sm sm:p-7">
        <Link
          href={admin ? "/admin/orders" : "/orders"}
          className="print:hidden inline-flex items-center gap-2 text-sm font-medium text-[#786454] transition hover:text-[#8b5e3c]"
        >
          <ArrowLeft size={16} />
          Back to Orders
        </Link>

        <div className="mt-5 flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[#9a6a43]">
              {admin ? "Customer Order" : "Order Details"}
            </p>

            <h1 className="mt-2 text-2xl font-semibold tracking-tight sm:text-3xl">
              Order #{o._id.slice(-8).toUpperCase()}
            </h1>

            <p className="mt-2 text-sm text-[#786454]">
              Placed on {formatDate(o.createdAt)}
            </p>

            <div className="mt-4 flex flex-wrap gap-2">
              <StatusPill status={o.orderStatus} />

              <PaymentPill status={o.paymentStatus} />
            </div>
          </div>

          <div className="rounded-2xl bg-[#f3ede5] px-5 py-4 lg:text-right">
            <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-[#9b897b]">
              Order Total
            </p>

            <p className="mt-1 text-2xl font-semibold text-[#2b1b11]">
              {money(o.totalAmount)}
            </p>

            <p className="mt-1 text-xs capitalize text-[#786454]">
              {o.paymentMethod} payment
            </p>
          </div>
        </div>
      </section>

      {error && (
        <div
          role="alert"
          className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
        >
          <AlertTriangle size={18} className="mt-0.5 shrink-0" />

          {error}
        </div>
      )}

      <section className="print:hidden rounded-2xl border border-[#e8ded0] bg-[#fffdfa] p-4 shadow-sm">
        <div className="flex flex-wrap gap-2">
          <ActionButton
            disabled={busy}
            onClick={() => run(() => reload(true), "Order status refreshed")}
            icon={<RefreshCcw size={15} />}
          >
            Refresh Status
          </ActionButton>

          {canPay && (
            <ActionButton
              primary
              disabled={busy || isLoading}
              onClick={() =>
                run(async () => {
                  const latest = await reload(true);

                  if (latest.paymentStatus === "pending") {
                    await pay(
                      {
                        orderId: latest._id,

                        razorpayOrderId: latest.razorpay_order_id,

                        amount: latest.amountPaise,
                      },
                      user,
                    );
                  }
                })
              }
              icon={<CreditCard size={15} />}
            >
              Resume Payment
            </ActionButton>
          )}

          <ActionButton
            onClick={() => window.print()}
            icon={<Printer size={15} />}
          >
            Print Receipt
          </ActionButton>

          <ActionButton
            disabled={busy}
            onClick={() =>
              run(async () => {
                for (const item of items) {
                  const { data } = await client.get(
                    "product/" + item.product_id,
                  );

                  await dispatch(
                    addToCart({
                      ...data.data,
                      quantity: item.quantity,
                    }),
                  );
                }
              }, "Items added to cart")
            }
            icon={<ShoppingCart size={15} />}
          >
            Buy Again
          </ActionButton>
        </div>
      </section>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1.45fr)_minmax(300px,0.65fr)]">
        <section className="overflow-hidden rounded-2xl border border-[#e8ded0] bg-[#fffdfa] shadow-sm">
          <SectionHeading
            icon={<Package size={18} />}
            title="Order Items"
            description={`${items.length} item${items.length === 1 ? "" : "s"} in this order`}
          />

          <div className="divide-y divide-[#eee5da]">
            {items.map((item, index) => (
              <div
                key={item._id || index}
                className="flex items-start justify-between gap-4 px-5 py-4 sm:px-6"
              >
                <div className="min-w-0">
                  <Link
                    href={"/store/" + item.product_id}
                    className="font-semibold text-[#2b1b11] transition hover:text-[#8b5e3c]"
                  >
                    {item.title || "Product"}
                  </Link>

                  <p className="mt-1 text-xs text-[#786454]">
                    {item.color && `${item.color} · `}
                    Quantity: {item.quantity}
                  </p>
                </div>

                <span className="shrink-0 text-sm font-semibold">
                  {money(item.total)}
                </span>
              </div>
            ))}
          </div>
        </section>

        <section className="overflow-hidden rounded-2xl border border-[#e8ded0] bg-[#fffdfa] shadow-sm">
          <SectionHeading
            icon={<ReceiptText size={18} />}
            title="Payment Summary"
          />

          <div className="space-y-3 p-5 text-sm sm:p-6">
            <SummaryRow label="Subtotal" value={money(o.subtotal)} />

            <SummaryRow
              label="Delivery"
              value={
                Number(o.shippingCharge || 0) === 0
                  ? "Free"
                  : money(o.shippingCharge)
              }
            />

            {o.couponCode && (
              <SummaryRow
                label={`Coupon (${o.couponCode})`}
                value={`−${money(o.couponDiscount)}`}
                discount
              />
            )}

            <SummaryRow
              label={`Included tax (${o.taxRate || 0}%)`}
              value={money(o.taxAmount)}
            />

            <div className="my-4 h-px bg-[#e8ded0]" />

            <div className="flex items-center justify-between gap-4">
              <strong className="text-base">Total</strong>

              <strong className="text-lg text-[#8b5e3c]">
                {money(o.totalAmount)}
              </strong>
            </div>
          </div>
        </section>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <InfoCard icon={<MapPin size={18} />} title="Delivery Address">
          <p className="font-semibold text-[#2b1b11]">
            {address.fullName || "—"}
          </p>

          <p>{address.mobile || ""}</p>

          <p>{address.addressLine || ""}</p>

          <p>
            {[address.city, address.state, address.pincode]
              .filter(Boolean)
              .join(", ")}
          </p>

          {address.country && <p>{address.country}</p>}
        </InfoCard>

        <InfoCard icon={<Store size={18} />} title="Seller Information">
          <p className="font-semibold text-[#2b1b11]">
            {o.seller?.businessName || "Nestro"}
          </p>

          {o.seller?.businessAddress && <p>{o.seller.businessAddress}</p>}

          {o.seller?.supportEmail && <p>{o.seller.supportEmail}</p>}

          {o.seller?.gstin && <p>GSTIN: {o.seller.gstin}</p>}

          {o.billing?.businessName && (
            <p className="mt-2 border-t border-[#eee5da] pt-2">
              Bill to: {o.billing.businessName}
              {o.billing?.gstin && ` · ${o.billing.gstin}`}
            </p>
          )}
        </InfoCard>
      </div>

      {o.tracking?.number && (
        <section className="rounded-2xl border border-[#e8ded0] bg-[#fffdfa] p-5 shadow-sm sm:p-6">
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#f3ede5] text-[#8b5e3c]">
              <Truck size={18} />
            </div>

            <div className="min-w-0 flex-1">
              <h2 className="font-semibold">Shipment Tracking</h2>

              <p className="mt-2 text-sm text-[#786454]">
                {o.tracking.carrier || "Courier"}

                {" · "}

                <span className="font-medium text-[#5c4535]">
                  {o.tracking.number}
                </span>
              </p>

              {o.tracking.url?.startsWith("https://") && (
                <a
                  href={o.tracking.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-3 inline-flex items-center gap-1.5 text-sm font-semibold text-[#8b5e3c]"
                >
                  Track Shipment
                  <ExternalLink size={14} />
                </a>
              )}
            </div>
          </div>
        </section>
      )}

      {o.refund?.status && o.refund.status !== "none" && (
        <section className="rounded-2xl border border-[#e8ded0] bg-[#fffdfa] p-5 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#f3ede5] text-[#8b5e3c]">
              <Banknote size={18} />
            </div>

            <div>
              <p className="text-xs text-[#786454]">Refund Status</p>

              <p className="mt-1 text-sm font-semibold capitalize">
                {formatStatus(o.refund.status)}

                {(o.refund.reference || o.refund.id) &&
                  ` · ${o.refund.reference || o.refund.id}`}
              </p>
            </div>
          </div>
        </section>
      )}

      <section className="overflow-hidden rounded-2xl border border-[#e8ded0] bg-[#fffdfa] shadow-sm">
        <SectionHeading
          icon={<Clock3 size={18} />}
          title="Order Updates"
          description="A timeline of your order activity."
        />

        <div className="p-5 sm:p-6">
          {history.length ? (
            <div className="space-y-0">
              {history.map((item, index) => (
                <div key={index} className="relative flex gap-4 pb-6 last:pb-0">
                  {index < history.length - 1 && (
                    <div className="absolute left-[7px] top-5 h-full w-px bg-[#e8ded0]" />
                  )}

                  <div className="relative z-10 mt-1 h-[15px] w-[15px] shrink-0 rounded-full border-[4px] border-[#f3ede5] bg-[#8b5e3c]" />

                  <div className="min-w-0">
                    <p className="text-sm font-semibold capitalize">
                      {formatStatus(item.status)}
                    </p>

                    <p className="mt-1 text-xs text-[#8f7a68]">
                      {formatDateTime(item.at)}
                    </p>

                    {item.note && (
                      <p className="mt-2 text-sm leading-6 text-[#786454]">
                        {item.note}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-[#786454]">
              No order updates available yet.
            </p>
          )}
        </div>
      </section>

      {canCancel && (
        <section className="print:hidden rounded-2xl border border-red-200 bg-red-50/50 p-5 sm:p-6">
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-red-100 text-red-600">
              <AlertTriangle size={18} />
            </div>

            <div className="flex-1">
              <h2 className="font-semibold text-red-800">Cancel Order</h2>

              <p className="mt-1 text-sm leading-6 text-red-700/80">
                Please provide a reason before cancelling this order.
              </p>

              <label className="mt-4 block">
                <span className="mb-2 block text-sm font-medium text-red-800">
                  Cancellation Reason
                </span>

                <textarea
                  maxLength={500}
                  rows={4}
                  value={reason}
                  onChange={(event) => setReason(event.target.value)}
                  placeholder="Tell us why this order needs to be cancelled..."
                  className={textareaClass}
                />
              </label>

              <button
                type="button"
                disabled={busy || !reason.trim()}
                onClick={() =>
                  run(
                    () =>
                      client.post("order/" + id + "/cancel", {
                        reason,
                      }),
                    "Order cancelled successfully",
                  )
                }
                className="
                                    mt-4
                                    inline-flex
                                    min-h-11
                                    cursor-pointer
                                    items-center
                                    justify-center
                                    rounded-xl
                                    bg-red-600
                                    px-5
                                    text-sm
                                    font-semibold
                                    text-white
                                    transition
                                    hover:bg-red-700
                                    disabled:cursor-not-allowed
                                    disabled:opacity-50
                                "
              >
                Cancel Order
              </button>
            </div>
          </div>
        </section>
      )}

      {!admin && o.orderStatus === "delivered" && (
        <section className="print:hidden rounded-2xl border border-amber-200 bg-amber-50/50 p-5 sm:p-6">
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-100 text-amber-700">
              <Undo2 size={18} />
            </div>

            <div>
              <h2 className="font-semibold text-[#2b1b11]">Request a Return</h2>

              <p className="mt-2 max-w-2xl text-sm leading-6 text-[#786454]">
                Returns are available only if you received the wrong product
                {o.returnDays
                  ? `, within ${o.returnDays} days of delivery.`
                  : " within the allowed return window."}
              </p>

              <button
                type="button"
                disabled={busy}
                onClick={() =>
                  run(
                    () =>
                      client.post("order/" + id + "/return", {
                        reason: "wrong_product_received",
                      }),
                    "Return request submitted",
                  )
                }
                className="
                                    mt-4
                                    inline-flex
                                    min-h-11
                                    cursor-pointer
                                    items-center
                                    justify-center
                                    gap-2
                                    rounded-xl
                                    border
                                    border-amber-300
                                    bg-white
                                    px-5
                                    text-sm
                                    font-semibold
                                    text-amber-800
                                    transition
                                    hover:bg-amber-100
                                    disabled:cursor-not-allowed
                                    disabled:opacity-50
                                "
              >
                <Undo2 size={15} />
                Request Return
              </button>
            </div>
          </div>
        </section>
      )}

      {admin && (
        <section className="print:hidden overflow-hidden rounded-2xl border border-[#e8ded0] bg-[#fffdfa] shadow-sm">
          <SectionHeading
            icon={<Truck size={18} />}
            title="Fulfilment"
            description="Update order progress, shipment tracking and refund details."
          />

          <div className="space-y-7 p-5 sm:p-6">
            <div>
              <label className="mb-2 block text-sm font-medium text-[#5c4535]">
                Order Status
              </label>

              <select
                value={status}
                onChange={(event) => setStatus(event.target.value)}
                className={inputClass}
              >
                {fulfilmentStatuses.map((item) => (
                  <option key={item} value={item}>
                    {formatStatus(item)}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <h3 className="text-sm font-semibold text-[#2b1b11]">
                Shipment Tracking
              </h3>

              <p className="mt-1 text-xs text-[#8f7a68]">
                Add courier information when the order is dispatched.
              </p>

              <div className="mt-4 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                <AdminField label="Carrier">
                  <input
                    value={tracking.carrier}
                    onChange={(event) =>
                      setTracking((current) => ({
                        ...current,
                        carrier: event.target.value,
                      }))
                    }
                    placeholder="e.g. Delhivery"
                    className={inputClass}
                  />
                </AdminField>

                <AdminField label="Tracking Number">
                  <input
                    value={tracking.number}
                    onChange={(event) =>
                      setTracking((current) => ({
                        ...current,
                        number: event.target.value,
                      }))
                    }
                    placeholder="Tracking number"
                    className={inputClass}
                  />
                </AdminField>

                <AdminField label="Tracking URL">
                  <input
                    value={tracking.url}
                    onChange={(event) =>
                      setTracking((current) => ({
                        ...current,
                        url: event.target.value,
                      }))
                    }
                    placeholder="https://..."
                    className={inputClass}
                  />
                </AdminField>
              </div>
            </div>

            {o.orderStatus === "return_requested" && (
              <AdminField label="Return Approval / Rejection Note">
                <textarea
                  required
                  rows={4}
                  maxLength={500}
                  value={reason}
                  onChange={(event) => setReason(event.target.value)}
                  placeholder="Add a note for this return request..."
                  className={textareaClass}
                />
              </AdminField>
            )}

            <button
              type="button"
              disabled={
                busy || (o.orderStatus === "return_requested" && !reason.trim())
              }
              onClick={() =>
                run(
                  () =>
                    client.patch("order/" + id + "/status", {
                      status,
                      tracking,
                      note: reason,
                    }),
                  "Order status updated",
                )
              }
              className="
                                inline-flex
                                min-h-11
                                cursor-pointer
                                items-center
                                justify-center
                                gap-2
                                rounded-xl
                                bg-[#8b5e3c]
                                px-6
                                text-sm
                                font-semibold
                                text-white
                                transition
                                hover:bg-[#70482e]
                                disabled:cursor-not-allowed
                                disabled:opacity-50
                            "
            >
              {busy && <Loader2 size={15} className="animate-spin" />}
              Update Status
            </button>

            <div className="border-t border-[#e8ded0] pt-6">
              <div className="flex items-start gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#f3ede5] text-[#8b5e3c]">
                  <Banknote size={18} />
                </div>

                <div>
                  <h3 className="text-sm font-semibold">Refund Management</h3>

                  <p className="mt-1 text-xs leading-5 text-[#8f7a68]">
                    Process online refunds or reconcile an existing refund.
                  </p>
                </div>
              </div>

              <div className="mt-4 flex flex-wrap gap-2">
                <button
                  type="button"
                  disabled={busy}
                  onClick={() =>
                    run(
                      () => client.post("order/" + id + "/refund"),
                      "Refund request processed",
                    )
                  }
                  className="
                                        min-h-10
                                        cursor-pointer
                                        rounded-xl
                                        border
                                        border-red-200
                                        bg-red-50
                                        px-4
                                        text-sm
                                        font-semibold
                                        text-red-700
                                        transition
                                        hover:bg-red-100
                                        disabled:cursor-not-allowed
                                        disabled:opacity-50
                                    "
                >
                  Issue Online Refund
                </button>

                <button
                  type="button"
                  disabled={busy}
                  onClick={() =>
                    run(
                      () => client.post("order/" + id + "/refund/reconcile"),
                      "Refund status reconciled",
                    )
                  }
                  className="
                                        min-h-10
                                        cursor-pointer
                                        rounded-xl
                                        border
                                        border-[#d8c8b8]
                                        bg-white
                                        px-4
                                        text-sm
                                        font-semibold
                                        text-[#5c4535]
                                        transition
                                        hover:bg-[#f3ede5]
                                        disabled:cursor-not-allowed
                                        disabled:opacity-50
                                    "
                >
                  Reconcile Refund
                </button>
              </div>

              {o.refund?.status === "manual_required" && (
                <div className="mt-5 rounded-xl border border-amber-200 bg-amber-50 p-4">
                  <label className="block">
                    <span className="mb-2 block text-sm font-medium text-amber-900">
                      COD Refund Reference
                    </span>

                    <input
                      value={reason}
                      onChange={(event) => setReason(event.target.value)}
                      placeholder="Enter refund reference"
                      className={inputClass}
                    />
                  </label>

                  <button
                    type="button"
                    disabled={busy || !reason.trim()}
                    onClick={() =>
                      run(
                        () =>
                          client.post("order/" + id + "/refund/manual", {
                            reference: reason,
                          }),
                        "Completed refund recorded",
                      )
                    }
                    className="
                                            mt-3
                                            min-h-10
                                            cursor-pointer
                                            rounded-xl
                                            bg-amber-700
                                            px-4
                                            text-sm
                                            font-semibold
                                            text-white
                                            transition
                                            hover:bg-amber-800
                                            disabled:cursor-not-allowed
                                            disabled:opacity-50
                                        "
                  >
                    Record Completed Refund
                  </button>
                </div>
              )}
            </div>
          </div>
        </section>
      )}
    </article>
  );
}

function StatusPill({ status }) {
  const styles = {
    placed: "bg-[#f3ede5] text-[#8b5e3c]",

    confirmed: "bg-blue-50 text-blue-700",

    packed: "bg-amber-50 text-amber-700",

    shipped: "bg-indigo-50 text-indigo-700",

    out_for_delivery: "bg-purple-50 text-purple-700",

    delivered: "bg-emerald-50 text-emerald-700",

    cancelled: "bg-red-50 text-red-700",

    return_requested: "bg-amber-50 text-amber-700",

    return_approved: "bg-cyan-50 text-cyan-700",

    returned: "bg-slate-100 text-slate-700",
  };

  return (
    <span
      className={`
                inline-flex
                rounded-full
                px-2.5
                py-1
                text-[11px]
                font-semibold
                capitalize

                ${styles[status] || "bg-[#f3ede5] text-[#786454]"}
            `}
    >
      {formatStatus(status)}
    </span>
  );
}

function PaymentPill({ status }) {
  const styles = {
    paid: "bg-emerald-50 text-emerald-700",

    pending: "bg-amber-50 text-amber-700",

    failed: "bg-red-50 text-red-700",

    refunded: "bg-slate-100 text-slate-700",
  };

  return (
    <span
      className={`
                inline-flex
                rounded-full
                px-2.5
                py-1
                text-[11px]
                font-semibold
                capitalize

                ${styles[status] || "bg-[#f3ede5] text-[#786454]"}
            `}
    >
      Payment {formatStatus(status)}
    </span>
  );
}

function SectionHeading({ icon, title, description }) {
  return (
    <div className="flex items-start gap-3 border-b border-[#eee5da] bg-[#faf8f4] px-5 py-4 sm:px-6">
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#f0ebe3] text-[#8b5e3c]">
        {icon}
      </div>

      <div>
        <h2 className="text-[15px] font-semibold text-[#2b1b11]">{title}</h2>

        {description && (
          <p className="mt-1 text-xs leading-5 text-[#8f7a68]">{description}</p>
        )}
      </div>
    </div>
  );
}

function InfoCard({ icon, title, children }) {
  return (
    <section className="rounded-2xl border border-[#e8ded0] bg-[#fffdfa] p-5 shadow-sm sm:p-6">
      <div className="mb-4 flex items-center gap-3">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#f3ede5] text-[#8b5e3c]">
          {icon}
        </div>

        <h2 className="font-semibold">{title}</h2>
      </div>

      <div className="space-y-1.5 break-words text-sm leading-6 text-[#786454]">
        {children}
      </div>
    </section>
  );
}

function SummaryRow({ label, value, discount = false }) {
  return (
    <div className="flex items-center justify-between gap-4">
      <span className="text-[#786454]">{label}</span>

      <span
        className={
          discount
            ? "font-medium text-emerald-700"
            : "font-medium text-[#2b1b11]"
        }
      >
        {value}
      </span>
    </div>
  );
}

function ActionButton({
  children,
  icon,
  primary = false,
  disabled = false,
  onClick,
}) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      className={`
                inline-flex
                min-h-10
                cursor-pointer
                items-center
                justify-center
                gap-2
                rounded-xl
                border
                px-4
                text-sm
                font-medium
                transition
                disabled:cursor-not-allowed
                disabled:opacity-50

                ${
                  primary
                    ? "border-[#8b5e3c] bg-[#8b5e3c] text-white hover:bg-[#70482e]"
                    : "border-[#d8c8b8] bg-white text-[#5c4535] hover:bg-[#f3ede5] hover:text-[#8b5e3c]"
                }
            `}
    >
      {icon}

      {children}
    </button>
  );
}

function AdminField({ label, children }) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-medium text-[#5c4535]">
        {label}
      </span>

      {children}
    </label>
  );
}
