"use client";
import { useDispatch } from "react-redux";
import {
  removeOrderedWishlistItems,
  isSuccessfulWishlistOrder,
} from "@/redux/fetures/wishlistSlice";
import { useRazorpay } from "react-razorpay";
import { client } from "@/utils/helper";
export default function useOrderPayment() {
  const dispatch = useDispatch();
  const { Razorpay, isLoading } = useRazorpay();
  return {
    isLoading,
    pay: (order, user) =>
      new Promise((resolve, reject) => {
        if (!Razorpay)
          return reject(
            new Error("Payment is loading. Try again in a moment."),
          );
        if (!order.razorpayOrderId)
          return reject(
            new Error("Payment is not ready. Refresh this order shortly."),
          );
        const key = order.key || process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID;
        if (!key)
          return reject(
            new Error(
              "Online payment is not configured. Please contact the store.",
            ),
          );
        let settled = false,
          verifying = false;
        const finish = (error, result) => {
          if (settled) return;
          settled = true;
          if (error) reject(error);
          else resolve(result);
        };
        const checkout = new Razorpay({
          key,
          order_id: order.razorpayOrderId,
          amount: order.amount,
          currency: "INR",
          name: "Nestro",
          prefill: {
            name: user?.name || "",
            email: user?.email || "",
            contact: user?.mobile || "",
          },
          theme: { color: "#8b5e3c" },
          handler: async (response) => {
            if (settled || verifying) return;
            verifying = true;
            try {
              const result = (
                await client.post("order/verify-payment", {
                  orderId: order.orderId,
                  ...response,
                })
              ).data;
              if (!result.success)
                throw new Error(
                  result.message ||
                    "Payment verification failed. Please check your order before retrying.",
                );
              if (
                result.paymentStatus === "paid" &&
                isSuccessfulWishlistOrder(result)
              )
                await dispatch(
                  removeOrderedWishlistItems(String(result.orderId)),
                );
              finish(null, result);
            } catch (error) {
              finish(error);
            }
          },
          modal: {
            ondismiss: () => {
              if (!verifying)
                finish(
                  new Error(
                    "Payment cancelled. Your order is saved; you can resume payment from My Orders.",
                  ),
                );
            },
          },
        });
        checkout.on("payment.failed", () => {
          if (!verifying) {
            finish(
              new Error(
                "Payment failed. Your order is saved. Check your payment status before retrying from My Orders.",
              ),
            );
            checkout.close();
          }
        });
        checkout.open();
      }),
  };
}
