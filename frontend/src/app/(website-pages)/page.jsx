import { CommerceForm } from "@/components/website/CommerceForms";
export const dynamic = "force-dynamic";
import BestSellers from "@/components/website/home-components/bestsells/BestSellers";
import CustomerReviews from "@/components/website/home-components/bottom/CustomerReviews";
import Browse from "@/components/website/home-components/category/Browse";
import Hero from "@/components/website/home-components/hero/Hero";
import NewArrivals from "@/components/website/home-components/justLanded/NewArrivals";
import ShopByRoomCraft from "@/components/website/home-components/shopbyroom/ShopByRoomCraft";

export const metadata = {
  title: { absolute: "Nestro Furniture | Modern Furniture Online in India" },
  description:
    "Shop modern furniture online in India. Discover sofas, beds, dining tables, chairs, storage and office furniture designed for beautiful everyday spaces.",
  alternates: { canonical: "/" },
  openGraph: {
    url: "/",
    title: "Nestro Furniture | Modern Furniture Online in India",
    description:
      "Discover modern furniture for living rooms, bedrooms, dining rooms and home offices.",
  },
};

export default function Home() {
  return (
    <div>
      <Hero />
      <Browse />
      <BestSellers />
      <NewArrivals />
      <ShopByRoomCraft />
      <CustomerReviews />
      <section className="bg-[#faf9f7] px-4 py-8 sm:px-6 lg:px-8 lg:py-12">
        <div className="mx-auto max-w-[1820px] rounded-[22px] bg-[#1b1109] px-6 py-10 sm:px-10 lg:px-12 lg:py-14">
          <div className="grid items-center gap-8 lg:grid-cols-2 lg:gap-16">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.45em] text-[#d49b67]">
                Stay in the loop
              </p>

              <h2 className="mt-5 text-3xl font-medium tracking-tight text-white sm:text-4xl lg:text-5xl">
                Design tips & new arrivals
              </h2>

              <p className="mt-5 text-[15px] leading-7 text-white/45">
                Join 8,000 subscribers who get exclusive first looks.
              </p>
            </div>

            <div className="w-full text-white lg:justify-self-end lg:max-w-[530px]">
              <CommerceForm kind="newsletter" />

              <p className="mt-3 text-right text-[12px] text-white/70">
                No spam. Unsubscribe anytime.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
