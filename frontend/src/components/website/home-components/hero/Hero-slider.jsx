"use client";

import Link from "next/link";
import React, { useCallback, useEffect, useState } from "react";
import { IoIosArrowBack, IoIosArrowForward } from "react-icons/io";

export default function HeroSlider({ heroData }) {
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);

  const nextSlide = useCallback(() => {
    setActive((prev) => (prev === heroData.length - 1 ? 0 : prev + 1));
  }, [heroData.length]);

  const prevSlide = useCallback(() => {
    setActive((prev) => (prev === 0 ? heroData.length - 1 : prev - 1));
  }, [heroData.length]);

  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setReducedMotion(media.matches);
    update();
    media.addEventListener("change", update);
    return () => media.removeEventListener("change", update);
  }, []);

  useEffect(() => {
    if (paused || reducedMotion || heroData.length < 2) return undefined;
    const timer = setInterval(() => {
      nextSlide();
    }, 4000);

    return () => clearInterval(timer);
  }, [nextSlide, paused, reducedMotion, heroData.length]);

  return (
    <section className="w-full bg-[#fafaf9f7] px-2.5 sm:px-6 lg:px-8 py-2.5 sm:py-6">
      <div
        className="relative w-full min-h-[370px] sm:min-h-125 lg:min-h-130 rounded-xl sm:rounded-2xl overflow-hidden bg-cover bg-center transition-all duration-700"
        style={{
          backgroundImage: `url(${heroData[active].image})`,
        }}
      >
        <div className="absolute inset-0 bg-black/45"></div>

        <div className="relative z-10 min-h-[370px] sm:min-h-125 lg:min-h-130 flex items-center">
          <div className="max-w-xl px-6 sm:px-10 lg:px-16 pb-8 sm:pb-0">
            <p className="text-[10px] sm:text-[11px] tracking-[3px] sm:tracking-[4px] text-[#caa27c] font-semibold mb-4 sm:mb-5">
              {heroData[active].tag}
            </p>

            <h1 className="text-white text-[30px] sm:text-[48px] lg:text-[58px] leading-[1.05] font-semibold mb-3 sm:mb-4">
              {heroData[active].title}{" "}
              <span className="italic font-light">
                {heroData[active].italic}
              </span>
            </h1>

            <p className="text-white/75 text-[13px] sm:text-[15px] max-w-md leading-5 sm:leading-6 mb-5 sm:mb-7 line-clamp-2 sm:line-clamp-none">
              {heroData[active].desc}
            </p>

            <div className="flex items-center gap-3 sm:gap-4">
              <Link
                href="/store"
                className="bg-[#8b5e3c] text-white px-6 py-3 rounded-sm text-[13px] font-semibold hover:bg-[#70482e] transition cursor-pointer"
              >
                Browse furniture
              </Link>
              <Link
                href="/store?newArrival=true"
                className="hidden sm:block border border-white/25 text-white px-6 py-3 rounded-sm text-[13px] font-semibold hover:bg-white hover:text-black transition cursor-pointer"
              >
                View new arrivals
              </Link>
            </div>
          </div>
        </div>

        <button
          type="button"
          aria-label="Previous slide"
          onClick={prevSlide}
          className="hidden sm:flex absolute left-3 sm:left-5 top-1/2 -translate-y-1/2 z-20 w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-white/15 text-white items-center justify-center hover:bg-white hover:text-black transition cursor-pointer"
        >
          <IoIosArrowBack />
        </button>

        <button
          type="button"
          aria-label="Next slide"
          onClick={nextSlide}
          className="hidden sm:flex absolute right-3 sm:right-5 top-1/2 -translate-y-1/2 z-20 w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-white/15 text-white items-center justify-center hover:bg-white hover:text-black transition cursor-pointer"
        >
          <IoIosArrowForward />
        </button>

        <div className="absolute left-6 sm:left-12 bottom-4 sm:bottom-8 z-20 flex items-center gap-2">
          {heroData.map((item, index) => {
            return (
              <button
                type="button"
                aria-label={`Show slide ${index + 1}`}
                aria-current={active === index ? "true" : undefined}
                key={index}
                onClick={() => setActive(index)}
                className={`h-0.75 rounded-full transition-all duration-300 cursor-pointer ${
                  active === index ? "w-8 bg-[#caa27c]" : "w-6 bg-white/35"
                }`}
              ></button>
            );
          })}
          <button
            type="button"
            onClick={() => setPaused((value) => !value)}
            className="hidden sm:block ml-2 rounded border border-white/40 px-2 py-1 text-xs text-white focus-visible:outline-2"
            aria-pressed={paused}
          >
            {paused ? "Play slides" : "Pause slides"}
          </button>
        </div>
      </div>
    </section>
  );
}
