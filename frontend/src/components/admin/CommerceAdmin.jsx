"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";

import {
  LayoutDashboard,
  Settings,
  TicketPercent,
  Star,
  MessageSquareText,
  Users,
  IndianRupee,
  ShoppingBag,
  Package,
  UserRound,
  AlertTriangle,
  MailWarning,
  Boxes,
  ExternalLink,
  Save,
  Pencil,
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  CircleAlert,
  Send,
  ShieldCheck,
  Ban,
  UserCheck,
  Loader2,
  Store,
  Truck,
  CreditCard,
  FileText,
  MapPin,
  Plus,
  Percent,
} from "lucide-react";

import { toast } from "sonner";
import { client } from "@/utils/helper";

const labels = {
  businessName: "Business name",
  businessAddress: "Business address",
  supportEmail: "Support email",
  supportPhone: "Support phone",
  gstin: "GSTIN",

  shippingCharge: "Delivery charge (₹)",
  freeShippingAbove: "Free delivery threshold (₹)",
  codMaxOrderValue: "COD maximum order value (₹)",
  taxRate: "Tax included in catalog prices (%)",
  deliveryDaysMin: "Minimum delivery days",
  deliveryDaysMax: "Maximum delivery days",
  returnDays: "Return window (days)",

  acceptOrders: "Accept new orders",
  codEnabled: "Enable cash on delivery",
  policiesPublished: "Publish reviewed policies",

  usageLimit: "Total uses allowed",
  perUserLimit: "Uses per customer",
  maximumDiscount: "Maximum discount (0 = no cap)",
  minimum: "Minimum order amount",
  value: "Discount value",
  expiresAt: "Expires at",
  code: "Coupon code",
  active: "Active",
};

const sectionMeta = {
  dashboard: {
    title: "Dashboard",
    eyebrow: "Store Overview",
    description:
      "Revenue, orders, catalog health and customer operations at a glance.",
    icon: LayoutDashboard,
  },

  settings: {
    title: "Store Settings",
    eyebrow: "Store Configuration",
    description:
      "Manage business details, delivery rules, payment options and store policies.",
    icon: Settings,
  },

  coupons: {
    title: "Coupons",
    eyebrow: "Promotions",
    description: "Create and manage promotional discounts for your customers.",
    icon: TicketPercent,
  },

  reviews: {
    title: "Reviews",
    eyebrow: "Customer Feedback",
    description:
      "Moderate customer reviews before they appear on your storefront.",
    icon: Star,
  },

  support: {
    title: "Support",
    eyebrow: "Customer Support",
    description: "Review customer enquiries and send support responses.",
    icon: MessageSquareText,
  },

  users: {
    title: "Users",
    eyebrow: "Customer Management",
    description: "Manage customer access, status and administrator roles.",
    icon: Users,
  },
};

