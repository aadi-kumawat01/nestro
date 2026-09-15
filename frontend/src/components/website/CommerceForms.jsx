"use client";
import { useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { client } from "@/utils/helper";
export function CommerceForm({ kind = "contact" }) {
  const [message, setMessage] = useState(""),
    [busy, setBusy] = useState(false),
    params = useSearchParams();
  const titles = {
    contact: "Send a message",
    newsletter: "Newsletter",
    forgot: "Reset your password",
    reset: "Choose a new password",
    email: "Confirm your email",
  };
  async function submit(e, action) {
    e.preventDefault();
    setBusy(true);
    setMessage("");
    const form = e.currentTarget;
    try {
      const body = {
        ...Object.fromEntries(new FormData(form)),
        token: params.get("token"),
      };
      const endpoint = {
        contact: "commerce/contact",
        newsletter: params.get("token")
          ? "commerce/newsletter/" + (action || "confirm")
          : "commerce/newsletter",
        forgot: "user/forgot-password",
        reset: "user/reset-password",
        email: "user/verify-email",
      }[kind];
      const { data } = await client.post(endpoint, body);
      setMessage(data.message);
      if (kind === "contact") form.reset();
    } catch (e) {
      setMessage(e.response?.data?.message || "Unable to complete request");
    } finally {
      setBusy(false);
    }
  }
  const contactInput =
    "block w-full mt-2 rounded-xl border border-[#d8c8b8] bg-[#faf8f4] px-4 py-3 text-sm text-[#2b1b11] outline-none transition focus:border-[#8b5e3c] focus:ring-2 focus:ring-[#8b5e3c]/20";
  const field = (name, type = "text") => (
    <label
      className={
        kind === "contact"
          ? "block text-sm font-medium capitalize text-[#5c4535]"
          : "block capitalize"
      }
      key={name}
    >
      {name}
      <input
        required
        type={type}
        name={name}
        minLength={name === "password" ? 10 : undefined}
        maxLength={name === "password" ? 128 : 200}
        className={
          kind === "contact"
            ? contactInput
            : "block border rounded p-3 w-full mt-1 bg-white text-[#2b1b11]"
        }
      />
    </label>
  );
  return (
    <form onSubmit={submit} className="space-y-4">
      {kind !== "contact" && <h2 className="text-xl">{titles[kind]}</h2>}
      {kind === "contact" && field("name")}
      {(["contact", "forgot"].includes(kind) ||
        (kind === "newsletter" && !params.get("token"))) &&
        field("email", "email")}
      {kind === "contact" && (
        <>
          {field("subject")}
          <label className="block text-sm font-medium text-[#5c4535]">
            Message
            <textarea
              rows={5}
              required
              name="message"
              maxLength={5000}
              className={`${contactInput} min-h-36 resize-y`}
            />
          </label>
        </>
      )}
      {kind === "reset" && field("password", "password")}
      <button
        disabled={busy}
        className={
          kind === "contact"
            ? "w-full sm:w-auto rounded-xl bg-[#8b5e3c] px-7 py-3 text-sm font-semibold text-white transition hover:bg-[#70482e] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#8b5e3c] disabled:cursor-wait disabled:opacity-50"
            : "bg-[#98663e] rounded px-5 py-3 text-white disabled:opacity-50"
        }
      >
        {busy
          ? "Please wait…"
          : kind === "newsletter"
            ? params.get("token")
              ? "Confirm subscription"
              : "Subscribe"
            : kind === "contact"
              ? "Send message"
              : "Submit"}
      </button>
      {kind === "newsletter" && params.get("token") && (
        <button
          disabled={busy}
          type="button"
          className="underline ml-4"
          onClick={(e) =>
            submit(
              { preventDefault() {}, currentTarget: e.currentTarget.form },
              "unsubscribe",
            )
          }
        >
          Unsubscribe
        </button>
      )}
      <p
        role="status"
        className={
          kind === "contact" && message
            ? "rounded-xl border border-[#e8ded0] bg-[#f3ede5] p-4 text-sm leading-6 text-[#5c4535]"
            : undefined
        }
      >
        {message}
      </p>
      {["reset", "email", "forgot"].includes(kind) && (
        <Link className="underline" href="/sign-in">
          Back to sign in
        </Link>
      )}
    </form>
  );
}
