import Link from "next/link";
import React from "react";

export default function Footer() {
  return (
    <>
      <footer className="w-full bg-[#1b1109] px-4 py-5 text-white lg:hidden">
        <div className="flex items-center justify-between gap-4 pb-4">
          <div>
            <Link href="/" className="text-[18px] font-semibold tracking-[4px]">
              NESTRO<span className="text-[#c58b5c]">.</span>
            </Link>
            <p className="mt-1 text-xs text-white/50">
              Furniture for thoughtful homes.
            </p>
          </div>
          <Link
            href="/contact"
            className="rounded-lg border border-white/20 px-3 py-2 text-xs text-white/80"
          >
            Need help?
          </Link>
        </div>
        <div className="divide-y divide-white/10 border-y border-white/10">
          <MobileFooterGroup title="Company">
            <FooterLink href="/about" label="Our Story" />
            <FooterLink href="/contact" label="Showrooms & Careers" />
          </MobileFooterGroup>
          <MobileFooterGroup title="Support">
            <FooterLink href="/policies/returns" label="Returns & Exchange" />
            <FooterLink href="/policies/shipping" label="Shipping Policy" />
            <FooterLink href="/contact" label="Contact Us" />
          </MobileFooterGroup>
        </div>
        <div className="flex items-center justify-between gap-3 pt-4 text-[11px] text-white/55">
          <p>© 2026 Nestro</p>
          <div className="flex gap-3">
            <Link href="/policies/privacy">Privacy</Link>
            <Link href="/policies/terms">Terms</Link>
          </div>
        </div>
      </footer>
      <footer className="hidden w-full bg-[#1b1109] text-white lg:block">
        <div className="px-4 py-12 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 gap-10 md:grid-cols-2 lg:grid-cols-[1.6fr_1fr_1fr_1fr] lg:gap-16">
            <div>
              <Link
                href="/"
                className="text-[22px] font-semibold tracking-[5px] text-white"
              >
                NESTRO<span className="text-[#c58b5c]">.</span>
              </Link>

              <p className="mt-5 max-w-xl text-[15px] leading-7 text-white/45">
                Curated furniture for thoughtful homes. Crafted with intention,
                made to endure.
              </p>
            </div>

            <div>
              <h3 className="text-[12px] font-semibold uppercase tracking-[5px] text-[#d49b67]">
                Company
              </h3>

              <div className="mt-5 space-y-3">
                <FooterLink href="/about" label="Our Story" />
                <FooterLink href="/about" label="Sustainability" />
                <FooterLink href="/contact" label="Showrooms" />
                <FooterLink href="/contact" label="Careers" />
              </div>
            </div>

            <div>
              <h3 className="text-[12px] font-semibold uppercase tracking-[5px] text-[#d49b67]">
                Support
              </h3>

              <div className="mt-5 space-y-3">
                <FooterLink
                  href="/policies/returns"
                  label="Returns & Exchange"
                />
                <FooterLink href="/contact" label="Assembly Help" />
                <FooterLink href="/contact" label="Contact Us" />
              </div>
            </div>

            <div>
              <h3 className="text-[12px] font-semibold uppercase tracking-[5px] text-[#d49b67]">
                Follow Us
              </h3>

              <div className="mt-5 space-y-3">
                <FooterLink href="/wishlist" label="Wishlist" />
                <FooterLink href="/policies/shipping" label="Shipping Policy" />
              </div>
            </div>
          </div>

          <div className="my-7 mt-12 h-px bg-white/10" />

          <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
            <p className="text-[13px] text-white/70">
              © 2026 Nestro. All rights reserved.
            </p>

            <div className="flex items-center gap-2 text-[13px] text-white/70">
              <Link
                href="/policies/privacy"
                className="transition hover:text-[#d49b67]"
              >
                Privacy
              </Link>

              <span>·</span>

              <Link
                href="/policies/terms"
                className="transition hover:text-[#d49b67]"
              >
                Terms
              </Link>

              <span>·</span>

              <Link
                href="/sitemap.xml"
                className="transition hover:text-[#d49b67]"
              >
                Sitemap
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </>
  );
}

function FooterLink({ href, label }) {
  return (
    <Link
      href={href}
      className="block text-[15px] text-white/45 transition hover:text-[#d49b67]"
    >
      {label}
    </Link>
  );
}

function MobileFooterGroup({ title, children }) {
  return (
    <details className="group py-3">
      <summary className="flex cursor-pointer list-none items-center justify-between text-sm font-medium marker:content-none">
        {title}
        <span
          aria-hidden="true"
          className="text-lg text-[#d49b67] transition group-open:rotate-45"
        >
          +
        </span>
      </summary>
      <div className="mt-3 grid grid-cols-2 gap-x-4 gap-y-3 pb-1 [&_a]:text-xs">
        {children}
      </div>
    </details>
  );
}
