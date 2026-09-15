"use client";
import Link from "next/link";
import React, { useEffect, useState } from "react";
import {
  FiMinus,
  FiPlus,
  FiTrash2,
  FiArrowLeft,
  FiTruck,
  FiShield,
  FiRefreshCw,
  FiTag,
  FiChevronRight,
} from "react-icons/fi";
import { useDispatch, useSelector } from "react-redux";
import Image from "next/image";
import {
  increaseQuantity,
  decreaseQuantity,
  removeFromCart,
  cannotCheckout,
  isOutOfStock,
} from "@/redux/fetures/cartSlice";
import AddToCartBtn from "../store-components/AddToCartBtn";
import { client } from "@/utils/helper";

export default function Cart() {
  const dispatcher = useDispatch();

  const cart = useSelector((state) => state.cart);

  const user = cart.user;
  const userLoading = !cart.ready;
  const [coupon, setCoupon] = useState("");

  return (
    <main className="min-h-screen bg-[#faf8f5] py-5 sm:py-10">
      <div className="max-w-7xl mx-auto px-2.5 sm:px-6 lg:px-8">
        <div className="mb-5 sm:mb-8 px-1.5 sm:px-0">
          <div className="flex items-center gap-2 text-sm text-gray-500 mb-4">
            <span>Home</span>
            <FiChevronRight size={14} />
            <span className="text-[#8B5E3C]">Cart</span>
          </div>

          <div className="flex items-end justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-[#8B5E3C] font-semibold mb-2">
                Your Selection
              </p>

              <h1 className="text-3xl md:text-4xl font-semibold text-[#30251f]">
                Shopping Cart
              </h1>
            </div>

            <p className="hidden sm:block text-sm text-gray-500">
              {cart?.item?.length || 0} items in your cart
            </p>
          </div>
        </div>

        {cart.error && (
          <p
            role="alert"
            className="mb-4 rounded-lg bg-red-50 p-4 text-red-800"
          >
            {cart.error}
          </p>
        )}
        {!cart.item.length ? (
          <section className="rounded-2xl border border-dashed border-[#d8c8b8] bg-white p-10 text-center">
            <h2 className="text-xl font-semibold text-[#30251f]">
              Your cart is empty
            </h2>
            <p className="mt-2 text-sm text-gray-600">
              Browse the catalog to add an item.
            </p>
            <Link
              className="mt-5 inline-flex rounded-lg bg-[#8b5e3c] px-5 py-3 text-sm font-semibold text-white"
              href="/store"
            >
              Browse furniture
            </Link>
          </section>
        ) : (
          <>
            <div className="flex flex-col lg:flex-row gap-8">
              <div className="flex-1">
                <div className="bg-white rounded-2xl border border-[#eee5dd] overflow-hidden">
                  <div className="hidden md:flex items-center justify-between px-6 py-4 bg-[#fdfbf9] border-b border-[#eee5dd]">
                    <span className="text-xs uppercase tracking-wider font-semibold text-gray-500">
                      Product
                    </span>

                    <span className="text-xs uppercase tracking-wider font-semibold text-gray-500">
                      Quantity
                    </span>

                    <span className="text-xs uppercase tracking-wider font-semibold text-gray-500">
                      Price
                    </span>
                  </div>

                  {cart?.item?.map((item, index) => (
                    <div
                      key={item._id}
                      className="p-3 sm:p-5 md:p-6 border-b border-[#eee5dd] last:border-b-0"
                    >
                      <div className="flex flex-col md:flex-row md:items-center gap-3 sm:gap-5">
                        <div className="flex items-center gap-3 sm:gap-4 flex-1 min-w-0">
                          <div className="relative w-20 h-20 sm:w-24 sm:h-24 md:w-28 md:h-28 rounded-lg sm:rounded-xl overflow-hidden bg-[#f5f1ed] shrink-0">
                            <Image
                              src={item.thumbnail}
                              alt={item.name}
                              fill
                              sizes="(max-width: 640px) 80px, (max-width: 768px) 96px, 112px"
                              className="object-cover"
                            />
                          </div>

                          <div className="min-w-0">
                            <p className="text-xs text-[#8B5E3C] font-medium mb-1">
                              {item.category}
                            </p>

                            <h2 className="line-clamp-2 text-sm sm:text-base md:text-lg font-semibold text-[#30251f]">
                              {item.name}
                            </h2>

                            <button
                              disabled={Boolean(cart.pending?.[item._id])}
                              onClick={() =>
                                dispatcher(removeFromCart(item._id)).catch(
                                  () => {},
                                )
                              }
                              className="flex items-center cursor-pointer gap-1.5 mt-2 sm:mt-3 text-[11px] sm:text-xs text-gray-400 hover:text-red-500 transition"
                            >
                              <FiTrash2 size={14} />
                              Remove
                            </button>
                          </div>
                        </div>

                        <div className="flex items-center justify-between md:justify-center md:w-32">
                          <span className="text-sm text-gray-500 md:hidden">
                            Quantity
                          </span>

                          <AddToCartBtn product={item} />
                        </div>

                        <div className="flex items-center justify-between md:block md:w-28 md:text-right">
                          <span className="text-sm text-gray-500 md:hidden">
                            Price
                          </span>

                          <div>
                            <p className="text-base font-semibold text-[#30251f]">
                              ₹
                              {(item.salePrice * item.quantity)?.toLocaleString(
                                "en-IN",
                              )}
                            </p>

                            <p className="text-xs text-gray-400 line-through mt-1">
                              ₹
                              {(
                                item.originalPrice * item.quantity
                              )?.toLocaleString("en-IN")}
                            </p>

                            <div className="hidden sm:block mt-2">
                              <p className="text-[11px] text-[#30251f] uppercase tracking-wide">
                                Price per item
                              </p>

                              <p className="text-sm font-medium text-[#8B5E3C] mt-0.5">
                                ₹{item.salePrice?.toLocaleString("en-IN")}
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <Link href="/store">
                  <button className="mt-5 flex cursor-pointer items-center gap-2 text-sm font-medium text-[#8B5E3C] hover:text-[#70482e]">
                    <FiArrowLeft size={16} />
                    Continue Shopping
                  </button>
                </Link>

                <div className="flex flex-col sm:flex-row gap-4 mt-8">
                  <div className="flex-1 bg-white border border-[#eee5dd] rounded-xl p-4 flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-[#f5eee8] flex items-center justify-center text-[#8B5E3C]">
                      <FiTruck size={18} />
                    </div>

                    <div>
                      <h3 className="text-sm font-semibold text-[#30251f]">
                        Delivery options
                      </h3>

                      <p className="text-xs text-gray-500 mt-1">
                        Free delivery above ₹100,000
                      </p>
                    </div>
                  </div>

                  <div className="flex-1 bg-white border border-[#eee5dd] rounded-xl p-4 flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-[#f5eee8] flex items-center justify-center text-[#8B5E3C]">
                      <FiShield size={18} />
                    </div>

                    <div>
                      <h3 className="text-sm font-semibold text-[#30251f]">
                        Secure Payment
                      </h3>

                      <p className="text-xs text-gray-500 mt-1">
                        100% secure checkout
                      </p>
                    </div>
                  </div>

                  <div className="flex-1 bg-white border border-[#eee5dd] rounded-xl p-4 flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full justify-center bg-[#f5eee8] flex items-center gap-3">
                      <FiRefreshCw size={18} />
                    </div>

                    <div>
                      <h3 className="text-sm font-semibold text-[#30251f]">
                        Easy Returns
                      </h3>

                      <p className="text-xs text-gray-500 mt-1">
                        Simple return process
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="w-full lg:w-[370px]">
                <div className="bg-white border border-[#eee5dd] rounded-2xl p-6">
                  <h2 className="text-xl font-semibold text-[#30251f]">
                    Order Summary
                  </h2>

                  <div className="h-px bg-[#eee5dd] my-5" />

                  <p className="mb-5 text-sm">
                    Apply a coupon at checkout. Delivery is calculated for your
                    address.
                  </p>

                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-500">Subtotal</span>

                      <span className="text-sm font-medium text-[#30251f]">
                        ₹{cart?.original_total?.toLocaleString("en-IN") || 0}
                      </span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-500">Discount</span>

                      <span className="text-sm font-medium text-green-600">
                        -₹
                        {(
                          cart?.original_total - cart?.final_total
                        )?.toLocaleString("en-IN") || 0}
                      </span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-500">Shipping</span>

                      <span className="text-sm font-medium text-green-600">
                        At checkout
                      </span>
                    </div>
                  </div>

                  <div className="h-px bg-[#eee5dd] my-5" />

                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-base font-semibold text-[#30251f]">
                        Total
                      </p>

                      <p className="text-xs text-gray-400 mt-1">
                        Inclusive of all taxes
                      </p>
                    </div>

                    <p className="text-xl font-bold text-[#8B5E3C]">
                      ₹{cart?.final_total?.toLocaleString("en-IN") || 0}
                    </p>
                  </div>

                  {cart.item.some(
                    (item) =>
                      isOutOfStock(item) ||
                      item.quantity > Number(item.stockQuantity),
                  ) && (
                    <p role="alert" className="mt-5 text-sm text-[#9b3f2e]">
                      Some items are Out of Stock or exceed available stock.
                      Update your cart before checkout.
                    </p>
                  )}
                  {cannotCheckout(cart) ? (
                    <button
                      disabled
                      className="w-full h-12 mt-6 rounded-lg bg-[#8b5e3c] text-white text-sm font-semibold opacity-40 cursor-not-allowed"
                    >
                      Proceed to Checkout
                    </button>
                  ) : (
                    <Link
                      href="/checkout"
                      className="w-full h-12 mt-6 rounded-lg bg-[#8b5e3c] hover:bg-[#70482e] text-white text-sm font-semibold flex items-center justify-center gap-2"
                    >
                      Proceed to Checkout
                      <FiChevronRight size={17} />
                    </Link>
                  )}

                  <div className="flex items-center justify-center gap-2 mt-4 text-xs text-gray-400">
                    <FiShield size={14} />
                    Secure & encrypted checkout
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </main>
  );
}
