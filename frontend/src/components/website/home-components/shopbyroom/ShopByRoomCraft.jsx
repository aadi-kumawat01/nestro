import Link from "next/link";
import Image from "next/image";
import React from "react";
import { FiTruck, FiRefreshCcw, FiTool, FiShield } from "react-icons/fi";

export default function ShopByRoomCraft() {
  const rooms = [
    {
      title: "Living Room",
      room: "living-room",
      image:
        "https://images.unsplash.com/photo-1758448511322-8bfc73daf606?auto=format&fit=crop&w=1200&q=80",
    },
    {
      title: "Bedroom",
      room: "bedroom",
      image:
        "https://images.unsplash.com/photo-1748679979601-dc9ec43d900d?auto=format&fit=crop&w=900&q=80",
    },
    {
      title: "Study & Storage",
      room: "study-storage",
      image:
        "https://images.unsplash.com/photo-1593071045469-a45708d54b3d?auto=format&fit=crop&w=500&q=80",
    },
    {
      title: "Dining Room",
      room: "dining-room",
      image:
        "https://images.unsplash.com/photo-1519643381401-22c77e60520e?auto=format&fit=crop&w=900&q=80",
    },
    {
      title: "Home Office",
      room: "home-office",
      image:
        "https://images.unsplash.com/photo-1748679979601-dc9ec43d900d?auto=format&fit=crop&w=900&q=80",
    },
  ];

  const benefits = [
    {
      icon: <FiTruck />,
      title: "Free Delivery",
      desc: "On orders above ₹100,000",
    },
    {
      icon: <FiRefreshCcw />,
      title: "7-Day Returns",
      desc: "Wrong product received only",
    },
    {
      icon: <FiTool />,
      title: "Assembly",
      desc: "Currently unavailable",
    },
    {
      icon: <FiShield />,
      title: "Warranty",
      desc: "6 months; see product details",
    },
  ];

  return (
    <section className="w-full bg-[#fafaf9f7] px-3 sm:px-6 lg:px-8 py-7 sm:py-10">
      <div>
        <p className="text-[12px] font-medium tracking-[6px] uppercase text-[#8b5e3c] mb-3">
          Curated By Space
        </p>

        <h2 className="text-[24px] sm:text-[28px] font-medium text-[#111111] mb-7">
          Shop by Room
        </h2>

        <div className="grid grid-cols-2 lg:grid-cols-[1.4fr_1fr_1fr] gap-2 sm:gap-5">
          <RoomCard
            title={rooms[0].title}
            pieces={rooms[0].pieces}
            room={rooms[0].room}
            image={rooms[0].image}
            className="col-span-2 lg:col-span-1 lg:row-span-2 min-h-[220px] sm:min-h-[350px] lg:min-h-[430px]"
          />

          <RoomCard
            title={rooms[1].title}
            pieces={rooms[1].pieces}
            room={rooms[1].room}
            image={rooms[1].image}
            className="min-h-[145px] sm:min-h-[190px]"
          />

          <RoomCard
            title={rooms[2].title}
            pieces={rooms[2].pieces}
            room={rooms[2].room}
            image={rooms[2].image}
            className="min-h-[145px] sm:min-h-[190px]"
          />

          <RoomCard
            title={rooms[3].title}
            pieces={rooms[3].pieces}
            room={rooms[3].room}
            image={rooms[3].image}
            className="min-h-[145px] sm:min-h-[190px]"
          />

          <RoomCard
            title={rooms[4].title}
            pieces={rooms[4].pieces}
            room={rooms[4].room}
            image={rooms[4].image}
            className="min-h-[145px] sm:min-h-[190px]"
          />
        </div>
      </div>

      <div className="mt-7 sm:mt-10 bg-[#2b1b11] rounded-xl sm:rounded-2xl px-5 sm:px-8 lg:px-14 py-7 sm:py-12 lg:py-14">
        <div className="grid grid-cols-1 lg:grid-cols-[48%_52%] gap-8 lg:gap-14 items-center lg:pe-6">
          <div>
            <p className="text-[12px] font-medium tracking-[6px] uppercase text-[#d49b67] mb-5">
              Our Craft
            </p>

            <h2 className="text-white text-[30px] sm:text-[36px] leading-tight font-medium">
              Furniture for your
              <br />
              <span className="italic font-light text-[#e0b58f]">
                everyday spaces
              </span>
            </h2>

            <p className="mt-6 text-[#c6bbb3] text-[15px] sm:text-[16px] leading-8 max-w-xl">
              Browse the available collection and check each product page for
              its material, dimensions, warranty, and delivery information.
            </p>

            <div className="mt-8 grid grid-cols-3 gap-5 max-w-lg">
              <CraftStat number="5,000" label="Customers" />

              <CraftStat number="2" label="Showrooms" />

              <CraftStat number="4.5/5" label="Average Rating" />
            </div>
          </div>

          <div className="relative hidden sm:block w-full h-[260px] sm:h-[320px] lg:h-[360px] rounded-2xl overflow-hidden bg-[#f3ede6]">
            <Image
              src="https://images.unsplash.com/photo-1593071045469-a45708d54b3d?auto=format&fit=crop&w=500&q=80"
              alt="Nestro Craft"
              fill
              sizes="(max-width: 1024px) 50vw, 40vw"
              className="object-cover object-center"
            />
          </div>
        </div>
      </div>

      <div className="mt-10 px-0 sm:px-6 lg:px-8">
        <div className="bg-white border border-[#e8ded0] rounded-xl overflow-hidden grid grid-cols-2 lg:grid-cols-4">
          {benefits.map((item, index) => {
            return (
              <BenefitBox
                key={index}
                icon={item.icon}
                title={item.title}
                desc={item.desc}
              />
            );
          })}
        </div>
      </div>
    </section>
  );
}

function RoomCard({ title, room, image, className }) {
  return (
    <Link
      href={`/store?room=${room}`}
      className={`group relative rounded-2xl overflow-hidden block ${className}`}
    >
      <Image
        src={image}
        alt={title}
        fill
        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
        className="object-cover transition-transform duration-500 group-hover:scale-105"
      />

      <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/25 to-transparent"></div>

      <div className="absolute left-5 bottom-5 text-white">
        <h3 className="text-[18px] sm:text-[20px] font-semibold">{title}</h3>
      </div>
    </Link>
  );
}

function CraftStat({ number, label }) {
  return (
    <div>
      <h3 className="text-[24px] sm:text-[28px] font-semibold text-[#e0b58f]">
        {number}
      </h3>

      <p className="text-[11px] sm:text-[12px] uppercase tracking-[1.5px] text-[#a99c92] mt-1">
        {label}
      </p>
    </div>
  );
}

function BenefitBox({ icon, title, desc }) {
  return (
    <div className="px-2 sm:px-6 py-5 sm:py-8 text-center border-b border-r lg:border-b-0 border-[#e8ded0] even:border-r-0 lg:even:border-r lg:last:border-r-0">
      <div className="text-[#98663e] text-[24px] flex justify-center mb-4">
        {icon}
      </div>

      <h3 className="text-[16px] font-semibold text-[#111111]">{title}</h3>

      <p className="text-[13px] text-[#667085] mt-2">{desc}</p>
    </div>
  );
}
