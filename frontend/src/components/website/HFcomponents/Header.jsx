"use client";

import Link from "next/link";
import React, { useEffect, useState, useSyncExternalStore } from "react";
import { usePathname } from "next/navigation";
import { IoMdMenu, IoMdClose } from "react-icons/io";
import { TbShoppingBag } from "react-icons/tb";
import { FiHeart, FiUser } from "react-icons/fi";
import { useSelector, useDispatch } from "react-redux";

import HeaderSearch from "./HeaderSearch";
import { loadWishlist } from "@/redux/fetures/wishlistSlice";

const subscribeToClientMount = () => () => {};

export default function Header() {
  const dispatch = useDispatch();

  const pathname = usePathname();

  const cart = useSelector((state) => state.cart);

  const wishlist = useSelector((state) => state.wishlist);

  const [open, setOpen] = useState(false);

  const mounted = useSyncExternalStore(
    subscribeToClientMount,
    () => true,
    () => false,
  );

  const user = mounted ? cart?.user : null;

  const userLoading = mounted ? !cart?.ready : true;

  const cartItems = Array.isArray(cart?.item) ? cart.item : [];

  const wishlistItems = Array.isArray(wishlist?.items) ? wishlist.items : [];

  const cartCount = mounted
    ? new Set(cartItems.map((item) => item?._id).filter(Boolean)).size
    : 0;

  const wishlistCount =
    mounted && user?._id && user._id === wishlist?.userId
      ? wishlistItems.length
      : 0;

  const baseNav = [
    {
      name: "Home",
      path: "/",
    },
    {
      name: "Store",
      path: "/store",
    },
    {
      name: "About",
      path: "/about",
    },
    {
      name: "Contact",
      path: "/contact",
    },
    {
      name: "Checkout",
      path: "/checkout",
    },
  ];

  const nav = mounted
    ? [
        ...(["admin", "superAdmin"].includes(user?.role)
          ? [
              {
                name: "Admin",
                path: "/admin",
              },
            ]
          : []),

        ...baseNav,

        ...(!userLoading && !user
          ? [
              {
                name: "Sign In",
                path: "/sign-in",
              },
            ]
          : []),
      ]
    : baseNav;

  useEffect(() => {
    if (!mounted || !cart?.ready) {
      return;
    }

    dispatch(loadWishlist());
  }, [dispatch, mounted, cart?.ready, cart?.user?._id]);

  const isActive = (path) => {
    if (path === "/") {
      return pathname === "/";
    }

    return pathname.startsWith(path);
  };

  const desktopNavClass = (active) =>
    active
      ? "px-4 py-1.5 rounded-lg text-[13px] font-medium transition-all duration-300 bg-[#f0ebe3] text-[#8b5e3c]"
      : "px-4 py-1.5 rounded-lg text-[13px] font-medium transition-all duration-300 text-[#6B7280] hover:bg-[#f0ebe3] hover:text-[#8b5e3c]";

  const mobileNavClass = (active) =>
    active
      ? "px-4 py-3 rounded-xl text-[14px] font-medium transition-all duration-300 bg-[#8b5e3c] text-white"
      : "px-4 py-3 rounded-xl text-[14px] font-medium transition-all duration-300 text-[#6B7280] hover:bg-[#eee5d8] hover:text-[#8b5e3c]";

  return (
    <header className="fixed top-0 left-0 z-[9999] w-full bg-[#fafaf9f7]/95 border-b border-[#eee7dd] px-3 sm:px-6 lg:px-8 h-14 lg:h-16 flex items-center backdrop-blur">
      <div className="w-full flex items-center justify-between">
        <Link
          href="/"
          onClick={() => setOpen(false)}
          className="text-[17px] sm:text-[20px] font-semibold tracking-[4px] sm:tracking-[5px] text-[#1f1f1f]"
        >
          NESTRO
          <span className="text-[#9a6a43]">.</span>
        </Link>

        <nav className="hidden lg:flex items-center gap-1">
          {nav.map((page) => (
            <Link
              key={page.path}
              href={page.path}
              className={desktopNavClass(isActive(page.path))}
            >
              {page.name}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2.5 sm:gap-5 text-[#202020]">
          <HeaderSearch key={pathname} onOpen={() => setOpen(false)} />

          <Link
            href="/wishlist"
            onClick={() => setOpen(false)}
            aria-label={
              mounted && wishlistCount > 0
                ? `Wishlist, ${wishlistCount} items`
                : "Wishlist"
            }
            title="Wishlist"
            aria-current={pathname === "/wishlist" ? "page" : undefined}
            className="group relative hidden lg:block p-1 text-[20px] text-[#2b1b11] transition hover:text-[#8b5e3c] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#8b5e3c] rounded"
          >
            <FiHeart
              aria-hidden="true"
              className="transition group-hover:fill-[#8b5e3c]/15"
            />

            {mounted && wishlistCount > 0 && (
              <span
                aria-hidden="true"
                className="absolute -top-2 -right-2 min-w-5 h-5 px-1 rounded-full bg-[#8b5e3c] text-white text-[11px] font-semibold flex items-center justify-center"
              >
                {wishlistCount}
              </span>
            )}
          </Link>

          <Link
            href="/cart"
            onClick={() => setOpen(false)}
            aria-label={
              mounted && cartCount > 0
                ? `Shopping cart, ${cartCount} products`
                : "Shopping cart"
            }
            aria-current={pathname === "/cart" ? "page" : undefined}
            className="relative hidden lg:block text-[20px] hover:text-[#8b5e3c] transition cursor-pointer"
          >
            <TbShoppingBag aria-hidden="true" />

            {mounted && cartCount > 0 && (
              <span
                aria-hidden="true"
                className="absolute -top-2 -right-2 min-w-5 h-5 px-1 rounded-full bg-[#8b5e3c] text-white text-[11px] font-semibold flex items-center justify-center"
              >
                {cartCount}
              </span>
            )}
          </Link>

          <Link
            href={mounted && user ? "/profile" : "/sign-in"}
            onClick={() => setOpen(false)}
            aria-label={
              mounted && user?.name ? `Profile for ${user.name}` : "Profile"
            }
            aria-current={pathname === "/profile" ? "page" : undefined}
            className="hidden lg:flex items-center gap-2"
          >
            <div className="w-9 h-9 rounded-full bg-[#f0ebe3] border border-[#c69a6b] text-[#8b5e3c] flex items-center justify-center text-[20px] hover:bg-[#8b5e3c] hover:text-white transition cursor-pointer">
              <FiUser aria-hidden="true" />
            </div>

            {mounted && user && (
              <span className="hidden sm:block text-[13px] font-medium text-[#444] max-w-[100px] truncate">
                {user.name}
              </span>
            )}
          </Link>

          <button
            type="button"
            onClick={() => setOpen((current) => !current)}
            aria-label={open ? "Close navigation menu" : "Open navigation menu"}
            aria-expanded={open}
            aria-controls="mobile-navigation"
            className="text-[27px] hover:text-[#8b5e3c] transition cursor-pointer lg:hidden"
          >
            {open ? (
              <IoMdClose aria-hidden="true" />
            ) : (
              <IoMdMenu aria-hidden="true" />
            )}
          </button>
        </div>
      </div>

      <div
        className={
          open
            ? "lg:hidden absolute left-3 right-3 top-[60px] overflow-hidden transition-all duration-300 max-h-[500px] opacity-100"
            : "lg:hidden absolute left-3 right-3 top-[60px] overflow-hidden transition-all duration-300 max-h-0 opacity-0 pointer-events-none"
        }
      >
        <nav
          id="mobile-navigation"
          className="bg-[#f5f0e8] border border-[#e7dccd] rounded-2xl p-3 flex flex-col gap-1 shadow-xl"
        >
          {nav.map((page) => (
            <Link
              key={page.path}
              href={page.path}
              onClick={() => setOpen(false)}
              className={mobileNavClass(isActive(page.path))}
            >
              {page.name}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}
