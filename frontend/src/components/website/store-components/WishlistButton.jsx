"use client";
import { useRouter } from "next/navigation";
import { useDispatch, useSelector } from "react-redux";
import { FiHeart } from "react-icons/fi";
import { toast } from "sonner";
import { toggleWishlist } from "@/redux/fetures/wishlistSlice";
export default function WishlistButton({ id }) {
  const dispatch = useDispatch();
  const router = useRouter();
  const { user, ready } = useSelector((state) => state.cart);
  const wishlist = useSelector((state) => state.wishlist);
  const saved =
    user?._id === wishlist.userId &&
    wishlist.items.some((item) => item._id === id);
  const busy =
    Object.values(wishlist.pending).some(Boolean) ||
    (user && (wishlist.userId !== user._id || wishlist.status !== "ready"));
  const label = saved ? "Remove from wishlist" : "Save to wishlist";
  async function toggle() {
    if (!user) {
      router.push("/sign-in?next=/wishlist");
      return;
    }
    try {
      await dispatch(toggleWishlist(id));
      toast.success(saved ? "Removed from wishlist" : "Saved to wishlist");
    } catch (error) {
      if (error.response?.status === 401)
        router.push("/sign-in?next=/wishlist");
      else
        toast.error(
          error.response?.data?.message ||
            error.message ||
            "Unable to update wishlist",
        );
    }
  }
  return (
    <button
      type="button"
      onClick={toggle}
      disabled={!ready || Boolean(busy)}
      aria-label={label}
      title={label}
      aria-pressed={saved}
      className="flex h-8 w-8 sm:h-10 sm:w-10 items-center cursor-pointer justify-center rounded-full border border-[#e8ded0] bg-[#fffdfa] text-[#8b5e3c] transition hover:bg-[#f0ebe3] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#8b5e3c] disabled:opacity-50 disabled:cursor-wait"
    >
      <FiHeart
        aria-hidden="true"
        className={`h-4 w-4 sm:h-5 sm:w-5 ${saved ? "fill-current" : ""}`}
      />
    </button>
  );
}
