"use client";

import React, { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { client } from "@/utils/helper";

export default function VerifyOtpPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const email = searchParams.get("email");

  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [loading, setLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [success, setSuccess] = useState("");

  function handleChange(e, index) {
    const value = e.target.value.replace(/\D/g, "").slice(0, 1);

    const newOtp = [...otp];
    newOtp[index] = value;

    setOtp(newOtp);
    setMessage("");
    setSuccess("");

    if (value && index < 5) {
      document.getElementById(`otp-${index + 1}`)?.focus();
    }
  }

  function handleKeyDown(e, index) {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      document.getElementById(`otp-${index - 1}`)?.focus();
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();

    setMessage("");
    setSuccess("");

    const otpValue = otp.join("");

    if (otpValue.length !== 6) {
      setMessage("Please enter the complete 6 digit OTP.");
      return;
    }

    if (!email) {
      setMessage("Email not found. Please signup again.");
      return;
    }

    try {
      setLoading(true);

      const response = await client.post("user/verify-otp", {
        email,
        otp: otpValue,
      });

      if (response.data.success) {
        setSuccess(response.data.message || "User verified successfully");

        setTimeout(() => {
          router.push("/sign-in");
        }, 1200);
      }
    } catch (error) {
      setMessage(
        error.response?.data?.message ||
          "Unable to verify OTP. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  }

  async function handleResend() {
    setMessage("");
    setSuccess("");
    setResendLoading(true);
    try {
      const { data } = await client.post("user/resend-otp", { email });
      setSuccess(
        data.message ||
          "New code sent. Please wait one minute before requesting another.",
      );
    } catch (error) {
      setMessage(error.response?.data?.message || "Unable to resend code.");
    } finally {
      setResendLoading(false);
    }
  }

  const missingEmailMessage = !email
    ? "Email not found. Please signup again."
    : "";

  return (
    <main className="min-h-screen bg-[#fafaf9f7] flex items-center justify-center px-5 py-10">
      <div className="w-full max-w-[430px]">
        <div className="text-center mb-8">
          <h2 className="text-[#2b1b11] text-[22px] font-semibold tracking-[7px]">
            NESTRO<span className="text-[#c58b5c]">.</span>
          </h2>

          <h1 className="mt-8 text-[28px] font-semibold text-[#111111]">
            Verify your email
          </h1>

          <p className="mt-2 text-[15px] leading-6 text-[#667085]">
            Enter the 6 digit OTP sent to
          </p>

          {email && (
            <p className="mt-1 text-[14px] font-medium text-[#8b5e3c] break-all">
              {email}
            </p>
          )}
        </div>

        <div className="rounded-xl border border-[#e2d5c8] bg-white p-6 sm:p-8 shadow-sm">
          {(message || missingEmailMessage) && (
            <div className="mb-5 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-[13px] text-red-600">
              {message || missingEmailMessage}
            </div>
          )}

          {success && (
            <div className="mb-5 rounded-md border border-green-200 bg-green-50 px-4 py-3 text-[13px] text-green-600">
              {success}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="flex items-center justify-center gap-2 sm:gap-3">
              {otp.map((digit, index) => (
                <input
                  key={index}
                  id={`otp-${index}`}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleChange(e, index)}
                  onKeyDown={(e) => handleKeyDown(e, index)}
                  disabled={loading}
                  className="w-11 h-12 sm:w-12 sm:h-13 rounded-md border border-[#ddd4c8] bg-white text-center text-[20px] font-semibold text-[#344054] outline-none focus:border-[#8b5e3c] disabled:opacity-60"
                />
              ))}
            </div>

            <button
              type="submit"
              disabled={loading || otp.join("").length !== 6}
              className={`mt-7 w-full h-12 rounded-md bg-[#98663e] text-white text-[15px] font-semibold transition ${
                loading || otp.join("").length !== 6
                  ? "opacity-60 cursor-not-allowed"
                  : "hover:bg-[#815431] cursor-pointer"
              }`}
            >
              {loading ? "Verifying..." : "Verify OTP"}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-[13px] text-[#667085]">
              Didn&apos;t receive the code?
            </p>

            <button
              type="button"
              onClick={handleResend}
              disabled={resendLoading || !email}
              className="mt-2 text-[13px] font-medium text-[#8b5e3c] hover:underline cursor-pointer disabled:opacity-50"
            >
              {resendLoading ? "Sending..." : "Resend OTP"}
            </button>
          </div>

          <div className="mt-6 border-t border-[#eee7df] pt-5 text-center">
            <button
              type="button"
              onClick={() => router.push("/sign-in")}
              className="text-[13px] text-[#667085] hover:text-[#8b5e3c] hover:underline cursor-pointer"
            >
              Back to sign in
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}
