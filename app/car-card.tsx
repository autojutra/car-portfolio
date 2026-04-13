"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { getDisplayImageSrc } from "@/lib/image-utils";

type CarCardProps = {
  href: string;
  name: string;
  year: string;
  priceRange: string;
  summary: string;
  offerLink: string;
  images: string[];
  statusLabel?: string;
  statusTone?: "neutral" | "available";
};

export function CarCard({
  href,
  name,
  year,
  priceRange,
  summary,
  offerLink,
  images,
  statusLabel,
  statusTone = "neutral",
}: CarCardProps) {
  const gallery = images.length > 0 ? images : [""];
  const [activeIndex, setActiveIndex] = useState(0);

  const canSlide = gallery.length > 1;
  const currentImage = gallery[activeIndex] || gallery[0];
  const displayImage = getDisplayImageSrc(currentImage, 960);

  function showPrevious(event: React.MouseEvent<HTMLButtonElement>) {
    event.preventDefault();
    event.stopPropagation();
    setActiveIndex((index) => (index === 0 ? gallery.length - 1 : index - 1));
  }

  function showNext(event: React.MouseEvent<HTMLButtonElement>) {
    event.preventDefault();
    event.stopPropagation();
    setActiveIndex((index) => (index === gallery.length - 1 ? 0 : index + 1));
  }

  return (
    <Link
      href={href}
      className={`group mx-auto flex h-full w-full max-w-sm flex-col rounded-[1.2rem] border p-2.5 transition duration-300 hover:-translate-y-1 sm:max-w-none ${
        statusTone === "available"
          ? "border-stone-200/12 bg-[linear-gradient(180deg,rgba(21,18,16,0.98),rgba(8,7,6,0.98))] shadow-[0_14px_34px_rgba(41,37,36,0.26)] hover:border-stone-100/22 sm:shadow-[0_22px_48px_rgba(41,37,36,0.3)]"
          : "border-slate-200/12 bg-[linear-gradient(180deg,rgba(18,21,28,0.98),rgba(6,8,12,0.98))] shadow-[0_14px_34px_rgba(15,23,42,0.3)] hover:border-slate-100/22 sm:shadow-[0_22px_48px_rgba(15,23,42,0.34)] sm:hover:shadow-[0_26px_56px_rgba(148,163,184,0.05)]"
      }`}
    >
      <div className="relative aspect-[4/3] overflow-hidden rounded-[0.95rem] border border-white/10 bg-zinc-900 sm:bg-[radial-gradient(circle_at_top,_rgba(255,255,255,0.12),_transparent_55%),linear-gradient(180deg,_rgba(39,39,42,0.95),_rgba(9,9,11,0.95))]">
        {statusLabel ? (
          <div className="absolute left-3 top-3 z-10">
            <span
              className={`inline-flex rounded-full border px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.22em] ${
                statusTone === "available"
                  ? "border-slate-100/12 bg-black/50 text-slate-50/90"
                  : "border-slate-100/12 bg-black/50 text-slate-50/90"
              }`}
            >
              {statusLabel}
            </span>
          </div>
        ) : null}

        {currentImage ? (
          <>
            <Image
              key={displayImage}
              src={displayImage}
              alt={name}
              fill
              sizes="(max-width: 640px) 100vw, (max-width: 1280px) 50vw, 25vw"
              className="object-cover scale-[1.04] transition-transform duration-500 group-hover:scale-[1.08]"
            />
            <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(0,0,0,0.04),rgba(0,0,0,0.02)_55%,rgba(0,0,0,0.28)_100%)]" />
          </>
        ) : null}

        {canSlide ? (
          <>
            <button
              type="button"
              onClick={showPrevious}
              aria-label="Previous image"
              className="absolute left-3 top-1/2 z-10 -translate-y-1/2 rounded-full border border-white/15 bg-black/70 px-3 py-2 text-sm font-semibold text-white opacity-100 transition hover:bg-black/80 md:opacity-0 md:group-hover:opacity-100 md:bg-black/45 md:hover:bg-black/60 md:backdrop-blur"
            >
              &#8249;
            </button>
            <button
              type="button"
              onClick={showNext}
              aria-label="Next image"
              className="absolute right-3 top-1/2 z-10 -translate-y-1/2 rounded-full border border-white/15 bg-black/70 px-3 py-2 text-sm font-semibold text-white opacity-100 transition hover:bg-black/80 md:opacity-0 md:group-hover:opacity-100 md:bg-black/45 md:hover:bg-black/60 md:backdrop-blur"
            >
              &#8250;
            </button>
            <div className="absolute bottom-3 left-1/2 flex -translate-x-1/2 gap-1.5 rounded-full border border-white/10 bg-black/55 px-2 py-1 sm:bg-black/35 sm:backdrop-blur">
              {gallery.map((image, index) => (
                <span
                  key={`${image}-${index}`}
                  className={`h-1.5 w-1.5 rounded-full transition ${
                    index === activeIndex ? "bg-white" : "bg-white/35"
                  }`}
                />
              ))}
            </div>
          </>
        ) : null}
      </div>

      <div className="mt-2 flex flex-1 flex-col rounded-[0.95rem] border border-white/7 bg-black/28 px-4 pb-4 pt-4 sm:bg-black/22 sm:px-4.5">
        <h3 className="text-[1.12rem] font-semibold leading-tight tracking-tight text-white sm:text-[1.2rem]">
          {name}
        </h3>
        <p className="mt-2 text-xs uppercase tracking-[0.2em] text-zinc-500 sm:text-[0.8rem]">
          {year}
        </p>
        <p
          className={`mt-1.5 text-[1.08rem] font-semibold leading-tight sm:text-[1.14rem] ${
            statusTone === "available" ? "text-stone-100/95" : "text-white"
          }`}
        >
          {priceRange}
        </p>
        <p className="mt-2.5 min-h-[4.5rem] line-clamp-2 text-[0.95rem] leading-6 text-zinc-400 sm:text-sm">
          {summary}
        </p>

        <span
          className={`mt-auto inline-flex rounded-full border px-3 py-2 text-xs font-semibold transition sm:text-sm ${
            statusTone === "available"
              ? "border-stone-200/12 bg-stone-200/[0.04] text-white group-hover:border-stone-100/22 group-hover:bg-stone-100 group-hover:text-black"
              : "border-slate-100/12 bg-slate-200/[0.04] text-white group-hover:border-slate-100/22 group-hover:bg-slate-100 group-hover:text-black"
          }`}
        >
          {offerLink}
        </span>
      </div>
    </Link>
  );
}
