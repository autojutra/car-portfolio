"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { getDisplayImageSrc } from "@/lib/image-utils";

type CarGalleryProps = {
  name: string;
  images: string[];
};

export function CarGallery({ name, images }: CarGalleryProps) {
  const gallery = images.length > 0 ? images : [""];
  const [activeIndex, setActiveIndex] = useState(0);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const canSlide = gallery.length > 1;
  const currentImage = gallery[activeIndex] || gallery[0];
  const currentDisplayImage = getDisplayImageSrc(currentImage, 1440);
  const currentLightboxImage = getDisplayImageSrc(currentImage, 2200);

  function showPrevious() {
    setActiveIndex((index) => (index === 0 ? gallery.length - 1 : index - 1));
  }

  function showNext() {
    setActiveIndex((index) => (index === gallery.length - 1 ? 0 : index + 1));
  }

  useEffect(() => {
    if (!isLightboxOpen) {
      return;
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setIsLightboxOpen(false);
        return;
      }

      if (!canSlide) {
        return;
      }

      if (event.key === "ArrowLeft") {
        setActiveIndex((index) => (index === 0 ? gallery.length - 1 : index - 1));
      }

      if (event.key === "ArrowRight") {
        setActiveIndex((index) => (index === gallery.length - 1 ? 0 : index + 1));
      }
    }

    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [canSlide, gallery.length, isLightboxOpen]);

  return (
    <div className="mx-auto w-full max-w-2xl space-y-4 lg:mx-0 lg:max-w-none">
      <div className="group relative aspect-[4/3] overflow-hidden rounded-[1.5rem] border border-white/10 bg-zinc-950/70">
        {currentImage ? (
          <button
            type="button"
            onClick={() => setIsLightboxOpen(true)}
            className="absolute inset-0 block cursor-zoom-in"
            aria-label={`Open ${name} image`}
          >
            <Image
              key={currentDisplayImage}
              src={currentDisplayImage}
              alt={name}
              fill
              sizes="(max-width: 1024px) 100vw, 50vw"
              unoptimized={currentImage.startsWith("data:")}
              className="object-cover transition duration-300 group-hover:scale-[1.015]"
            />
          </button>
        ) : null}

        {canSlide ? (
          <>
            <button
              type="button"
              onClick={showPrevious}
              aria-label="Previous image"
              className="absolute left-4 top-1/2 z-10 -translate-y-1/2 rounded-full border border-white/15 bg-black/45 px-3 py-2 text-sm font-semibold text-white opacity-100 backdrop-blur transition hover:bg-black/60 md:opacity-0 md:group-hover:opacity-100"
            >
              &#8249;
            </button>
            <button
              type="button"
              onClick={showNext}
              aria-label="Next image"
              className="absolute right-4 top-1/2 z-10 -translate-y-1/2 rounded-full border border-white/15 bg-black/45 px-3 py-2 text-sm font-semibold text-white opacity-100 backdrop-blur transition hover:bg-black/60 md:opacity-0 md:group-hover:opacity-100"
            >
              &#8250;
            </button>
          </>
        ) : null}
      </div>

      {gallery.length > 1 ? (
        <div className="grid grid-cols-3 gap-3 sm:grid-cols-4 lg:grid-cols-5">
          {gallery.map((image, index) => (
            <button
              key={`${image}-${index}`}
              type="button"
              onClick={() => setActiveIndex(index)}
              className={`relative aspect-[4/3] overflow-hidden rounded-[1rem] border transition ${
                index === activeIndex
                  ? "border-white/40 ring-1 ring-white/25"
                  : "border-white/10 hover:border-white/20"
              }`}
            >
              <Image
                src={getDisplayImageSrc(image, 480)}
                alt={`${name} ${index + 1}`}
                fill
                sizes="(max-width: 1024px) 33vw, 12vw"
                unoptimized={image.startsWith("data:")}
                className="object-cover"
              />
            </button>
          ))}
        </div>
      ) : null}

      {isLightboxOpen && currentImage ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/88 p-4 backdrop-blur-sm"
          role="dialog"
          aria-modal="true"
          aria-label={`${name} gallery`}
          onClick={() => setIsLightboxOpen(false)}
        >
          <button
            type="button"
            onClick={() => setIsLightboxOpen(false)}
            aria-label="Close gallery"
            className="absolute right-4 top-4 z-10 inline-flex h-11 w-11 items-center justify-center rounded-full border border-white/15 bg-black/50 text-xl font-semibold text-white transition hover:bg-black/70"
          >
            x
          </button>

          {canSlide ? (
            <>
              <button
                type="button"
                onClick={(event) => {
                  event.stopPropagation();
                  showPrevious();
                }}
                aria-label="Previous image"
                className="absolute left-4 top-1/2 z-10 -translate-y-1/2 rounded-full border border-white/15 bg-black/50 px-4 py-3 text-lg font-semibold text-white transition hover:bg-black/70"
              >
                &#8249;
              </button>
              <button
                type="button"
                onClick={(event) => {
                  event.stopPropagation();
                  showNext();
                }}
                aria-label="Next image"
                className="absolute right-4 top-1/2 z-10 -translate-y-1/2 rounded-full border border-white/15 bg-black/50 px-4 py-3 text-lg font-semibold text-white transition hover:bg-black/70"
              >
                &#8250;
              </button>
            </>
          ) : null}

          <div
            className="relative h-[min(82vh,980px)] w-full max-w-6xl"
            onClick={(event) => event.stopPropagation()}
          >
            <Image
              key={currentLightboxImage}
              src={currentLightboxImage}
              alt={name}
              fill
              sizes="100vw"
              unoptimized={currentImage.startsWith("data:")}
              className="object-contain"
              priority
            />
          </div>
        </div>
      ) : null}
    </div>
  );
}
