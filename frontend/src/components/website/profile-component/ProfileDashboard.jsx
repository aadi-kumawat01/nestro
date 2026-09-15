"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import React, { useCallback, useEffect, useRef, useState } from "react";

import {
  FiBox,
  FiUser,
  FiMapPin,
  FiSettings,
  FiLogOut,
  FiChevronLeft,
  FiChevronRight,
  FiEdit2,
  FiTrash2,
} from "react-icons/fi";

import { toast } from "sonner";

import Orders from "@/components/website/orders/Orders";

import { useDispatch } from "react-redux";

import {
  clearSession,
  bootstrapCart,
  refreshCart,
} from "@/redux/fetures/cartSlice";

import { client } from "@/utils/helper";
import {
  INDIA_STATES,
  citiesFor,
  normalizeIndianState,
} from "@/data/indiaLocations";

const profileTab = () => {
  if (typeof window === "undefined") return "orders";

  const tab = new URLSearchParams(window.location.search).get("tab");

  return ["orders", "personal", "addresses", "settings"].includes(tab)
    ? tab
    : "orders";
};

const profileForm = (user) => ({
  name: user?.name || "",
  email: user?.email || "",
  mobile: user?.mobile || "",
});

export default function ProfileDashboard() {
  const router = useRouter();

  const dispatch = useDispatch();

  const menuRef = useRef(null);

  const [activeTab, setActiveTab] = useState(profileTab);

  const [user, setUser] = useState(null);

  const [loading, setLoading] = useState(true);

  const [summary, setSummary] = useState({});

  useEffect(() => {
    client
      .get("user/summary")
      .then((response) => {
        setSummary(response.data.data || {});
      })
      .catch(() => {});
  }, []);

  const validateFields = (data, fields) => {
    for (const field of fields) {
      if (!String(data[field] || "").trim()) {
        return false;
      }
    }

    return true;
  };

  const getUser = useCallback(async () => {
    try {
      setLoading(true);

      const response = await client.get("user/get-me");

      if (response.data.success) {
        setUser(response.data.user);

        dispatch(bootstrapCart());
      }
    } catch (error) {
      toast.error(
        typeof error.response?.data?.message === "string"
          ? error.response.data.message
          : "Failed to load profile",
      );
    } finally {
      setLoading(false);
    }
  }, [dispatch]);

  useEffect(() => {
    void Promise.resolve().then(getUser);
  }, [getUser]);

  const updateProfile = async (data) => {
    try {
      if (!validateFields(data, ["name", "email", "mobile"])) {
        toast.error("Please fill all required fields.");

        return false;
      }

      const response = await client.put("user/update-profile", data);

      if (response.data.success) {
        toast.success(
          typeof response.data.message === "string"
            ? response.data.message
            : "Profile updated successfully",
        );

        await getUser();

        return true;
      }

      toast.error(response.data?.message || "Failed to update profile");

      return false;
    } catch (error) {
      toast.error(
        typeof error.response?.data?.message === "string"
          ? error.response.data.message
          : "Failed to update profile",
      );

      return false;
    }
  };

  const addAddress = async (data) => {
    try {
      if (
        !validateFields(data, [
          "fullName",
          "mobile",
          "pincode",
          "addressLine",
          "city",
          "state",
          "country",
        ])
      ) {
        toast.error("Please fill all required address fields.");

        return false;
      }

      const response = await client.post("user/address", data);

      if (response.data.success) {
        toast.success(
          typeof response.data.message === "string"
            ? response.data.message
            : "Address added successfully",
        );

        await getUser();

        return true;
      }

      toast.error(response.data?.message || "Failed to add address");

      return false;
    } catch (error) {
      toast.error(
        typeof error.response?.data?.message === "string"
          ? error.response.data.message
          : "Failed to add address",
      );

      return false;
    }
  };

  const updateAddress = async (addressId, data) => {
    try {
      if (
        !validateFields(data, [
          "fullName",
          "mobile",
          "pincode",
          "addressLine",
          "city",
          "state",
          "country",
        ])
      ) {
        toast.error("Please fill all required address fields.");

        return false;
      }

      const response = await client.put(`user/address/${addressId}`, data);

      if (response.data.success) {
        toast.success(
          typeof response.data.message === "string"
            ? response.data.message
            : "Address updated successfully",
        );

        await getUser();

        return true;
      }

      toast.error(response.data?.message || "Failed to update address");

      return false;
    } catch (error) {
      toast.error(
        typeof error.response?.data?.message === "string"
          ? error.response.data.message
          : "Failed to update address",
      );

      return false;
    }
  };

  const deleteAddress = async (addressId) => {
    try {
      const response = await client.delete(`user/address/${addressId}`);

      if (response.data.success) {
        toast.success(
          typeof response.data.message === "string"
            ? response.data.message
            : "Address deleted successfully",
        );

        await getUser();

        return true;
      }

      toast.error(response.data?.message || "Failed to delete address");

      return false;
    } catch (error) {
      toast.error(
        typeof error.response?.data?.message === "string"
          ? error.response.data.message
          : "Failed to delete address",
      );

      return false;
    }
  };

  const setDefaultAddress = async (addressId) => {
    try {
      const response = await client.patch(`user/address/${addressId}/default`);

      if (response.data.success) {
        toast.success(
          typeof response.data.message === "string"
            ? response.data.message
            : "Default address updated successfully",
        );

        await getUser();

        return true;
      }

      toast.error(response.data?.message || "Failed to set default address");

      return false;
    } catch (error) {
      toast.error(
        typeof error.response?.data?.message === "string"
          ? error.response.data.message
          : "Failed to set default address",
      );

      return false;
    }
  };

  const changePassword = async (data) => {
    try {
      if (
        !validateFields(data, [
          "currentPassword",
          "newPassword",
          "confirmPassword",
        ])
      ) {
        toast.error("Please fill all password fields.");

        return false;
      }

      if (data.newPassword !== data.confirmPassword) {
        toast.error("New password and confirm password do not match.");

        return false;
      }

      const response = await client.put("user/change-password", data);

      if (response.data.success) {
        toast.success(
          typeof response.data.message === "string"
            ? response.data.message
            : "Password changed successfully",
        );

        return true;
      }

      toast.error(response.data?.message || "Failed to change password");

      return false;
    } catch (error) {
      toast.error(
        typeof error.response?.data?.message === "string"
          ? error.response.data.message
          : "Failed to change password",
      );

      return false;
    }
  };

  const logout = async () => {
    try {
      await dispatch(refreshCart());

      const response = await client.post("user/logout");

      dispatch(clearSession());

      if (response.data.success) {
        toast.success("Signed out successfully");

        router.push("/sign-in");
      }
    } catch (error) {
      toast.error(
        typeof error.response?.data?.message === "string"
          ? error.response.data.message
          : "Failed to logout",
      );
    }
  };

  function slideMenu(direction) {
    if (menuRef.current) {
      menuRef.current.scrollBy({
        left: direction === "left" ? -180 : 180,

        behavior: "smooth",
      });
    }
  }

  const stats = [
    {
      value: summary.orders ?? "—",
      label: "Orders",
    },

    {
      value:
        summary.spent == null
          ? "—"
          : "₹" + Number(summary.spent).toLocaleString("en-IN"),

      label: "Spent",
    },

    {
      value: summary.wishlist ?? "—",
      label: "Wishlist",
    },

    {
      value: summary.reviews ?? "—",
      label: "Reviews",
    },
  ];

  const menuItems = [
    {
      id: "orders",
      label: "My Orders",
      icon: <FiBox />,
    },

    {
      id: "personal",
      label: "Personal Info",
      icon: <FiUser />,
    },

    {
      id: "addresses",
      label: "Addresses",
      icon: <FiMapPin />,
    },

    {
      id: "settings",
      label: "Settings",
      icon: <FiSettings />,
    },
  ];

  return (
    <section className="w-full max-w-full overflow-x-hidden bg-[#faf8f4] px-4 py-10 text-[#2b1b11] sm:px-6 sm:py-14 lg:px-10 [&_button]:focus-visible:outline-2 [&_button]:focus-visible:outline-offset-2 [&_button]:focus-visible:outline-[#8b5e3c] [&_a]:focus-visible:outline-2 [&_a]:focus-visible:outline-offset-2 [&_a]:focus-visible:outline-[#8b5e3c]">
      <div className="mb-8 sm:mb-10">
        <p className="mb-3 text-xs font-semibold uppercase tracking-[0.25em] text-[#8b5e3c]">
          Your Nestro account
        </p>

        <h1 className="text-3xl font-medium tracking-tight sm:text-4xl">
          A space of your own
        </h1>

        <p className="mt-3 text-sm leading-6 text-[#786454]">
          Manage your details, delivery addresses and account preferences.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-[minmax(0,300px)_minmax(0,1fr)] lg:gap-6">
        <aside className="min-w-0 max-w-full space-y-5 lg:sticky lg:top-24 lg:self-start">
          <div className="rounded-2xl border border-[#e8ded0] bg-[#fffdfa] p-6 text-center shadow-sm sm:p-8">
            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-[#f0ebe3] text-[24px] font-semibold text-[#8b5e3c] sm:h-24 sm:w-24 sm:text-[28px]">
              {loading ? "..." : user?.name?.charAt(0)?.toUpperCase() || ""}
            </div>

            <h2 className="mt-5 text-[19px] font-semibold text-[#1f1f1f] sm:text-[20px]">
              {loading ? "Loading..." : user?.name || ""}
            </h2>

            <p className="mt-1 break-all text-[13px] text-[#786454] sm:text-[14px]">
              {loading ? "Loading..." : user?.email || ""}
            </p>

            <span className="mt-4 inline-flex rounded-full bg-[#f0ebe3] px-4 py-1 text-[12px] tracking-[1.5px] text-[#8b5e3c]">
              Nestro Member
            </span>
          </div>

          <div className="max-w-full rounded-2xl border border-[#e8ded0] bg-[#fffdfa] p-4 shadow-sm">
            <div className="mb-3 flex items-center justify-between lg:hidden">
              <button
                type="button"
                aria-label="Scroll account menu left"
                onClick={() => slideMenu("left")}
                className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-full bg-[#f0ebe3] text-[#8b5e3c]"
              >
                <FiChevronLeft />
              </button>

              <p className="text-[12px] uppercase tracking-[3px] text-[#8b5e3c]">
                Account Menu
              </p>

              <button
                type="button"
                aria-label="Scroll account menu right"
                onClick={() => slideMenu("right")}
                className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-full bg-[#f0ebe3] text-[#8b5e3c]"
              >
                <FiChevronRight />
              </button>
            </div>

            <div
              role="navigation"
              aria-label="Account navigation"
              ref={menuRef}
              className="flex max-w-full snap-x snap-mandatory scroll-smooth gap-2 overflow-x-scroll pb-2 lg:flex-col lg:overflow-visible lg:pb-0"
            >
              {menuItems.map((item) => {
                const active = activeTab === item.id;

                if (item.id === "orders") {
                  return (
                    <Link
                      key={item.id}
                      href="/orders"
                      className="flex min-w-[165px] shrink-0 snap-start items-center justify-between gap-3 rounded-xl bg-[#8b5e3c] px-4 py-3 text-sm font-semibold text-white transition hover:bg-[#70482e] lg:min-w-0"
                    >
                      <span className="flex items-center gap-3">
                        <FiBox aria-hidden="true" />
                        My Orders
                      </span>

                      <FiChevronRight aria-hidden="true" />
                    </Link>
                  );
                }

                return (
                  <button
                    key={item.id}
                    aria-pressed={active}
                    type="button"
                    onClick={() => setActiveTab(item.id)}
                    className={`flex min-w-[165px] shrink-0 snap-start items-center gap-3 rounded-xl px-4 py-3 text-[14px] transition cursor-pointer sm:text-[15px] lg:min-w-0 lg:w-full ${
                      active
                        ? "bg-[#f0ebe3] text-[#8b5e3c] font-semibold ring-1 ring-inset ring-[#d8c8b8]"
                        : "text-[#5c4535] hover:bg-[#f7f2ec] hover:text-[#8b5e3c]"
                    }`}
                  >
                    <span className="min-w-max text-[17px]">{item.icon}</span>

                    <span className="whitespace-nowrap">{item.label}</span>
                  </button>
                );
              })}

              <button
                type="button"
                onClick={logout}
                className="flex min-w-[165px] shrink-0 snap-start cursor-pointer items-center gap-3 rounded-xl px-4 py-3 text-[14px] text-[#5c4535] transition hover:bg-[#f7f2ec] hover:text-[#8b5e3c] sm:text-[15px] lg:min-w-0 lg:w-full"
              >
                <FiLogOut className="min-w-max text-[17px]" />

                <span className="whitespace-nowrap">Sign Out</span>
              </button>
            </div>
          </div>
        </aside>

        <div className="min-w-0 max-w-full space-y-5">
          {loading && (
            <p
              role="status"
              className="rounded-2xl border border-[#e8ded0] bg-[#f3ede5] p-5 text-sm text-[#786454]"
            >
              Loading your account details...
            </p>
          )}

          {!loading && !user && (
            <div className="rounded-2xl border border-[#e8ded0] bg-[#fffdfa] p-6 text-sm text-[#786454]">
              Your profile is unavailable.
              <button
                type="button"
                onClick={getUser}
                className="ml-2 cursor-pointer font-semibold text-[#8b5e3c] underline underline-offset-4"
              >
                Try again
              </button>
              <Link
                href="/sign-in"
                className="ml-4 font-semibold text-[#8b5e3c] underline underline-offset-4"
              >
                Sign in
              </Link>
            </div>
          )}

          <div className="rounded-2xl border border-[#e8ded0] bg-[#fffdfa] p-4 shadow-sm sm:p-6">
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4">
              {stats.map((item, index) => (
                <div
                  key={index}
                  className="min-w-0 break-words rounded-xl bg-[#f3ede5] px-3 py-5 text-center sm:px-4"
                >
                  <h3 className="text-[22px] font-medium text-[#8b5e3c] sm:text-[27px]">
                    {item.value}
                  </h3>

                  <p className="mt-1 text-[12px] text-[#786454] sm:text-[13px]">
                    {item.label}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {activeTab === "orders" && <Orders />}

          {activeTab === "personal" && (
            <PersonalInfoContent
              key={`${user?._id || "pending"}:${user?.updatedAt || ""}`}
              user={user}
              loading={loading}
              updateProfile={updateProfile}
            />
          )}

          {activeTab === "addresses" && (
            <AddressesContent
              user={user}
              loading={loading}
              addAddress={addAddress}
              updateAddress={updateAddress}
              deleteAddress={deleteAddress}
              setDefaultAddress={setDefaultAddress}
            />
          )}

          {activeTab === "settings" && (
            <SettingsContent changePassword={changePassword} />
          )}
        </div>
      </div>
    </section>
  );
}

function PersonalInfoContent({ user, loading, updateProfile }) {
  const [formData, setFormData] = useState(() => profileForm(user));

  const [saving, setSaving] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setSaving(true);

      await updateProfile(formData);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-full overflow-hidden rounded-2xl border border-[#e8ded0] bg-[#fffdfa] p-5 shadow-sm sm:p-8">
      <h2 className="text-[17px] font-semibold text-[#1f1f1f] sm:text-[18px]">
        Personal Information
      </h2>

      <div className="my-5 h-px bg-[#e8ded0]" />

      <form
        onSubmit={handleSubmit}
        className="grid grid-cols-1 gap-5 md:grid-cols-2"
      >
        <Input
          label="Full Name"
          name="name"
          value={formData.name}
          onChange={handleChange}
          required
        />

        <Input
          label="Email"
          name="email"
          type="email"
          value={formData.email}
          onChange={handleChange}
          required
        />

        <Input
          label="Mobile"
          name="mobile"
          value={formData.mobile}
          onChange={handleChange}
          required
        />

        <div className="md:col-span-2">
          <button
            type="submit"
            disabled={saving || loading}
            className="w-full cursor-pointer rounded-lg bg-[#8b5e3c] px-7 py-3 text-[14px] font-semibold text-white transition hover:bg-[#70482d] disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
          >
            {saving ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </form>
    </div>
  );
}

function AddressesContent({
  user,
  loading,
  addAddress,
  updateAddress,
  deleteAddress,
  setDefaultAddress,
}) {
  const [showForm, setShowForm] = useState(
    () =>
      typeof window !== "undefined" &&
      new URLSearchParams(window.location.search).get("addAddress") === "true",
  );

  const [editingId, setEditingId] = useState(null);

  const [saving, setSaving] = useState(false);

  const [manualCity, setManualCity] = useState(false);

  const [locationLoading, setLocationLoading] = useState(false);

  const [locationError, setLocationError] = useState("");

  const [formData, setFormData] = useState({
    fullName: "",

    mobile: "",

    pincode: "",

    addressLine: "",

    city: "",

    state: "",

    country: "India",

    isDefault: false,
  });

  const addresses = user?.addresses || [];

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    if (name === "state") setManualCity(false);

    setFormData((prev) => ({
      ...prev,

      [name]: type === "checkbox" ? checked : value,

      ...(name === "state" ? { city: "" } : {}),

      country: "India",
    }));
  };

  const resetForm = () => {
    setFormData({
      fullName: "",

      mobile: "",

      pincode: "",

      addressLine: "",

      city: "",

      state: "",

      country: "India",

      isDefault: false,
    });

    setEditingId(null);

    setManualCity(false);

    setShowForm(false);

    setLocationError("");
  };

  const getCurrentLocation = () => {
    setLocationError("");

    if (!navigator.geolocation) {
      setLocationError("Geolocation is not supported by your browser.");

      return;
    }

    setLocationLoading(true);

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const { latitude, longitude } = position.coords;

          const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&addressdetails=1`,
          );

          if (!response.ok) {
            throw new Error("Unable to detect address");
          }

          const data = await response.json();

          const address = data.address || {};

          setFormData((prev) => ({
            ...prev,

            addressLine: [
              address.house_number,
              address.road,
              address.neighbourhood,
              address.suburb,
            ]
              .filter(Boolean)
              .join(", "),

            city:
              address.city ||
              address.town ||
              address.village ||
              address.municipality ||
              "",

            state: normalizeIndianState(address.state),

            pincode: address.postcode || "",

            country: "India",
          }));

          setManualCity(false);

          setShowForm(true);

          toast.success("Current location detected");
        } catch (error) {
          setLocationError(
            "Unable to detect your address. Please enter it manually.",
          );
        } finally {
          setLocationLoading(false);
        }
      },

      (error) => {
        setLocationLoading(false);

        if (error.code === error.PERMISSION_DENIED) {
          setLocationError(
            "Location permission denied. Please allow location access.",
          );
        } else if (error.code === error.POSITION_UNAVAILABLE) {
          setLocationError("Your current location could not be detected.");
        } else if (error.code === error.TIMEOUT) {
          setLocationError("Location request timed out. Please try again.");
        } else {
          setLocationError("Unable to detect your location. Please try again.");
        }
      },

      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      },
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setSaving(true);

      let success = false;

      if (editingId) {
        success = await updateAddress(editingId, formData);
      } else {
        success = await addAddress(formData);
      }

      if (!success) {
        return;
      }

      resetForm();
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (address) => {
    setFormData({
      fullName: address.fullName || "",

      mobile: address.mobile || "",

      pincode: address.pincode || "",

      addressLine: address.addressLine || "",

      city: address.city || "",

      state: normalizeIndianState(address.state),

      country: "India",

      isDefault: address.isDefault || false,
    });

    setEditingId(address._id);

    setManualCity(false);

    setShowForm(true);

    setLocationError("");
  };

  const handleDelete = async (addressId) => {
    if (!window.confirm("Are you sure you want to delete this address?")) {
      return;
    }

    await deleteAddress(addressId);
  };

  return (
    <div className="max-w-full overflow-hidden rounded-2xl border border-[#e8ded0] bg-[#fffdfa] p-5 shadow-sm sm:p-8">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h2 className="text-[16px] font-semibold text-[#2b1b11]">
            Saved Addresses
          </h2>

          <p className="mt-1 text-[12px] text-[#786454]">
            Manage your delivery addresses
          </p>
        </div>

        {!showForm && (
          <button
            type="button"
            onClick={() => {
              setShowForm(true);

              setLocationError("");
            }}
            className="w-full cursor-pointer rounded-md border border-[#c69a6b] px-5 py-2.5 text-[13px] font-medium text-[#8b5e3c] transition hover:bg-[#f0ebe3] sm:w-auto"
          >
            + Add New Address
          </button>
        )}
      </div>

      <div className="my-5 h-px bg-[#e8ded0]" />

      {loading ? (
        <p className="text-[13px] text-[#786454]">Loading addresses...</p>
      ) : addresses.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-[#d8c8b8] bg-[#faf8f4] px-6 py-10 text-center">
          <FiMapPin className="mx-auto text-[25px] text-[#8b5e3c]" />

          <p className="mt-3 text-[14px] font-medium text-[#2b1b11]">
            No saved addresses
          </p>

          <p className="mt-1 text-[12px] text-[#786454]">
            Add an address to continue with your order.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {addresses.map((item) => (
            <div
              key={item._id}
              className="relative min-w-0 rounded-xl border border-[#e2d5c8] bg-[#faf8f4] px-5 py-5"
            >
              {item.isDefault && (
                <span className="absolute right-3 top-3 rounded-full bg-[#f0ebe3] px-3 py-1 text-[10px] text-[#8b5e3c]">
                  Default
                </span>
              )}

              <h3 className="mb-2 pr-20 text-[14px] font-semibold text-[#2b1b11]">
                {item.fullName}
              </h3>

              <p className="break-words text-[13px] leading-6 text-[#786454]">
                {item.mobile}
              </p>

              <p className="break-words text-[13px] leading-6 text-[#786454]">
                {item.addressLine}
              </p>

              <p className="break-words text-[13px] leading-6 text-[#786454]">
                {item.city}, {item.state} - {item.pincode}
              </p>

              <p className="break-words text-[13px] leading-6 text-[#786454]">
                {item.country}
              </p>

              <div className="mt-4 flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => handleEdit(item)}
                  className="flex cursor-pointer items-center gap-1.5 rounded-md border border-[#ddd4c8] px-3 py-2 text-[12px] text-[#8b5e3c] transition hover:bg-[#f0ebe3]"
                >
                  <FiEdit2 />
                  Edit
                </button>

                <button
                  type="button"
                  onClick={() => handleDelete(item._id)}
                  className="flex cursor-pointer items-center gap-1.5 rounded-md border border-red-200 px-3 py-2 text-[12px] text-red-600 transition hover:bg-red-50"
                >
                  <FiTrash2 />
                  Delete
                </button>

                {!item.isDefault && (
                  <button
                    type="button"
                    onClick={() => setDefaultAddress(item._id)}
                    className="cursor-pointer rounded-md border border-[#ddd4c8] px-3 py-2 text-[12px] text-[#5c4535] transition hover:bg-[#f0ebe3]"
                  >
                    Set Default
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {showForm && (
        <form
          onSubmit={handleSubmit}
          className="mt-5 rounded-lg border border-[#e2d5c8] p-4 sm:p-5"
        >
          <div className="mb-5 flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
            <div>
              <h3 className="text-[14px] font-semibold text-[#2b1b11]">
                {editingId ? "Edit Address" : "Add New Address"}
              </h3>

              <p className="mt-1 text-[12px] text-[#786454]">
                Enter your delivery address
              </p>
            </div>

            {!editingId && (
              <button
                type="button"
                onClick={getCurrentLocation}
                disabled={locationLoading}
                className="flex cursor-pointer items-center justify-center gap-2 rounded-md border border-[#c69a6b] px-4 py-2.5 text-[12px] font-medium text-[#8b5e3c] transition hover:bg-[#f0ebe3] disabled:cursor-not-allowed disabled:opacity-60"
              >
                <FiMapPin />

                {locationLoading
                  ? "Detecting Location..."
                  : "Use Current Location"}
              </button>
            )}
          </div>

          {/* Location specific error stays inside form */}

          {locationError && (
            <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-[12px] text-red-600">
              {locationError}
            </div>
          )}

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <Input
              label="Full Name"
              name="fullName"
              value={formData.fullName}
              onChange={handleChange}
              placeholder="Enter full name"
              required
            />

            <Input
              label="Mobile"
              name="mobile"
              value={formData.mobile}
              onChange={handleChange}
              placeholder="Enter mobile number"
              required
            />

            <Input
              label="Pincode"
              name="pincode"
              value={formData.pincode}
              onChange={handleChange}
              placeholder="Enter pincode"
              required
            />

            <Input
              label="Address Line"
              name="addressLine"
              value={formData.addressLine}
              onChange={handleChange}
              placeholder="House no, street, area"
              required
            />

            <SelectInput
              label="State"
              name="state"
              value={formData.state}
              onChange={handleChange}
              placeholder="Select state"
              options={INDIA_STATES}
              required
            />

            <SelectInput
              label="City"
              name="cityChoice"
              value={manualCity ? "__other__" : formData.city}
              onChange={(event) => {
                if (event.target.value === "__other__") {
                  setManualCity(true);
                  setFormData((prev) => ({
                    ...prev,
                    city: "",
                    country: "India",
                  }));
                } else {
                  setManualCity(false);
                  setFormData((prev) => ({
                    ...prev,
                    city: event.target.value,
                    country: "India",
                  }));
                }
              }}
              placeholder={
                formData.state ? "Select city" : "Select state first"
              }
              options={[
                ...citiesFor(formData.state, formData.city),
                "__other__",
              ]}
              disabled={!formData.state}
              required
            />

            {manualCity && (
              <Input
                label="City / Town Name"
                name="city"
                value={formData.city}
                onChange={handleChange}
                placeholder="Enter your city or town"
                required
              />
            )}

            <Input
              label="Country"
              name="country"
              value="India"
              readOnly
              required
            />

            <div className="flex items-center gap-3 pt-7">
              <input
                type="checkbox"
                name="isDefault"
                id="profile-default-address"
                checked={formData.isDefault}
                onChange={handleChange}
                className="h-4 w-4 cursor-pointer accent-[#8b5e3c]"
              />

              <label
                htmlFor="profile-default-address"
                className="cursor-pointer text-[13px] text-[#5c4535]"
              >
                Set as default address
              </label>
            </div>
          </div>

          <div className="mt-5 flex flex-col gap-3 sm:flex-row">
            <button
              type="submit"
              disabled={saving}
              className="cursor-pointer rounded-md bg-[#8b5e3c] px-6 py-3 text-[13px] font-semibold text-white transition hover:bg-[#70482d] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {saving
                ? "Saving..."
                : editingId
                  ? "Update Address"
                  : "Add Address"}
            </button>

            <button
              type="button"
              onClick={resetForm}
              className="cursor-pointer rounded-md border border-[#ddd4c8] px-6 py-3 text-[13px] font-medium text-[#5c4535] transition hover:bg-[#f0ebe3]"
            >
              Cancel
            </button>
          </div>
        </form>
      )}
    </div>
  );
}

function SettingsContent({ changePassword }) {
  const [marketing, setMarketing] = useState(false);

  const [formData, setFormData] = useState({
    currentPassword: "",

    newPassword: "",

    confirmPassword: "",
  });

  const [saving, setSaving] = useState(false);

  useEffect(() => {
    client
      .get("user/get-me")
      .then((response) => {
        setMarketing(response.data.user?.preferences?.marketingEmail === true);
      })
      .catch(() => {});
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,

      [name]: value,
    }));
  };

  const handleMarketingChange = async (e) => {
    const value = e.target.checked;

    try {
      await client.put("user/preferences", {
        marketingEmail: value,
      });

      setMarketing(value);

      toast.success(
        value ? "Marketing emails enabled" : "Marketing emails disabled",
      );
    } catch (error) {
      toast.error(
        typeof error.response?.data?.message === "string"
          ? error.response.data.message
          : "Unable to save preference",
      );
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setSaving(true);

      const success = await changePassword(formData);

      if (!success) {
        return;
      }

      setFormData({
        currentPassword: "",

        newPassword: "",

        confirmPassword: "",
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-full overflow-hidden rounded-2xl border border-[#e8ded0] bg-[#fffdfa] p-5 shadow-sm sm:p-8">
      <h2 className="text-[16px] font-semibold text-[#2b1b11]">
        Account Settings
      </h2>

      <div className="my-5 h-px bg-[#e8ded0]" />

      <div className="space-y-5">
        <div className="rounded-xl border border-[#e2d5c8] bg-white p-4">
          <label className="flex cursor-pointer items-center gap-3">
            <input
              type="checkbox"
              checked={marketing}
              onChange={handleMarketingChange}
              className="h-4 w-4 cursor-pointer accent-[#8b5e3c]"
            />

            <span className="text-sm font-medium text-[#5c4535]">
              Email me offers and design tips
            </span>
          </label>

          <p className="mt-2 text-sm leading-6 text-[#786454]">
            Order updates are always sent by email.
          </p>
        </div>

        <div className="rounded-lg border border-[#e2d5c8] bg-white px-4 py-4">
          <h3 className="mb-4 text-[14px] font-semibold text-[#2b1b11]">
            Change Password
          </h3>

          <form
            onSubmit={handleSubmit}
            className="grid grid-cols-1 gap-4 md:grid-cols-2"
          >
            <Input
              label="Current Password"
              name="currentPassword"
              type="password"
              value={formData.currentPassword}
              onChange={handleChange}
              required
            />

            <Input
              label="New Password"
              name="newPassword"
              type="password"
              value={formData.newPassword}
              onChange={handleChange}
              required
            />

            <Input
              label="Confirm Password"
              name="confirmPassword"
              type="password"
              value={formData.confirmPassword}
              onChange={handleChange}
              required
            />

            <div className="md:col-span-2">
              <button
                type="submit"
                disabled={saving}
                className="w-full cursor-pointer rounded-md bg-[#8b5e3c] px-5 py-2.5 text-[13px] font-semibold text-white transition hover:bg-[#70482d] disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
              >
                {saving ? "Updating..." : "Update Password"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

function Input({
  label,
  name,
  type = "text",
  value,
  onChange,
  placeholder,
  required = false,
  readOnly = false,
}) {
  return (
    <div className="min-w-0">
      <label
        htmlFor={`profile-${name}`}
        className="mb-2 block text-sm font-medium text-[#5c4535]"
      >
        {label}
      </label>

      <input
        id={`profile-${name}`}
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        required={required}
        readOnly={readOnly}
        className="h-12 w-full rounded-xl border border-[#d8c8b8] bg-[#faf8f4] px-4 text-sm text-[#2b1b11] outline-none transition focus:border-[#8b5e3c] focus:ring-2 focus:ring-[#8b5e3c]/20 read-only:cursor-not-allowed read-only:bg-[#eee8e1] read-only:text-[#786454]"
      />
    </div>
  );
}

function SelectInput({
  label,
  name,
  value,
  onChange,
  options,
  placeholder,
  required = false,
  disabled = false,
}) {
  return (
    <div className="min-w-0">
      <label
        htmlFor={`profile-${name}`}
        className="mb-2 block text-sm font-medium text-[#5c4535]"
      >
        {label}
      </label>
      <select
        id={`profile-${name}`}
        name={name}
        value={value}
        onChange={onChange}
        required={required}
        disabled={disabled}
        className="h-12 w-full cursor-pointer rounded-xl border border-[#d8c8b8] bg-[#faf8f4] px-4 text-sm text-[#2b1b11] outline-none transition focus:border-[#8b5e3c] focus:ring-2 focus:ring-[#8b5e3c]/20 disabled:cursor-not-allowed disabled:bg-[#eee8e1] disabled:text-[#9b897b]"
      >
        <option value="">{placeholder}</option>
        {options.map((option) => (
          <option key={option} value={option}>
            {option === "__other__" ? "Other city / town" : option}
          </option>
        ))}
      </select>
    </div>
  );
}
