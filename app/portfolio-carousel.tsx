"use client";

import { useRef } from "react";
import { CarCard } from "./car-card";

type PortfolioCarouselItem = {
  slug: string;
  href: string;
  name: string;
  year: string;
  priceRange: string;
  summary: string;
  offerLink: string;
  images: string[];
  statusLabel: string;
  statusTone: "neutral" | "available";
};

export function PortfolioCarousel({ items }: { items: PortfolioCarouselItem[] }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const cardRefs = useRef<Array<HTMLDivElement | null>>([]);

  function move(direction: "left" | "right") {
    const container = containerRef.current;
    const cards = cardRefs.current.filter((card): card is HTMLDivElement => Boolean(card));

    if (!container || cards.length === 0) {
      return;
    }

    const firstCard = cards[0];
    const secondCard = cards[1];
    const gap = secondCard ? secondCard.offsetLeft - firstCard.offsetLeft - firstCard.offsetWidth : 12;
    const step = firstCard.offsetWidth + Math.max(gap, 0);

    container.scrollBy({
      left: direction === "right" ? step : -step,
      behavior: "smooth",
    });
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-end gap-2">
        <button
          type="button"
          onClick={() => move("left")}
          aria-label="Scroll left"
          className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/12 bg-white/[0.04] text-lg text-white transition hover:bg-white/[0.08]"
        >
          &#8249;
        </button>
        <button
          type="button"
          onClick={() => move("right")}
          aria-label="Scroll right"
          className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/12 bg-white/[0.04] text-lg text-white transition hover:bg-white/[0.08]"
        >
          &#8250;
        </button>
      </div>

      <div
        ref={containerRef}
        className="flex snap-x snap-mandatory gap-3 overflow-x-auto px-1 pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {items.map((item, index) => (
          <div
            key={item.slug}
            ref={(node) => {
              cardRefs.current[index] = node;
            }}
            className="flex min-w-[calc(100vw-4.75rem)] flex-[0_0_calc(100vw-4.75rem)] snap-start sm:min-w-[320px] sm:flex-[0_0_320px] lg:min-w-[340px] lg:flex-[0_0_340px]"
          >
            <CarCard
              href={item.href}
              name={item.name}
              year={item.year}
              priceRange={item.priceRange}
              summary={item.summary}
              offerLink={item.offerLink}
              images={item.images}
              statusLabel={item.statusLabel}
              statusTone={item.statusTone}
            />
          </div>
        ))}
      </div>
    </div>
  );
}
