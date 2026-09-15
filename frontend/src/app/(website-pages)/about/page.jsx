import React from "react";
import { FiFeather, FiHeart } from "react-icons/fi";
import { TbDiamond } from "react-icons/tb";

export const metadata = {
  title: "About Nestro Furniture",
  description:
    "Learn about Nestro Furniture, our approach to thoughtful furniture design, materials, craftsmanship and furniture for everyday Indian homes.",
  alternates: { canonical: "/about" },
  openGraph: {
    url: "/about",
    title: "About Nestro Furniture",
    description: "Furniture crafted with purpose for everyday Indian homes.",
  },
};

export default function AboutPage() {
  return (
    <main className="min-h-[calc(100vh-65px)] bg-[#fafaf9f7] px-4 sm:px-6 lg:px-8 py-6">
      <section className="bg-[#2b1b11] rounded-2xl px-6 sm:px-10 lg:px-16 py-12 sm:py-16 lg:py-20">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 items-center">
          <div>
            <h1 className="text-white text-[34px] sm:text-[42px] lg:text-[44px] font-medium leading-tight">
              Furniture crafted with{" "}
              <span className="italic text-[#e0b58f] font-light">purpose</span>
            </h1>

            <p className="mt-6 text-[#b9ada5] text-[15px] sm:text-[16px] leading-7 max-w-[650px]">
              Aditya&apos;s Furniture serves customers across India. Product
              pages list the available details, including materials, dimensions,
              and warranty.
            </p>
          </div>

          <div
            className="w-full h-[300px] sm:h-[420px] lg:h-[520px] rounded-2xl bg-cover bg-center"
            style={{
              backgroundImage:
                "url('https://images.unsplash.com/photo-1593071045469-a45708d54b3d?auto=format&fit=crop&w=700&q=80')",
            }}
          ></div>
        </div>
      </section>

      <section className="mt-14 bg-white border border-[#e8ded0] rounded-2xl px-5 sm:px-8 py-8">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 text-center">
          <StatBox number="5,000" label="Customers" />
          <StatBox number="302" label="Catalog records" />
          <StatBox number="2" label="Showrooms: Jaipur and Bengaluru" />
          <StatBox number="4.5★" label="Average rating from 500 reviews" />
        </div>
      </section>

      <section className="mt-16">
        <p className="text-[12px] font-medium tracking-[2px] uppercase text-[#9a6a43] mb-3">
          What Drives Us
        </p>

        <h2 className="text-[28px] sm:text-[32px] font-medium text-[#111111]">
          Our Values
        </h2>

        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-5">
          <ValueCard
            icon={<FiFeather />}
            title="Product details"
            desc="Review material, dimensions, and available product specifications before ordering."
          />

          <ValueCard
            icon={<TbDiamond />}
            title="Uncompromising Quality"
            desc="Warranty is six months by default. Check the product page for any approved exception."
          />

          <ValueCard
            icon={<FiHeart />}
            title="Design with Soul"
            desc="Contact support if you need help before placing an order."
          />
        </div>
      </section>

      <section className="mt-16 pb-8">
        <p className="text-[12px] font-medium tracking-[2px] uppercase text-[#9a6a43] mb-3">
          The People Behind Nestro
        </p>

        <h2 className="text-[28px] sm:text-[32px] font-medium text-[#111111]">
          Our Team
        </h2>

        <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          <TeamCard initials="AK" name="Aarav Kumar" role="Founder & CEO" />
          <TeamCard initials="SM" name="Sanya Mehta" role="Head of Design" />
          <TeamCard initials="VR" name="Vikram Rao" role="Chief Craftsman" />
          <TeamCard
            initials="PJ"
            name="Preet Joshi"
            role="Customer Experience"
          />
        </div>
      </section>
    </main>
  );
}

function StatBox({ number, label }) {
  return (
    <div>
      <h3 className="text-[32px] sm:text-[36px] font-medium text-[#98663e]">
        {number}
      </h3>

      <p className="mt-2 text-[13px] sm:text-[14px] text-[#667085]">{label}</p>
    </div>
  );
}

function ValueCard({ icon, title, desc }) {
  return (
    <div className="bg-white border border-[#e8ded0] rounded-xl p-6">
      <div className="text-[#98663e] text-[24px] mb-5">{icon}</div>

      <h3 className="text-[16px] font-semibold text-[#111111]">{title}</h3>

      <p className="mt-3 text-[14px] text-[#667085] leading-6">{desc}</p>
    </div>
  );
}

function TeamCard({ initials, name, role }) {
  return (
    <div className="bg-white border border-[#e8ded0] rounded-xl overflow-hidden">
      <div className="h-[150px] bg-[#efeae2] flex items-center justify-center">
        <span className="text-[38px] font-medium text-[#98663e]">
          {initials}
        </span>
      </div>

      <div className="p-5">
        <h3 className="text-[15px] font-semibold text-[#111111]">{name}</h3>

        <p className="text-[13px] text-[#667085] mt-1">{role}</p>
      </div>
    </div>
  );
}
