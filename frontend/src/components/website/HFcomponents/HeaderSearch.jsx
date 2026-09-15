"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { IoIosSearch, IoMdClose } from "react-icons/io";
import { client } from "@/utils/helper";

const priceLabel = (value) => `₹${Number(value || 0).toLocaleString("en-IN")}`;

export default function HeaderSearch({ onOpen }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [result, setResult] = useState({ query: "", items: [], error: false });
  const root = useRef(null);
  const trigger = useRef(null);
  const input = useRef(null);
  const term = query.trim();
  const loading = term.length >= 2 && result.query !== term;
  const items = !loading && term.length >= 2 ? result.items : [];

  useEffect(() => {
    if (!open) return;
    input.current?.focus();
    function outside(event) {
      if (!root.current?.contains(event.target)) setOpen(false);
    }
    function escape(event) {
      if (event.key === "Escape") {
        event.preventDefault();
        setOpen(false);
        trigger.current?.focus();
      }
    }
    document.addEventListener("pointerdown", outside);
    document.addEventListener("focusin", outside);
    document.addEventListener("keydown", escape);
    return () => {
      document.removeEventListener("pointerdown", outside);
      document.removeEventListener("focusin", outside);
      document.removeEventListener("keydown", escape);
    };
  }, [open]);

  useEffect(() => {
    if (!open || term.length < 2) return;
    const controller = new AbortController();
    const timer = setTimeout(async () => {
      try {
        const response = await client.get("/product", {
          params: { search: term, limit: 6, page: 1 },
          signal: controller.signal,
        });
        if (!controller.signal.aborted)
          setResult({
            query: term,
            items:
              response.data.success && Array.isArray(response.data.data)
                ? response.data.data.filter((product) => product?._id)
                : [],
            error: !response.data.success,
          });
      } catch {
        if (!controller.signal.aborted)
          setResult({ query: term, items: [], error: true });
      }
    }, 280);
    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [open, term]);

  function close() {
    setOpen(false);
    trigger.current?.focus();
  }

  function moveFocus(event) {
    if (!["ArrowDown", "ArrowUp"].includes(event.key)) return;
    const links = Array.from(
      root.current.querySelectorAll("[data-search-result]"),
    );
    if (!links.length) return;
    const index = links.indexOf(document.activeElement);
    if (document.activeElement !== input.current && index === -1) return;
    event.preventDefault();
    if (event.key === "ArrowUp" && index === 0) input.current.focus();
    else
      links[
        event.key === "ArrowDown"
          ? (index + 1) % links.length
          : index < 0
            ? links.length - 1
            : index - 1
      ]?.focus();
  }

  return (
    <div ref={root} onKeyDown={moveFocus}>
      <button
        ref={trigger}
        type="button"
        aria-label="Search products"
        title="Search products"
        aria-expanded={open}
        aria-controls="header-product-search"
        aria-haspopup="dialog"
        onClick={() => {
          if (!open) onOpen();
          setOpen(!open);
        }}
        className="rounded text-[20px] cursor-pointer transition hover:text-[#8b5e3c] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#8b5e3c]"
      >
        <IoIosSearch aria-hidden="true" />
      </button>
      {open && (
        <div
          id="header-product-search"
          role="dialog"
          aria-label="Search products"
          className="absolute left-0 right-0 top-full max-h-[calc(100dvh-80px)] overflow-y-auto border border-[#e8ded0] bg-[#fffdfa] p-4 text-[#2b1b11] shadow-xl sm:left-auto sm:right-8 sm:w-[min(480px,calc(100vw-4rem))] sm:rounded-2xl sm:p-6"
        >
          <div className="mb-4 flex items-center justify-between gap-4">
            <h2 className="text-xs font-semibold uppercase tracking-[0.2em] text-[#8b5e3c]">
              Find your next favourite
            </h2>
            <button
              type="button"
              onClick={close}
              aria-label="Close search"
              className="rounded cursor-pointer p-2 hover:bg-[#f0ebe3] focus-visible:outline-2"
            >
              <IoMdClose aria-hidden="true" className="h-5 w-5" />
            </button>
          </div>
          <form
            action="/store"
            onSubmit={(event) => {
              event.preventDefault();
              if (!term) return;
              router.push(`/store?${new URLSearchParams({ search: term })}`);
              setOpen(false);
            }}
            role="search"
          >
            <label htmlFor="header-search-input" className="sr-only">
              Search furniture
            </label>
            <div className="flex items-center gap-2 rounded-xl border border-[#d8c8b8] bg-[#faf8f4] px-3 focus-within:ring-2 focus-within:ring-[#8b5e3c]">
              <IoIosSearch
                aria-hidden="true"
                className="shrink-0 text-xl text-[#8b5e3c]"
              />
              <input
                ref={input}
                id="header-search-input"
                name="search"
                type="search"
                autoComplete="off"
                required
                value={query}
                onChange={(event) => {
                  setQuery(event.target.value);
                  setResult({ query: "", items: [], error: false });
                }}
                aria-describedby="header-search-status"
                aria-controls="header-search-results"
                placeholder="Search sofas, chairs, tables..."
                className="min-w-0 flex-1 bg-transparent py-3 text-sm outline-none [&::-webkit-search-cancel-button]:appearance-none"
              />
              {query && (
                <button
                  type="button"
                  aria-label="Clear search"
                  onClick={() => {
                    setQuery("");
                    setResult({ query: "", items: [], error: false });
                    input.current?.focus();
                  }}
                  className="rounded p-2 hover:bg-[#e8ded0] focus-visible:outline-2"
                >
                  <IoMdClose aria-hidden="true" />
                </button>
              )}
            </div>
            <p
              id="header-search-status"
              role="status"
              className="py-4 text-sm text-[#786454]"
            >
              {term.length < 2
                ? "Type at least 2 characters to discover our collection."
                : loading
                  ? "Finding your pieces..."
                  : result.error
                    ? "Search is unavailable. Please try again."
                    : items.length
                      ? `${items.length} suggestions. Use arrow keys to browse.`
                      : "No pieces found. Try a different word."}
            </p>
            <ul
              id="header-search-results"
              className="space-y-1"
              aria-label="Product suggestions"
              aria-busy={loading}
            >
              {items.map((product) => {
                const sale = Number(product.salePrice);
                const discounted = sale > 0 && sale < Number(product.price);
                return (
                  <li key={product._id}>
                    <Link
                      data-search-result
                      href={`/store/${product._id}`}
                      onClick={() => setOpen(false)}
                      className="flex items-center gap-3 rounded-xl p-2 transition hover:bg-[#f3ede5] focus-visible:bg-[#f3ede5] focus-visible:outline-2 focus-visible:outline-[#8b5e3c]"
                    >
                      {/* Existing product images use remote URLs without a configured Next image loader. */}
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={product.thumbnail || undefined}
                        alt=""
                        width={64}
                        height={64}
                        className="h-16 w-16 shrink-0 rounded-lg bg-[#f0ebe3] object-cover"
                      />
                      <div className="min-w-0">
                        <p className="text-sm font-medium leading-5 line-clamp-2">
                          {product.title}
                        </p>
                        <p className="mt-1 flex flex-wrap gap-2 text-sm text-[#8b5e3c]">
                          <span>
                            {priceLabel(discounted ? sale : product.price)}
                          </span>
                          {discounted && (
                            <del className="text-[#786454]">
                              {priceLabel(product.price)}
                            </del>
                          )}
                        </p>
                      </div>
                    </Link>
                  </li>
                );
              })}
            </ul>
            {term.length >= 2 && (
              <button
                type="submit"
                className="mt-4 w-full rounded-lg bg-[#8b5e3c] px-4 py-3 text-sm font-medium text-white transition hover:bg-[#70482e] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#8b5e3c]"
              >
                View all results
              </button>
            )}
          </form>
        </div>
      )}
    </div>
  );
}
