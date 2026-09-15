"use client";
import { useDispatch, useSelector } from "react-redux";
import { FiMinus, FiPlus } from "react-icons/fi";
import {
  addToCart,
  decreaseQuantity,
  isOutOfStock,
} from "@/redux/fetures/cartSlice";
export default function AddToCartBtn({ product }) {
  const dispatch = useDispatch();
  const cart = useSelector((state) => state.cart);
  const item = cart.item.find((item) => item._id === product._id);
  const pending = Boolean(cart.pending?.[product._id]);
  const unavailable =
    isOutOfStock(product) || Boolean(item && isOutOfStock(item));
  const disabled = !cart.ready || cart.busy || pending;
  const action = (thunk) => dispatch(thunk).catch(() => {});
  const style =
    "flex h-8 sm:h-10 min-w-7 sm:min-w-9 items-center justify-center cursor-pointer rounded-lg px-1 sm:px-2 text-xs sm:text-sm transition hover:bg-[#f0ebe3] focus-visible:outline-2 focus-visible:outline-[#8b5e3c] disabled:opacity-40 disabled:cursor-not-allowed";
  return (
    <div
      className="flex w-full sm:w-auto flex-col items-end gap-1.5 sm:gap-2"
      aria-busy={pending}
    >
      {unavailable && (
        <span className="text-xs font-semibold text-[#9b3f2e]">
          Out of Stock
        </span>
      )}
      {item ? (
        <div className="flex w-full sm:w-auto items-center justify-between rounded-lg border border-[#d8c8b8] text-[#8b5e3c]">
          <button
            type="button"
            aria-label="Decrease quantity"
            disabled={disabled}
            onClick={() => action(decreaseQuantity(product._id))}
            className={style}
          >
            <FiMinus />
          </button>
          <span
            aria-live="polite"
            aria-label="Quantity"
            className={`min-w-7 text-center text-sm ${pending ? "opacity-50" : ""}`}
          >
            {item.quantity}
          </span>
          <button
            type="button"
            aria-label="Increase quantity"
            disabled={
              disabled ||
              unavailable ||
              item.quantity >=
                Math.min(
                  99,
                  Number(product.stockQuantity ?? 99),
                  Number(item.stockQuantity ?? 99),
                )
            }
            onClick={() => action(addToCart({ ...product, quantity: 1 }))}
            className={style}
          >
            <FiPlus />
          </button>
        </div>
      ) : (
        <button
          type="button"
          disabled={disabled || unavailable}
          onClick={() => action(addToCart(product))}
          className="min-h-8 sm:min-h-10 w-full sm:w-auto cursor-pointer rounded-lg bg-[#8b5e3c] px-2 sm:px-3 py-1.5 sm:py-2 text-[10px] sm:text-xs font-semibold text-white hover:bg-[#70482e] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#8b5e3c] disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {unavailable ? (
            "Out of Stock"
          ) : (
            <>
              <span className="sm:hidden">Add</span>
              <span className="hidden sm:inline">Add to Cart</span>
            </>
          )}
        </button>
      )}
    </div>
  );
}
