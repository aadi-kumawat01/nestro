"use client";
import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Menu,
  X,
  ChevronLeft,
  ChevronRight,
  LayoutDashboard,
  ChartColumnStacked,
  ShoppingCart,
  BedDouble,
  Palette,
  Package,
  Users,
  Ticket,
  Star,
  MessageSquare,
  Settings,
} from "lucide-react";

const navs = [
  { name: "Dashboard", path: "/admin", icon: LayoutDashboard },
  { name: "Products", path: "/admin/products", icon: ShoppingCart },
  { name: "Category", path: "/admin/category", icon: ChartColumnStacked },
  { name: "Rooms", path: "/admin/room-type", icon: BedDouble },
  { name: "Colors", path: "/admin/colors", icon: Palette },
  { name: "Orders", path: "/admin/orders", icon: Package },
  { name: "Coupons", path: "/admin/coupons", icon: Ticket },
  { name: "Reviews", path: "/admin/reviews", icon: Star },
  { name: "Users", path: "/admin/users", icon: Users },
  { name: "Support", path: "/admin/support", icon: MessageSquare },
  { name: "Settings", path: "/admin/settings", icon: Settings },
];
export default function Adminaside() {
  const pathname = usePathname();
  return <Navigation key={pathname} pathname={pathname} />;
}
function Navigation({ pathname }) {
  const [collapsed, setCollapsed] = useState(false);
  const [open, setOpen] = useState(false);
  const panel = useRef(null),
    trigger = useRef(null);
  useEffect(() => {
    if (!open) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    panel.current?.querySelector("button")?.focus();
    function keyboard(event) {
      if (event.key === "Escape") {
        setOpen(false);
        trigger.current?.focus();
      }
      if (event.key === "Tab") {
        const focusable = [
          ...panel.current.querySelectorAll("a,button"),
        ].filter((element) => element.getClientRects().length);
        const first = focusable[0],
          last = focusable.at(-1);
        if (event.shiftKey && document.activeElement === first) {
          event.preventDefault();
          last?.focus();
        }
        if (!event.shiftKey && document.activeElement === last) {
          event.preventDefault();
          first?.focus();
        }
      }
    }
    function resize() {
      if (window.innerWidth >= 1024) setOpen(false);
    }
    document.addEventListener("keydown", keyboard);
    window.addEventListener("resize", resize);
    return () => {
      document.body.style.overflow = previous;
      document.removeEventListener("keydown", keyboard);
      window.removeEventListener("resize", resize);
    };
  }, [open]);
  return (
    <>
      <button
        ref={trigger}
        type="button"
        onClick={() => setOpen(true)}
        aria-label="Open admin navigation"
        aria-expanded={open}
        aria-controls="admin-navigation"
        className="fixed left-4 top-4 z-50 rounded-lg border border-[#d8c8b8] bg-[#fffdfa] p-2 text-[#8b5e3c] focus-visible:outline-2 lg:hidden"
      >
        <Menu size={20} />
      </button>
      {open && (
        <div
          onClick={() => {
            setOpen(false);
            trigger.current?.focus();
          }}
          className="fixed inset-0 z-[60] bg-[#2b1b11]/40 lg:hidden"
          aria-hidden="true"
        />
      )}
      <aside
        id="admin-navigation"
        ref={panel}
        role={open ? "dialog" : undefined}
        aria-modal={open || undefined}
        aria-label="Admin navigation"
        className={`${open ? "flex" : "hidden"} fixed inset-y-0 left-0 z-[70] w-64 shrink-0 flex-col border-r border-[#483326] bg-[#24180f] text-[#eadfD2] lg:sticky lg:top-0 lg:flex lg:h-dvh ${collapsed ? "lg:w-20" : "lg:w-64"}`}
      >
        <div className="flex min-h-20 items-center justify-between gap-2 border-b border-white/10 px-4">
          <Link
            href="/admin"
            title="Nestro administration"
            className={`font-semibold tracking-[0.2em] text-[#fffdfa] ${collapsed ? "lg:hidden" : ""}`}
          >
            NESTRO<span className="text-[#c69a6b]">.</span>
            <span className="mt-1 block text-[10px] font-normal tracking-[0.15em] text-[#c6af99]">
              STORE ADMINISTRATION
            </span>
          </Link>
          <button
            type="button"
            onClick={() => {
              setOpen(false);
              trigger.current?.focus();
            }}
            aria-label="Close navigation"
            className="rounded-lg p-2 hover:bg-white/10 lg:hidden"
          >
            <X size={20} />
          </button>
          <button
            type="button"
            onClick={() => setCollapsed(!collapsed)}
            aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            aria-expanded={!collapsed}
            className="hidden rounded-lg p-2 hover:bg-white/10 focus-visible:outline-2 lg:block"
          >
            {collapsed ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
          </button>
        </div>
        <nav
          className="min-h-0 flex-1 space-y-1 overflow-y-auto px-3 py-5"
          aria-label="Store management"
        >
          {navs.map(({ name, path, icon: Icon }) => {
            const active =
              path === "/admin"
                ? pathname === path
                : pathname === path || pathname.startsWith(path + "/");
            return (
              <Link
                key={path}
                href={path}
                title={name}
                aria-label={name}
                aria-current={active ? "page" : undefined}
                className={`flex min-h-11 items-center gap-3 rounded-xl px-3 py-2.5 text-sm focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#d9b18a] ${active ? "bg-[#8b5e3c] font-semibold text-white" : "text-[#d5c5b5] hover:bg-[#3b2a1e] hover:text-white"}`}
              >
                <Icon size={19} className="shrink-0" aria-hidden="true" />
                <span className={collapsed ? "lg:hidden" : ""}>{name}</span>
              </Link>
            );
          })}
        </nav>
        <p
          className={`border-t border-white/10 px-5 py-4 text-xs text-[#bca38d] ${collapsed ? "lg:hidden" : ""}`}
        >
          Thoughtful homes. Thoughtful management.
        </p>
      </aside>
    </>
  );
}
