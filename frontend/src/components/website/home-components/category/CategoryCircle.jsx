"use client";

import Image from "next/image";
import Link from "next/link";
import { ImageIcon } from "lucide-react";

export default function CategoryCircle({ image, title, slug }) {
  const hasValidImage = typeof image === "string" && image.trim() !== "";

  return (
    <Link
      href={slug ? `/store?category=${slug}` : "/store"}
      className="
                group
                flex
                shrink-0
                flex-col
                items-center
                gap-3
                text-center
            "
    >
      <div
        className="
                    relative
                    flex
                    w-21.5
                    h-21.5
                    sm:w-25
                    sm:h-25
                    lg:w-27.5
                    lg:h-27.5
                    items-center
                    justify-center
                    overflow-hidden
                    rounded-full
                    border
                    border-[#e8ded0]
                    bg-[#f5eee8]
                    transition
                    duration-300
                    group-hover:border-3
                    group-hover:border-[#c79b73]
                    group-hover:shadow-md
                "
      >
        {hasValidImage ? (
          <Image
            src={image}
            alt={title || "Category"}
            fill
            sizes="
                            (max-width: 640px) 86px,
                            (max-width: 1024px) 100px,
                            110px
                        "
            className="
                            object-cover
                            transition
                            duration-300
                            group-hover:scale-105
                        "
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center">
            <ImageIcon size={26} strokeWidth={1.6} className="text-[#a87952]" />
          </div>
        )}
      </div>

      <p
        className="
                    max-w-[110px]
                    text-[12px]
                    font-medium
                    leading-4
                    text-[#3c2c22]
                    transition
                    group-hover:text-[#8b5e3c]
                    sm:text-[13px]
                "
      >
        {title || "Category"}
      </p>
    </Link>
  );
}
