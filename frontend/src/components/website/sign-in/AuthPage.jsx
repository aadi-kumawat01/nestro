"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { FiEye, FiEyeOff, FiTruck, FiStar, FiPercent } from "react-icons/fi";
import { useDispatch } from "react-redux";
import { bootstrapCart } from "@/redux/fetures/cartSlice";

import { client } from "@/utils/helper";

export default function AuthPage() {
  const router = useRouter();
  const dispatch = useDispatch();

  const [activeForm, setActiveForm] = useState("signin");
  const [showPassword, setShowPassword] = useState(false);
  const [message, setMessage] = useState("");
  const [accountExists, setAccountExists] = useState(false);
  const [checkingAccount, setCheckingAccount] = useState(false);
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    phone: "+91 ",
    terms: false,
    offers: false,
  });

  function handleChange(e) {
    const { name, value, type, checked } = e.target;

    setForm({
      ...form,
      [name]: type === "checkbox" ? checked : value,
    });
    if (name === "email") {
      setAccountExists(false);
      if (message.includes("already exists")) setMessage("");
    }
  }

  async function checkAccount() {
    if (activeForm !== "signup" || !/^\S+@\S+\.\S+$/.test(form.email)) return;
    setCheckingAccount(true);
    try {
      const { data } = await client.post("user/account-exists", {
        email: form.email,
      });
      setAccountExists(Boolean(data.exists));
      setMessage(
        data.exists
          ? "An account already exists with this email. Sign in or reset your password."
          : "",
      );
    } catch {
      // Do not block registration if the availability check is temporarily unavailable.
    } finally {
      setCheckingAccount(false);
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setMessage("");
    setAccountExists(false);
    setLoading(true);
    try {
      if (activeForm === "signup") {
        if (!form.terms || form.password.length < 10)
          throw new Error(
            "Accept the terms and use a password with at least 10 characters.",
          );
        await client.post("user/register", {
          name: form.name,
          email: form.email,
          password: form.password,
          mobile: form.phone,
          marketingEmail: form.offers,
        });
        router.push("/verify_otp?email=" + encodeURIComponent(form.email));
      } else {
        await client.post("user/login", {
          email: form.email,
          password: form.password,
        });
        await dispatch(bootstrapCart());
        const next = new URLSearchParams(window.location.search).get("next");
        router.replace(
          next?.startsWith("/") &&
            !next.startsWith("//") &&
            !next.includes("\\")
            ? next
            : "/",
        );
      }
    } catch (error) {
      setMessage(error.response?.data?.message || error.message);
      setAccountExists(error.response?.data?.code === "ACCOUNT_EXISTS");
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="w-full min-h-[calc(100vh-66px)] bg-[#fafaf9f7]">
      <div className="grid grid-cols-1 lg:grid-cols-[42%_58%] min-h-[calc(100vh-66px)]">
        <div className="bg-[#2b1b11] min-h-[520px] lg:min-h-[calc(100vh-66px)] flex items-center justify-center px-6 py-10">
          <div className="w-full max-w-[560px] text-center">
            <h2 className="text-white text-[22px] font-semibold tracking-[7px]">
              NESTRO<span className="text-[#c58b5c]">.</span>
            </h2>

            <div className="mt-20 flex justify-center">
              <FurnitureSofa />
            </div>

            <h1 className="mt-16 text-white text-[32px] sm:text-[38px] leading-[1.18] font-medium">
              Your{" "}
              <span className="italic text-[#e0b58f] font-light">
                Dream Home
              </span>
              <br />
              Starts Here
            </h1>

            <p className="mt-6 text-[#b9ada5] text-[15px] leading-6">
              Find furniture for a home that feels like you.
            </p>

            <div className="mt-10 max-w-[360px] mx-auto space-y-5 text-left">
              <LeftFeature
                icon={<FiTruck />}
                text="Delivery options available at checkout"
              />

              <LeftFeature
                icon={<FiStar />}
                text="Track your orders from your account"
              />

              <LeftFeature
                icon={<FiPercent />}
                text="Save your favourite furniture"
              />
            </div>
          </div>
        </div>

        <div className="bg-[#fafaf9f7] min-h-[calc(100vh-66px)] flex items-center justify-center px-5 sm:px-8 lg:px-12 py-12">
          <div className="w-full max-w-[430px]">
            <div className="border-b border-[#e2d5c8] flex items-center gap-8 mb-7">
              <button
                type="button"
                onClick={() => {
                  setActiveForm("signin");
                  setMessage("");
                }}
                className={`pb-3 text-[15px] transition cursor-pointer ${
                  activeForm === "signin"
                    ? "text-[#8b5e3c] border-b border-[#8b5e3c]"
                    : "text-[#667085] hover:text-[#8b5e3c]"
                }`}
              >
                Sign in
              </button>

              <button
                type="button"
                onClick={() => {
                  setActiveForm("signup");
                  setMessage("");
                }}
                className={`pb-3 text-[15px] transition cursor-pointer ${
                  activeForm === "signup"
                    ? "text-[#8b5e3c] border-b border-[#8b5e3c]"
                    : "text-[#667085] hover:text-[#8b5e3c]"
                }`}
              >
                Create account
              </button>
            </div>

            <h1 className="text-[28px] font-semibold text-[#111111]">
              {activeForm === "signin" ? "Welcome back" : "Create account"}
            </h1>

            <p className="mt-2 text-[15px] text-[#667085]">
              {activeForm === "signin"
                ? "Sign in to your Nestro account to continue."
                : "Join Nestro and start designing your dream home."}
            </p>

            {message && (
              <div
                className={`mt-5 rounded-xl border px-4 py-3 text-[13px] ${accountExists ? "border-[#e0c7ad] bg-[#fff8ef] text-[#70482e]" : "border-red-200 bg-red-50 text-red-600"}`}
              >
                <p>{message}</p>
                {accountExists && (
                  <div className="mt-3 flex flex-wrap gap-3">
                    <button
                      type="button"
                      onClick={() => {
                        setActiveForm("signin");
                        setMessage("");
                        setAccountExists(false);
                      }}
                      className="font-semibold underline underline-offset-4"
                    >
                      Sign in instead
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        router.push(
                          `/forgot-password?email=${encodeURIComponent(form.email)}`,
                        )
                      }
                      className="font-semibold underline underline-offset-4"
                    >
                      Reset password
                    </button>
                  </div>
                )}
              </div>
            )}

            <form onSubmit={handleSubmit} className="mt-8 space-y-5">
              {activeForm === "signup" && (
                <Input
                  label="Full name"
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                />
              )}

              <Input
                label="Email address"
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                onBlur={checkAccount}
              />

              <PasswordInput
                label="Password"
                name="password"
                value={form.password}
                onChange={handleChange}
                showPassword={showPassword}
                setShowPassword={setShowPassword}
                placeholder={
                  activeForm === "signin" ? "••••••••" : "Min. 10 characters"
                }
              />

              {activeForm === "signup" && (
                <div>
                  <label className="block text-[13px] tracking-[0.4px] text-[#667085] mb-2">
                    Phone number
                  </label>

                  <div className="flex w-full h-11 rounded-md border border-[#ddd4c8] bg-white overflow-hidden focus-within:border-[#8b5e3c]">
                    <div className="flex items-center px-4 text-[15px] text-[#344054] border-r border-[#ddd4c8] bg-[#faf9f7]">
                      +91
                    </div>

                    <input
                      type="tel"
                      name="phone"
                      value={form.phone.replace("+91 ", "")}
                      onChange={(e) => {
                        const value = e.target.value
                          .replace(/\D/g, "")
                          .slice(0, 10);

                        setForm({
                          ...form,
                          phone: `+91 ${value}`,
                        });
                      }}
                      placeholder="Enter 10 digit mobile number"
                      required
                      className="w-full px-4 text-[15px] text-[#344054] outline-none"
                    />
                  </div>
                </div>
              )}

              {activeForm === "signin" && (
                <div className="flex justify-end -mt-3">
                  <button
                    type="button"
                    onClick={() => router.push("/forgot-password")}
                    className="text-[13px] text-[#8b5e3c] hover:underline cursor-pointer"
                  >
                    Forgot password?
                  </button>
                </div>
              )}

              {activeForm === "signup" && (
                <div className="space-y-3">
                  <label className="flex items-center gap-3 text-[13px] text-[#667085] cursor-pointer">
                    <input
                      type="checkbox"
                      name="terms"
                      checked={form.terms}
                      onChange={handleChange}
                      className="w-4 h-4 accent-[#8b5e3c]"
                    />

                    <span>
                      I agree to the{" "}
                      <span className="text-[#8b5e3c]">Terms of Service</span> &{" "}
                      <span className="text-[#8b5e3c]">Privacy Policy</span>
                    </span>
                  </label>

                  <label className="flex items-center gap-3 text-[13px] text-[#667085] cursor-pointer">
                    <input
                      type="checkbox"
                      name="offers"
                      checked={form.offers}
                      onChange={handleChange}
                      className="w-4 h-4 accent-[#8b5e3c]"
                    />

                    <span>Send me design tips & exclusive offers</span>
                  </label>
                </div>
              )}

              <button
                type="submit"
                disabled={
                  loading ||
                  checkingAccount ||
                  (activeForm === "signup" && (!form.terms || accountExists))
                }
                className={`w-full h-12 rounded-md bg-[#98663e] text-white text-[15px] font-semibold transition ${
                  loading ||
                  checkingAccount ||
                  (activeForm === "signup" && (!form.terms || accountExists))
                    ? "opacity-60 cursor-not-allowed"
                    : "hover:bg-[#815431] cursor-pointer"
                }`}
              >
                {checkingAccount
                  ? "Checking email..."
                  : loading
                    ? activeForm === "signin"
                      ? "Signing in..."
                      : "Creating account..."
                    : activeForm === "signin"
                      ? "Sign in"
                      : "Create Account"}
              </button>
            </form>

            {activeForm === "signin" && (
              <p className="mt-5 text-center text-[13px] text-[#667085]">
                Don&apos;t have an account?{" "}
                <button
                  type="button"
                  onClick={() => {
                    setActiveForm("signup");
                    setMessage("");
                  }}
                  className="text-[#8b5e3c] cursor-pointer hover:underline"
                >
                  Create one free
                </button>
              </p>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

function Input({ label, name, type = "text", value, onChange, onBlur }) {
  return (
    <div>
      <label className="block text-[13px] tracking-[0.4px] text-[#667085] mb-2">
        {label}
      </label>

      <input
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        onBlur={onBlur}
        required
        className="w-full h-11 rounded-md border border-[#ddd4c8] bg-white px-4 text-[15px] text-[#344054] outline-none focus:border-[#8b5e3c]"
      />
    </div>
  );
}

function PasswordInput({
  label,
  name,
  value,
  onChange,
  showPassword,
  setShowPassword,
  placeholder,
}) {
  return (
    <div>
      <label className="block text-[13px] tracking-[0.4px] text-[#667085] mb-2">
        {label}
      </label>

      <div className="relative">
        <input
          type={showPassword ? "text" : "password"}
          name={name}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          required
          className="w-full h-11 rounded-md border border-[#ddd4c8] bg-white px-4 pr-11 text-[15px] text-[#344054] outline-none focus:border-[#8b5e3c]"
        />

        <button
          type="button"
          onClick={() => setShowPassword(!showPassword)}
          className="absolute right-4 top-1/2 -translate-y-1/2 text-[#667085] hover:text-[#8b5e3c] cursor-pointer"
        >
          {showPassword ? <FiEyeOff /> : <FiEye />}
        </button>
      </div>
    </div>
  );
}

function LeftFeature({ icon, text }) {
  return (
    <div className="flex items-center gap-4">
      <div className="min-w-9 h-9 rounded-lg bg-[#5b3822] text-[#d49b67] flex items-center justify-center text-[17px]">
        {icon}
      </div>

      <p className="text-[#c6bbb3] text-[14px] leading-6">{text}</p>
    </div>
  );
}

function FurnitureSofa() {
  return (
    <div className="relative w-[150px] h-[110px]">
      <div className="absolute left-[16px] top-[35px] w-[118px] h-[55px] rounded-lg bg-[#8d694a] opacity-80"></div>

      <div className="absolute left-[25px] top-[25px] w-[42px] h-[38px] rounded-lg bg-[#a68b73] opacity-50"></div>

      <div className="absolute right-[25px] top-[25px] w-[42px] h-[38px] rounded-lg bg-[#a68b73] opacity-50"></div>

      <div className="absolute left-[5px] top-[45px] w-[24px] h-[60px] rounded-lg bg-[#8a5b36] opacity-80"></div>

      <div className="absolute right-[5px] top-[45px] w-[24px] h-[60px] rounded-lg bg-[#8a5b36] opacity-80"></div>

      <div className="absolute left-[18px] top-[55px] w-[114px] h-[44px] rounded-md bg-[#7a5a40] opacity-75"></div>

      <div className="absolute left-[22px] bottom-0 w-[20px] h-[14px] rounded bg-[#5a3822] opacity-80"></div>

      <div className="absolute right-[22px] bottom-0 w-[20px] h-[14px] rounded bg-[#5a3822] opacity-80"></div>
    </div>
  );
}
