"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { FiHeart, FiHome, FiSearch, FiUser } from "react-icons/fi";
import { TbShoppingBag } from "react-icons/tb";
import { useSelector } from "react-redux";

const items = [
  { href: "/", label: "Home", icon: FiHome },
  { href: "/store", label: "Shop", icon: FiSearch },
  { href: "/wishlist", label: "Saved", icon: FiHeart },
  { href: "/cart", label: "Cart", icon: TbShoppingBag },
  { href: "/profile", label: "Account", icon: FiUser },
];

export default function MobileBottomNav() {
  const pathname = usePathname();
  const cartItems = useSelector((state) =>
    Array.isArray(state.cart?.item) ? state.cart.item : [],
  );
  const cartCount = new Set(cartItems.map((item) => item?._id).filter(Boolean))
    .size;

  return (
    <nav
      aria-label="Mobile quick navigation"
      className="fixed inset-x-0 bottom-0 z-[9998] border-t border-[#e6ddd2] bg-white/95 pb-[env(safe-area-inset-bottom)] shadow-[0_-8px_24px_rgba(43,27,17,0.08)] backdrop-blur lg:hidden"
    >
      <div className="mx-auto grid h-16 max-w-xl grid-cols-5">
        {items.map(({ href, label, icon: Icon }) => {
          const active =
            href === "/" ? pathname === "/" : pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              aria-label={
                href === "/cart" && cartCount
                  ? `Cart, ${cartCount} products`
                  : label
              }
              aria-current={active ? "page" : undefined}
              className={`relative flex min-w-0 flex-col items-center justify-center gap-1 text-[10px] font-medium transition ${active ? "text-[#8b5e3c]" : "text-[#786454]"}`}
            >
              <span className="relative">
                <Icon
                  aria-hidden="true"
                  className={`h-5 w-5 ${active ? "stroke-[2.4]" : ""}`}
                />
                {href === "/cart" && cartCount > 0 && (
                  <span
                    aria-hidden="true"
                    className="absolute -right-3 -top-2 flex h-4 min-w-4 items-center justify-center rounded-full bg-[#8b5e3c] px-1 text-[9px] font-bold text-white"
                  >
                    {cartCount}
                  </span>
                )}
              </span>
              <span>{label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