export default function CommerceAdmin({ section }) {
  const [data, setData] = useState(null);

  const [form, setForm] = useState({});

  const [page, setPage] = useState(1);

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState("");

  const [busy, setBusy] = useState(false);

  const meta = sectionMeta[section] || {
    title: section,
    eyebrow: "Administration",
    description: "Manage store operations.",
    icon: Settings,
  };

  const SectionIcon = meta.icon;

  const load = useCallback(async () => {
    try {
      setLoading(true);

      setError("");

      const { data: response } = await client.get("commerce/admin/" + section, {
        params: {
          page,
        },
      });

      setData(response);

      if (section === "settings") {
        setForm(response.data || {});
      }
    } catch (error) {
      const message = error.response?.data?.message || "Unable to load data";

      setError(message);

      toast.error(message);
    } finally {
      setLoading(false);
    }
  }, [page, section]);

  useEffect(() => {
    void load();
  }, [load]);

  async function run(fn, successMessage = "") {
    if (busy) return;

    try {
      setBusy(true);

      const response = await fn();

      await load();

      toast.success(
        response?.data?.message || successMessage || "Saved successfully",
      );

      return response;
    } catch (error) {
      const message =
        error.response?.data?.message ||
        error.message ||
        "Something went wrong";

      toast.error(message);

      throw error;
    } finally {
      setBusy(false);
    }
  }

  function input(key, type = "text") {
    return (
      <Field label={labels[key] || key} key={key}>
        <input
          type={type}
          step={type === "number" ? "any" : undefined}
          value={form[key] ?? ""}
          onChange={(event) =>
            setForm((current) => ({
              ...current,

              [key]:
                type === "number"
                  ? event.target.value === ""
                    ? ""
                    : Number(event.target.value)
                  : event.target.value,
            }))
          }
          className={inputClass}
        />
      </Field>
    );
  }

  function check(key) {
    return (
      <ToggleCard
        key={key}
        title={labels[key]}
        checked={form[key] === true}
        onChange={(checked) =>
          setForm((current) => ({
            ...current,
            [key]: checked,
          }))
        }
      />
    );
  }

  const records = Array.isArray(data?.data) ? data.data : [];

  return (
    <main className="mx-auto w-full max-w-[1500px] space-y-6 pb-10">
      <section className="rounded-3xl border border-[#e8ded0] bg-[#fffdfa] p-5 shadow-sm sm:p-7">
        <div className="flex items-start gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#f3ede5] text-[#8b5e3c]">
            <SectionIcon size={20} />
          </div>

          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-[#9a6a43]">
              {meta.eyebrow}
            </p>

            <h1 className="mt-1 text-2xl font-semibold capitalize tracking-tight text-[#2b1b11] sm:text-3xl">
              {meta.title}
            </h1>

            <p className="mt-2 max-w-2xl text-sm leading-6 text-[#786454]">
              {meta.description}
            </p>
          </div>
        </div>
      </section>

      {error && (
        <div className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          <AlertTriangle size={18} className="mt-0.5 shrink-0" />

          {error}
        </div>
      )}

      {loading && !data && <LoadingCard />}

      {section === "dashboard" && data && <Dashboard data={data.data} />}

      {section === "settings" && data && (
        <form
          className="space-y-6"
          onSubmit={(event) => {
            event.preventDefault();

            void run(
              () => client.put("commerce/admin/settings", form),
              "Store settings saved",
            );
          }}
        >
          <AdminSection
            icon={<Store size={18} />}
            title="Business Information"
            description="Details displayed on invoices, customer communications and policies."
          >
            <div className="grid gap-4 sm:grid-cols-2">
              {[
                "businessName",
                "businessAddress",
                "supportEmail",
                "supportPhone",
                "gstin",
              ].map((key) =>
                input(key, key === "supportEmail" ? "email" : "text"),
              )}
            </div>
          </AdminSection>

          <AdminSection
            icon={<Truck size={18} />}
            title="Delivery & Checkout"
            description="Configure delivery charges, COD limits and expected delivery windows."
          >
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {[
                "shippingCharge",
                "freeShippingAbove",
                "codMaxOrderValue",
                "taxRate",
                "deliveryDaysMin",
                "deliveryDaysMax",
                "returnDays",
              ].map((key) => input(key, "number"))}
            </div>

            <div className="mt-5">
              <Field label="Serviceable pincodes">
                <textarea
                  rows={3}
                  value={(form.pincodes || []).join(",")}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,

                      pincodes: event.target.value
                        .split(",")
                        .map((value) => value.trim())
                        .filter(Boolean),
                    }))
                  }
                  placeholder="302017, 302018, 302019"
                  className={textareaClass}
                />

                <p className="mt-2 text-xs text-[#8f7a68]">
                  Leave blank to allow all Indian pincodes.
                </p>
              </Field>
            </div>
          </AdminSection>

          <AdminSection
            icon={<FileText size={18} />}
            title="Store Policies"
            description="Keep legal and customer service policies reviewed and up to date."
          >
            <div className="space-y-5">
              {["privacy", "terms", "shipping", "returns"].map((key) => (
                <Field key={key} label={`${capitalize(key)} Policy`}>
                  <textarea
                    rows={6}
                    value={form.policies?.[key] || ""}
                    onChange={(event) =>
                      setForm((current) => ({
                        ...current,

                        policies: {
                          ...current.policies,

                          [key]: event.target.value,
                        },
                      }))
                    }
                    className={textareaClass}
                  />
                </Field>
              ))}
            </div>
          </AdminSection>

          <AdminSection
            icon={<CreditCard size={18} />}
            title="Store Availability"
            description="Control payments, policy visibility and whether customers can place new orders."
          >
            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
              {["policiesPublished", "codEnabled", "acceptOrders"].map(check)}
            </div>
          </AdminSection>

          <SaveBar busy={busy} label="Save Store Settings" />
        </form>
      )}

      {section === "coupons" && (
        <div className="space-y-6">
          <form
            className="overflow-hidden rounded-2xl border border-[#e8ded0] bg-[#fffdfa] shadow-sm"
            onSubmit={(event) => {
              event.preventDefault();

              void run(
                () => client.put("commerce/admin/coupons", form),
                "Coupon saved successfully",
              );
            }}
          >
            <SectionHeader
              icon={<Plus size={18} />}
              title="Create or Update Coupon"
              description="Configure discount value, limits and expiry."
            />

            <div className="space-y-5 p-5 sm:p-6">
              <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                {input("code")}

                <Field label="Discount Type">
                  <select
                    value={form.type || ""}
                    required
                    onChange={(event) =>
                      setForm((current) => ({
                        ...current,

                        type: event.target.value,
                      }))
                    }
                    className={inputClass}
                  >
                    <option value="">Choose type</option>

                    <option value="percent">Percentage</option>

                    <option value="fixed">Fixed Amount</option>
                  </select>
                </Field>

                {[
                  "value",
                  "minimum",
                  "maximumDiscount",
                  "usageLimit",
                  "perUserLimit",
                ].map((key) => input(key, "number"))}

                {input("expiresAt", "datetime-local")}
              </div>

              {check("active")}

              <button
                disabled={busy}
                type="submit"
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
                {busy ? (
                  <Loader2 size={16} className="animate-spin" />
                ) : (
                  <Save size={16} />
                )}
                Save Coupon
              </button>
            </div>
          </form>

          <section className="overflow-hidden rounded-2xl border border-[#e8ded0] bg-[#fffdfa] shadow-sm">
            <SectionHeader
              icon={<TicketPercent size={18} />}
              title="Coupon List"
              description="Existing promotional offers and usage limits."
              count={records.length}
            />

            {records.length ? (
              <div className="grid gap-4 p-4 sm:grid-cols-2 xl:grid-cols-3">
                {records.map((coupon) => (
                  <article
                    key={coupon._id}
                    className="rounded-2xl border border-[#e8ded0] bg-white p-4 transition hover:border-[#d4c1af] hover:shadow-sm"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-lg font-semibold tracking-wide text-[#2b1b11]">
                          {coupon.code}
                        </p>

                        <p className="mt-1 text-sm text-[#786454]">
                          {coupon.type === "percent"
                            ? `${coupon.value}% off`
                            : `₹${Number(coupon.value || 0).toLocaleString(
                                "en-IN",
                              )} off`}
                        </p>
                      </div>

                      <span
                        className={`
                                                        rounded-full
                                                        px-2.5
                                                        py-1
                                                        text-[11px]
                                                        font-semibold

                                                        ${
                                                          coupon.active
                                                            ? "bg-emerald-50 text-emerald-700"
                                                            : "bg-[#f3ede5] text-[#786454]"
                                                        }
                                                    `}
                      >
                        {coupon.active ? "Active" : "Inactive"}
                      </span>
                    </div>

                    <div className="my-4 h-px bg-[#eee5da]" />

                    <div className="space-y-2 text-xs text-[#786454]">
                      <InfoRow
                        label="Used"
                        value={`${coupon.used || 0} / ${coupon.usageLimit || 0}`}
                      />

                      <InfoRow
                        label="Minimum"
                        value={`₹${Number(coupon.minimum || 0).toLocaleString(
                          "en-IN",
                        )}`}
                      />

                      {coupon.expiresAt && (
                        <InfoRow
                          label="Expires"
                          value={new Date(coupon.expiresAt).toLocaleDateString(
                            "en-IN",
                          )}
                        />
                      )}
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        setForm({
                          ...coupon,

                          expiresAt: coupon.expiresAt
                            ? new Date(
                                new Date(coupon.expiresAt).getTime() -
                                  new Date(
                                    coupon.expiresAt,
                                  ).getTimezoneOffset() *
                                    60000,
                              )
                                .toISOString()
                                .slice(0, 16)
                            : "",
                        });

                        window.scrollTo({
                          top: 0,
                          behavior: "smooth",
                        });
                      }}
                      className="mt-4 inline-flex min-h-9 w-full cursor-pointer items-center justify-center gap-2 rounded-lg border border-[#d8c8b8] text-xs font-semibold text-[#70482e] transition hover:bg-[#f3ede5]"
                    >
                      <Pencil size={14} />
                      Edit Coupon
                    </button>
                  </article>
                ))}
              </div>
            ) : (
              <EmptyState
                icon={<TicketPercent size={24} />}
                title="No coupons yet"
                description="Create your first promotional coupon above."
              />
            )}
          </section>
        </div>
      )}

      {section === "reviews" && data && (
        <section className="overflow-hidden rounded-2xl border border-[#e8ded0] bg-[#fffdfa] shadow-sm">
          <SectionHeader
            icon={<Star size={18} />}
            title="Customer Reviews"
            description="Approve or reject submitted product feedback."
            count={records.length}
          />

          {records.length ? (
            <div className="space-y-3 p-4 sm:p-5">
              {records.map((review) => (
                <article
                  key={review._id}
                  className="rounded-xl border border-[#e8ded0] bg-white p-4 sm:p-5"
                >
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                      <h3 className="font-semibold text-[#2b1b11]">
                        {review.product?.title || "Product"}
                      </h3>

                      <p className="mt-1 text-xs text-[#786454]">
                        {review.user?.name || "Customer"}
                        {" · "}
                        {review.rating}/5 stars
                      </p>
                    </div>

                    <ReviewBadge status={review.status} />
                  </div>

                  <p className="mt-4 whitespace-pre-wrap text-sm leading-6 text-[#5c4535]">
                    {review.comment}
                  </p>

                  <div className="mt-4 flex flex-wrap gap-2">
                    <button
                      type="button"
                      disabled={busy}
                      onClick={() =>
                        void run(
                          () =>
                            client.patch(
                              "commerce/admin/reviews/" + review._id,
                              {
                                status: "approved",
                              },
                            ),
                          "Review approved",
                        )
                      }
                      className="inline-flex min-h-9 cursor-pointer items-center gap-2 rounded-lg border border-emerald-200 bg-emerald-50 px-4 text-xs font-semibold text-emerald-700 transition hover:bg-emerald-100 disabled:opacity-50"
                    >
                      <CheckCircle2 size={14} />
                      Approve
                    </button>

                    <button
                      type="button"
                      disabled={busy}
                      onClick={() =>
                        void run(
                          () =>
                            client.patch(
                              "commerce/admin/reviews/" + review._id,
                              {
                                status: "rejected",
                              },
                            ),
                          "Review rejected",
                        )
                      }
                      className="inline-flex min-h-9 cursor-pointer items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-4 text-xs font-semibold text-red-700 transition hover:bg-red-100 disabled:opacity-50"
                    >
                      <CircleAlert size={14} />
                      Reject
                    </button>
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <EmptyState
              icon={<Star size={24} />}
              title="No reviews to moderate"
              description="Customer reviews will appear here."
            />
          )}
        </section>
      )}

      {section === "support" && data && (
        <section className="overflow-hidden rounded-2xl border border-[#e8ded0] bg-[#fffdfa] shadow-sm">
          <SectionHeader
            icon={<MessageSquareText size={18} />}
            title="Support Requests"
            description="Review and resolve customer support messages."
            count={records.length}
          />

          {records.length ? (
            <div className="space-y-4 p-4 sm:p-5">
              {records.map((ticket) => (
                <form
                  key={ticket._id}
                  className="rounded-2xl border border-[#e8ded0] bg-white p-4 sm:p-5"
                  onSubmit={(event) => {
                    event.preventDefault();

                    const reply = new FormData(event.currentTarget).get(
                      "reply",
                    );

                    void run(
                      () =>
                        client.post(
                          "commerce/admin/support/" + ticket._id + "/reply",
                          {
                            reply,
                          },
                        ),
                      "Support reply queued",
                    );
                  }}
                >
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                      <h3 className="font-semibold text-[#2b1b11]">
                        {ticket.subject}
                      </h3>

                      <p className="mt-1 text-xs text-[#786454]">
                        {ticket.name}

                        {" · "}

                        {ticket.email}
                      </p>
                    </div>

                    <SupportBadge status={ticket.status} />
                  </div>

                  <div className="mt-4 rounded-xl bg-[#faf8f4] p-4">
                    <p className="whitespace-pre-wrap text-sm leading-6 text-[#5c4535]">
                      {ticket.message}
                    </p>
                  </div>

                  <div className="mt-4">
                    <Field label="Support Reply">
                      <textarea
                        required
                        rows={4}
                        name="reply"
                        defaultValue={ticket.reply || ""}
                        className={textareaClass}
                        placeholder="Write your response..."
                      />
                    </Field>
                  </div>

                  <button
                    disabled={busy}
                    type="submit"
                    className="mt-4 inline-flex min-h-10 cursor-pointer items-center justify-center gap-2 rounded-xl bg-[#8b5e3c] px-5 text-sm font-semibold text-white transition hover:bg-[#70482e] disabled:opacity-50"
                  >
                    <Send size={15} />
                    Queue Reply & Resolve
                  </button>
                </form>
              ))}
            </div>
          ) : (
            <EmptyState
              icon={<MessageSquareText size={24} />}
              title="No support requests"
              description="New customer enquiries will appear here."
            />
          )}
        </section>
      )}

      {section === "users" && data && (
        <section className="overflow-hidden rounded-2xl border border-[#e8ded0] bg-[#fffdfa] shadow-sm">
          <SectionHeader
            icon={<Users size={18} />}
            title="Customers & Staff"
            description="Manage account access and administrative roles."
            count={records.length}
          />

          {records.length ? (
            <div className="grid gap-4 p-4 lg:grid-cols-2">
              {records.map((user) => (
                <article
                  key={user._id}
                  className="rounded-2xl border border-[#e8ded0] bg-white p-4 sm:p-5"
                >
                  <div className="flex items-start gap-3">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#f3ede5] text-sm font-semibold text-[#8b5e3c]">
                      {user.name?.charAt(0)?.toUpperCase() || "U"}
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="truncate font-semibold text-[#2b1b11]">
                          {user.name}
                        </h3>

                        <UserStatus active={user.status} />
                      </div>

                      <p className="mt-1 break-all text-xs text-[#786454]">
                        {user.email}
                      </p>

                      <p className="mt-2 text-xs capitalize text-[#9b897b]">
                        Role: {user.role}
                      </p>
                    </div>
                  </div>

                  <div className="mt-4 grid gap-2 sm:grid-cols-2">
                    <button
                      type="button"
                      disabled={busy}
                      onClick={() =>
                        void run(
                          () =>
                            client.patch("commerce/admin/users/" + user._id, {
                              status: !user.status,
                            }),
                          user.status ? "User blocked" : "User unblocked",
                        )
                      }
                      className={`
                                                    inline-flex
                                                    min-h-10
                                                    cursor-pointer
                                                    items-center
                                                    justify-center
                                                    gap-2
                                                    rounded-lg
                                                    border
                                                    px-3
                                                    text-xs
                                                    font-semibold
                                                    transition
                                                    disabled:opacity-50

                                                    ${
                                                      user.status
                                                        ? "border-red-200 bg-red-50 text-red-700 hover:bg-red-100"
                                                        : "border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
                                                    }
                                                `}
                    >
                      {user.status ? (
                        <Ban size={14} />
                      ) : (
                        <UserCheck size={14} />
                      )}

                      {user.status ? "Block User" : "Unblock User"}
                    </button>

                    <select
                      aria-label={"Role for " + user.email}
                      value={user.role}
                      disabled={busy}
                      onChange={(event) =>
                        void run(
                          () =>
                            client.patch("commerce/admin/users/" + user._id, {
                              role: event.target.value,
                            }),
                          "User role updated",
                        )
                      }
                      className={inputClass}
                    >
                      <option value="user">Customer</option>

                      <option value="admin">Administrator</option>

                      {user.role === "superAdmin" && (
                        <option value="superAdmin">Super Administrator</option>
                      )}
                    </select>
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <EmptyState
              icon={<Users size={24} />}
              title="No users found"
              description="Customer accounts will appear here."
            />
          )}
        </section>
      )}

      {data &&
        Array.isArray(data.data) &&
        data.data.length === 0 &&
        !["coupons", "reviews", "support", "users"].includes(section) && (
          <EmptyState
            icon={<Boxes size={24} />}
            title="No records"
            description="No records to display."
          />
        )}

      {data?.pages != null && (
        <Pagination
          page={page}
          pages={Math.max(1, data.pages)}
          busy={busy}
          onPrevious={() => setPage((current) => Math.max(1, current - 1))}
          onNext={() => setPage((current) => current + 1)}
        />
      )}
    </main>
  );
}

function Dashboard({ data }) {
  const metrics = [
    {
      key: "revenue",
      label: "Revenue",
      icon: IndianRupee,
      money: true,
    },
    {
      key: "orders",
      label: "Orders",
      icon: ShoppingBag,
    },
    {
      key: "users",
      label: "Customers",
      icon: UserRound,
    },
    {
      key: "products",
      label: "Products",
      icon: Package,
    },
    {
      key: "pendingReviews",
      label: "Pending Reviews",
      icon: Star,
    },
    {
      key: "openSupport",
      label: "Open Support",
      icon: MessageSquareText,
    },
    {
      key: "emailFailures",
      label: "Email Failures",
      icon: MailWarning,
    },
    {
      key: "outOfStock",
      label: "Out of Stock",
      icon: AlertTriangle,
    },
  ];

  return (
    <div className="space-y-6">
      <section className="rounded-3xl bg-[#2b1b11] p-6 text-white shadow-sm sm:p-8">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#d8b18c]">
              Store Health
            </p>

            <h2 className="mt-2 text-2xl font-semibold sm:text-3xl">
              Operations Dashboard
            </h2>

            <p className="mt-2 max-w-2xl text-sm leading-6 text-[#d6c7ba]">
              Monitor sales, customer activity and launch readiness.
            </p>
          </div>

          <span
            className={`
                            w-fit
                            rounded-full
                            px-3
                            py-1.5
                            text-xs
                            font-semibold

                            ${
                              data.storeReady && data.acceptingOrders
                                ? "bg-emerald-400/15 text-emerald-200"
                                : "bg-amber-300/15 text-amber-100"
                            }
                        `}
          >
            {data.storeReady && data.acceptingOrders
              ? "Store Accepting Orders"
              : "Launch Checklist Needs Attention"}
          </span>
        </div>
      </section>

      <section className="grid grid-cols-2 gap-3 xl:grid-cols-4">
        {metrics.map((metric) => {
          const Icon = metric.icon;

          return (
            <div
              key={metric.key}
              className="rounded-2xl border border-[#e8ded0] bg-[#fffdfa] p-4 shadow-sm sm:p-5"
            >
              <div className="flex items-center justify-between gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#f3ede5] text-[#8b5e3c]">
                  <Icon size={18} />
                </div>

                <p className="text-right text-[10px] font-semibold uppercase tracking-[0.13em] text-[#8f7a68]">
                  {metric.label}
                </p>
              </div>

              <strong className="mt-4 block text-2xl text-[#2b1b11]">
                {metric.money ? "₹" : ""}

                {Number(data[metric.key] || 0).toLocaleString("en-IN")}
              </strong>
            </div>
          );
        })}
      </section>

      <div className="grid gap-5 xl:grid-cols-[1.1fr_.9fr]">
        <section className="rounded-2xl border border-[#e8ded0] bg-[#fffdfa] p-5 shadow-sm">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h2 className="font-semibold text-[#2b1b11]">
                Low-stock Products
              </h2>

              <p className="mt-1 text-xs text-[#786454]">
                Products that may require inventory updates.
              </p>
            </div>

            <Link
              className="inline-flex items-center gap-1 text-xs font-semibold text-[#8b5e3c]"
              href="/admin/products?stock=false"
            >
              Open Catalog
              <ExternalLink size={13} />
            </Link>
          </div>

          <div className="mt-4 space-y-3">
            {data.lowStock?.length ? (
              data.lowStock.map((product) => (
                <div
                  className="flex items-center justify-between gap-4 rounded-xl bg-[#faf8f4] px-4 py-3"
                  key={product._id}
                >
                  <Link
                    className="truncate font-medium text-[#2b1b11] transition hover:text-[#8b5e3c]"
                    href={"/admin/products/edit/" + product._id}
                  >
                    {product.title}
                  </Link>

                  <span
                    className={`
                                                shrink-0
                                                rounded-full
                                                px-2.5
                                                py-1
                                                text-xs
                                                font-semibold

                                                ${
                                                  product.stockQuantity > 0
                                                    ? "bg-amber-50 text-amber-700"
                                                    : "bg-red-50 text-red-700"
                                                }
                                            `}
                  >
                    {product.stockQuantity} left
                  </span>
                </div>
              ))
            ) : (
              <p className="rounded-xl bg-[#faf8f4] p-4 text-sm text-[#786454]">
                No low-stock products.
              </p>
            )}
          </div>
        </section>

        <section className="rounded-2xl border border-[#e8ded0] bg-[#fffdfa] p-5 shadow-sm">
          <h2 className="font-semibold text-[#2b1b11]">Launch Health</h2>

          <p className="mt-1 text-xs text-[#786454]">
            Important store readiness checks.
          </p>

          <div className="mt-4 space-y-3 text-sm">
            <Health ok={data.storeReady} label="Business details & policies" />

            <Health
              ok={data.missingSku === 0}
              label={
                data.missingSku
                  ? `${data.missingSku} products missing SKU`
                  : "All products have SKU"
              }
            />

            <Health
              ok={data.outOfStock === 0}
              label={
                data.outOfStock
                  ? `${data.outOfStock} products out of stock`
                  : "Catalog stock available"
              }
            />

            <Health
              ok={data.emailFailures === 0}
              label={
                data.emailFailures
                  ? `${data.emailFailures} failed email jobs`
                  : "Email queue healthy"
              }
            />

            <Health ok={data.codEnabled} label="Cash on delivery configured" />
          </div>

          <Link
            className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-[#8b5e3c]"
            href="/admin/settings"
          >
            Review Store Settings
            <ChevronRight size={15} />
          </Link>
        </section>
      </div>

      <Link
        className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-[#8b5e3c] px-5 text-sm font-semibold text-white transition hover:bg-[#70482e]"
        href="/admin/orders"
      >
        Manage Orders
        <ChevronRight size={16} />
      </Link>
    </div>
  );
}

function AdminSection({ icon, title, description, children }) {
  return (
    <section className="overflow-hidden rounded-2xl border border-[#e8ded0] bg-[#fffdfa] shadow-sm">
      <SectionHeader icon={icon} title={title} description={description} />

      <div className="p-5 sm:p-6">{children}</div>
    </section>
  );
}

function SectionHeader({ icon, title, description, count }) {
  return (
    <div className="flex items-start justify-between gap-4 border-b border-[#eee5da] bg-[#faf8f4] px-5 py-4 sm:px-6">
      <div className="flex items-start gap-3">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#f0ebe3] text-[#8b5e3c]">
          {icon}
        </div>

        <div>
          <h2 className="text-[15px] font-semibold text-[#2b1b11] sm:text-[16px]">
            {title}
          </h2>

          {description && (
            <p className="mt-1 text-xs leading-5 text-[#8f7a68]">
              {description}
            </p>
          )}
        </div>
      </div>

      {count !== undefined && (
        <span className="shrink-0 rounded-full bg-[#f3ede5] px-3 py-1.5 text-[11px] font-semibold text-[#8b5e3c]">
          {count}
        </span>
      )}
    </div>
  );
}

function Field({ label, children }) {
  return (
    <label className="block min-w-0">
      <span className="mb-2 block text-sm font-medium text-[#5c4535]">
        {label}
      </span>

      {children}
    </label>
  );
}

function ToggleCard({ title, checked, onChange }) {
  return (
    <label
      className={`
                flex
                cursor-pointer
                items-center
                justify-between
                gap-4
                rounded-xl
                border
                p-4
                transition

                ${
                  checked
                    ? "border-[#c69a6b] bg-[#f7f2ec]"
                    : "border-[#e2d5c8] bg-white hover:bg-[#faf8f4]"
                }
            `}
    >
      <span className="text-sm font-medium text-[#2b1b11]">{title}</span>

      <div className="relative shrink-0">
        <input
          type="checkbox"
          checked={checked}
          onChange={(event) => onChange(event.target.checked)}
          className="peer sr-only"
        />

        <div className="h-6 w-11 rounded-full bg-[#d8c8b8] transition peer-checked:bg-[#8b5e3c]" />

        <div className="absolute left-1 top-1 h-4 w-4 rounded-full bg-white shadow-sm transition-transform peer-checked:translate-x-5" />
      </div>
    </label>
  );
}

function SaveBar({ busy, label }) {
  return (
    <section className="sticky bottom-4 z-20 rounded-2xl border border-[#e8ded0] bg-[#fffdfa]/95 p-4 shadow-lg backdrop-blur sm:p-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm font-semibold text-[#2b1b11]">
            Save your changes
          </p>

          <p className="mt-1 text-xs text-[#8f7a68]">
            Changes will apply across the store.
          </p>
        </div>

        <button
          type="submit"
          disabled={busy}
          className="inline-flex min-h-11 cursor-pointer items-center justify-center gap-2 rounded-xl bg-[#8b5e3c] px-7 text-sm font-semibold text-white transition hover:bg-[#70482e] disabled:cursor-not-allowed disabled:opacity-50"
        >
          {busy ? (
            <Loader2 size={16} className="animate-spin" />
          ) : (
            <Save size={16} />
          )}

          {busy ? "Saving..." : label}
        </button>
      </div>
    </section>
  );
}

function Pagination({ page, pages, busy, onPrevious, onNext }) {
  return (
    <div className="flex flex-col gap-3 rounded-2xl border border-[#e8ded0] bg-[#fffdfa] p-4 sm:flex-row sm:items-center sm:justify-between">
      <button
        type="button"
        disabled={page <= 1 || busy}
        onClick={onPrevious}
        className="inline-flex min-h-10 cursor-pointer items-center justify-center gap-2 rounded-lg border border-[#d8c8b8] bg-white px-4 text-sm font-medium text-[#5c4535] transition hover:bg-[#f3ede5] disabled:cursor-not-allowed disabled:opacity-40"
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
        disabled={page >= pages || busy}
        onClick={onNext}
        className="inline-flex min-h-10 cursor-pointer items-center justify-center gap-2 rounded-lg border border-[#d8c8b8] bg-white px-4 text-sm font-medium text-[#5c4535] transition hover:bg-[#f3ede5] disabled:cursor-not-allowed disabled:opacity-40"
      >
        Next
        <ChevronRight size={16} />
      </button>
    </div>
  );
}

function EmptyState({ icon, title, description }) {
  return (
    <div className="px-6 py-14 text-center">
      <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-[#f3ede5] text-[#8b5e3c]">
        {icon}
      </div>

      <h3 className="mt-4 font-semibold text-[#2b1b11]">{title}</h3>

      <p className="mt-2 text-sm text-[#786454]">{description}</p>
    </div>
  );
}

function LoadingCard() {
  return (
    <div className="flex min-h-[260px] items-center justify-center rounded-2xl border border-[#e8ded0] bg-[#fffdfa]">
      <div className="text-center">
        <Loader2 size={28} className="mx-auto animate-spin text-[#8b5e3c]" />

        <p className="mt-3 text-sm text-[#786454]">Loading data...</p>
      </div>
    </div>
  );
}

function Health({ ok, label }) {
  return (
    <div className="flex items-center justify-between gap-4 rounded-xl bg-[#faf8f4] px-4 py-3">
      <span className="text-[#5c4535]">{label}</span>

      <span
        className={`
                    rounded-full
                    px-2.5
                    py-1
                    text-xs
                    font-semibold

                    ${
                      ok
                        ? "bg-emerald-50 text-emerald-700"
                        : "bg-amber-50 text-amber-700"
                    }
                `}
      >
        {ok ? "Ready" : "Check"}
      </span>
    </div>
  );
}

function ReviewBadge({ status }) {
  const styles = {
    approved: "bg-emerald-50 text-emerald-700",
    rejected: "bg-red-50 text-red-700",
    pending: "bg-amber-50 text-amber-700",
  };

  return (
    <span
      className={`
                w-fit
                rounded-full
                px-2.5
                py-1
                text-[11px]
                font-semibold
                capitalize

                ${styles[status] || "bg-[#f3ede5] text-[#786454]"}
            `}
    >
      {status || "pending"}
    </span>
  );
}

function SupportBadge({ status }) {
  const closed = ["resolved", "closed"].includes(status);

  return (
    <span
      className={`
                w-fit
                rounded-full
                px-2.5
                py-1
                text-[11px]
                font-semibold
                capitalize

                ${
                  closed
                    ? "bg-emerald-50 text-emerald-700"
                    : "bg-amber-50 text-amber-700"
                }
            `}
    >
      {status || "open"}
    </span>
  );
}

function UserStatus({ active }) {
  return (
    <span
      className={`
                rounded-full
                px-2
                py-1
                text-[10px]
                font-semibold

                ${
                  active
                    ? "bg-emerald-50 text-emerald-700"
                    : "bg-red-50 text-red-700"
                }
            `}
    >
      {active ? "Active" : "Blocked"}
    </span>
  );
}

function InfoRow({ label, value }) {
  return (
    <div className="flex items-center justify-between gap-4">
      <span>{label}</span>

      <span className="font-medium text-[#2b1b11]">{value}</span>
    </div>
  );
}

function capitalize(value) {
  return (
    String(value || "")
      .charAt(0)
      .toUpperCase() + String(value || "").slice(1)
  );
}

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
    disabled:cursor-not-allowed
    disabled:opacity-60
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
