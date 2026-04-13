import Image from "next/image";
import Link from "next/link";
import { PortfolioCarousel } from "./portfolio-carousel";
import heroShowcaseImage from "../byd-song-l-back-precio.jpg";
import { buildLangHref, getLang, text } from "@/lib/i18n";
import { SiteFooter } from "@/lib/site-footer";
import { getCarsByType, getLocalizedCarText, type CarRecord } from "@/lib/store";

type HomePageProps = {
  searchParams: Promise<{ lang?: string }>;
};

export default async function Home({ searchParams }: HomePageProps) {
  const params = await searchParams;
  const lang = getLang(params.lang);
  const copy = text(lang);
  const [exampleCars, availableCars] = await Promise.all([
    getCarsByType("example"),
    getCarsByType("available"),
  ]);
  const heroCar = exampleCars[0] ?? availableCars[0] ?? null;

  return (
    <main className="min-h-screen overflow-hidden bg-black text-white">
      <div className="relative isolate">
        <div className="absolute inset-0 -z-10 bg-[linear-gradient(180deg,_#171717_0%,_#050505_45%,_#000_100%)] sm:bg-[radial-gradient(circle_at_top,_rgba(255,255,255,0.12),_transparent_30%),linear-gradient(180deg,_#171717_0%,_#050505_45%,_#000_100%)]" />
        <div className="absolute inset-x-0 top-0 -z-10 hidden h-56 bg-gradient-to-b from-white/10 via-transparent to-transparent blur-3xl sm:block" />

        <section className="mx-auto flex max-w-7xl flex-col gap-5 px-4 py-3 sm:px-6 sm:py-4 lg:px-12 lg:py-6">
          <header className="flex flex-col gap-4 rounded-[1.35rem] border border-white/10 bg-zinc-950/95 p-4 shadow-[0_12px_28px_rgba(0,0,0,0.34)] sm:bg-white/[0.03] sm:p-5 sm:shadow-[0_18px_48px_rgba(0,0,0,0.42)] sm:backdrop-blur">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="space-y-1">
                <span className="inline-flex w-fit items-center rounded-full border border-white/15 bg-white/5 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.3em] text-zinc-300">
                  autojutra.pl
                </span>
                <p className="text-xs text-zinc-500 sm:text-sm">{copy.brandNote}</p>
              </div>
              <LanguageSwitch currentLang={lang} path="/" />
            </div>

            <div className="grid gap-4 lg:grid-cols-[minmax(0,1.02fr)_minmax(320px,0.98fr)] lg:items-stretch">
              <div className="space-y-3">
                <p className="text-xs uppercase tracking-[0.3em] text-zinc-500">
                  {copy.premiumExperience}
                </p>
                <h1 className="max-w-4xl text-2xl font-semibold tracking-tight text-white sm:text-3xl lg:text-4xl">
                  {copy.heroTitle}
                </h1>
                <p className="max-w-3xl text-xs leading-6 text-zinc-400 sm:text-sm">
                  {copy.heroBody}
                </p>
              </div>

              <div className="grid gap-3 lg:grid-cols-[0.66fr_1.34fr]">
                <div className="grid grid-cols-3 gap-2 sm:grid-cols-3 lg:grid-cols-1">
                  {[
                    [String(exampleCars.length + availableCars.length), copy.carsInPortfolio],
                    ["1:1", copy.concierge],
                    ["PLN", copy.routing],
                  ].map(([value, label]) => (
                    <div
                      key={label}
                      className="rounded-[1.1rem] border border-white/10 bg-zinc-900 px-3 py-2.5 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)] sm:rounded-2xl sm:bg-gradient-to-br sm:from-white/10 sm:to-white/[0.02] sm:p-3 sm:shadow-[inset_0_1px_0_rgba(255,255,255,0.08)] lg:min-h-[108px]"
                    >
                      <p className="text-base font-semibold text-white sm:text-lg">{value}</p>
                      <p className="mt-1 text-[10px] leading-4 text-zinc-400 sm:text-xs sm:leading-5">
                        {label}
                      </p>
                    </div>
                  ))}
                </div>

                {heroCar ? (
                  <div className="relative min-h-[220px] overflow-hidden rounded-[1.6rem] border border-white/10 bg-zinc-900 shadow-[0_16px_32px_rgba(0,0,0,0.36)] sm:min-h-[250px] sm:bg-zinc-900/80 sm:shadow-[0_24px_60px_rgba(0,0,0,0.42)]">
                    <Image
                      src={heroShowcaseImage}
                      alt="BYD Song L"
                      fill
                      sizes="(max-width: 1024px) 100vw, 38vw"
                      className="object-cover scale-[1.05]"
                    />
                    <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(0,0,0,0.18),rgba(0,0,0,0.12)_28%,rgba(0,0,0,0.48)_100%)] sm:bg-[linear-gradient(180deg,rgba(0,0,0,0.12),rgba(0,0,0,0.1)_28%,rgba(0,0,0,0.5)_100%)]" />
                    <div className="absolute inset-x-0 top-0 hidden h-28 bg-gradient-to-b from-black/40 to-transparent sm:block" />

                    <div className="absolute inset-x-0 bottom-0 p-4 sm:p-5">
                      <div className="grid gap-2 sm:max-w-[92%]">
                        {[
                          lang === "pl" ? "Import na zamówienie" : "On-demand import",
                          lang === "pl" ? "Analiza przed zakupem" : "Pre-purchase analysis",
                          lang === "pl" ? "Transport do Polski" : "Transport to Poland",
                          lang === "pl"
                            ? "Możliwość wykupienia gwarancji"
                            : "Optional warranty available",
                          lang === "pl"
                            ? "Finansowanie wg potrzeby"
                            : "Financing tailored to your needs",
                        ].map((item) => (
                          <div
                            key={item}
                            className="w-fit max-w-full rounded-full border border-white/15 bg-black/70 px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.22em] text-white/90 sm:bg-black/40 sm:text-[11px] sm:backdrop-blur"
                          >
                            {item}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                ) : null}
              </div>
            </div>
          </header>

          <PortfolioSection
            lang={lang}
            variant="available"
            title={copy.availablePortfolioTag}
            subtitle={copy.availablePortfolio}
            body={copy.availablePortfolioBody}
            cars={availableCars}
            emptyLabel={copy.noAvailableCars}
            offerLink={copy.offerLink}
          />

          <PortfolioSection
            lang={lang}
            variant="example"
            title={copy.featuredInventory}
            subtitle={copy.driveCollection}
            body={copy.inventoryBody}
            cars={exampleCars}
            emptyLabel={copy.noExampleCars}
            offerLink={copy.offerLink}
          />

          <section
            id="jak-to-dziala"
            className="grid gap-5 rounded-[1.5rem] border border-white/10 bg-[linear-gradient(180deg,rgba(18,18,20,0.96),rgba(4,4,5,0.98))] p-4 shadow-[0_16px_34px_rgba(0,0,0,0.34)] sm:p-6 sm:shadow-[0_22px_58px_rgba(0,0,0,0.44)] lg:grid-cols-[0.88fr_1.12fr] lg:gap-6"
          >
            <div className="flex flex-col justify-between gap-5 rounded-[1.25rem] border border-white/8 bg-[linear-gradient(180deg,rgba(255,255,255,0.025),rgba(255,255,255,0.01))] p-5 sm:p-6">
              <div className="space-y-4">
                <p className="text-xs uppercase tracking-[0.34em] text-zinc-500">autojutra.pl</p>
                <h2 className="text-[1.9rem] font-semibold tracking-tight text-white sm:text-[2.25rem]">
                  {copy.sourcingTitle}
                </h2>
                <p className="max-w-2xl text-sm leading-8 text-zinc-400 sm:text-[1.05rem]">
                  {copy.sourcingBody}
                </p>
              </div>
            </div>

            <div className="grid gap-3">
              {copy.sourcingSteps.map((step, index) => (
                <div
                  key={step}
                  className="group grid gap-3 rounded-[1.25rem] border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.028),rgba(255,255,255,0.012))] p-4 transition hover:border-white/16 hover:bg-[linear-gradient(180deg,rgba(255,255,255,0.042),rgba(255,255,255,0.016))] sm:grid-cols-[72px_minmax(0,1fr)] sm:items-start sm:gap-4 sm:p-5"
                >
                  <div className="flex items-center gap-3 sm:block">
                    <div className="inline-flex h-11 min-w-11 items-center justify-center rounded-full border border-white/10 bg-white/[0.03] text-sm font-semibold tracking-[0.32em] text-zinc-400">
                      {index + 1}
                    </div>
                    <div className="h-px flex-1 bg-gradient-to-r from-white/10 to-transparent sm:mt-4 sm:h-16 sm:w-px sm:bg-gradient-to-b" />
                  </div>

                  <p className="text-base leading-8 text-zinc-200 sm:pt-1 sm:text-[1.05rem]">
                    {step}
                  </p>
                </div>
              ))}
            </div>
          </section>

          <SiteFooter lang={lang} />
        </section>
      </div>
    </main>
  );
}

function PortfolioSection({
  lang,
  variant,
  title,
  subtitle,
  body,
  cars,
  emptyLabel,
  offerLink,
}: {
  lang: "pl" | "en";
  variant: "example" | "available";
  title: string;
  subtitle: string;
  body: string;
  cars: CarRecord[];
  emptyLabel: string;
  offerLink: string;
}) {
  const isAvailable = variant === "available";
  const sectionLabel =
    lang === "pl"
      ? isAvailable
        ? "Auta gotowe do sprzedaży"
        : "Modele na zamówienie"
      : isAvailable
        ? "Cars ready for sale"
        : "Models on request";
  const headerNote =
    lang === "pl"
      ? isAvailable
        ? "Te samochody są już sprowadzone i można o nich rozmawiać od razu."
        : "To są przykłady modeli. Każde auto wyszukujemy osobno pod klienta."
      : isAvailable
        ? "These cars are already imported and available for direct discussion."
        : "These are example models. Each vehicle is sourced individually for the client.";
  const cardLabel =
    lang === "pl"
      ? isAvailable
        ? "Dostępne teraz"
        : "Na zamówienie"
      : isAvailable
        ? "Available now"
        : "On request";

  return (
    <section
      className={`space-y-4 rounded-[1.35rem] border p-4 sm:p-5 ${
        isAvailable
          ? "border-stone-200/10 bg-[linear-gradient(180deg,rgba(231,229,228,0.03),rgba(13,11,10,0.94)_22%,rgba(0,0,0,0.99)_100%)] shadow-[0_18px_48px_rgba(41,37,36,0.12)]"
          : "border-slate-200/10 bg-[linear-gradient(180deg,rgba(226,232,240,0.028),rgba(10,11,16,0.93)_24%,rgba(0,0,0,0.98)_100%)] shadow-[0_18px_48px_rgba(15,23,42,0.12)]"
      }`}
    >
      <div
        className={`flex flex-col gap-3 border-b pb-4 sm:flex-row sm:items-end sm:justify-between ${
          isAvailable ? "border-stone-200/8" : "border-slate-200/8"
        }`}
      >
        <div className="space-y-2">
          <div className="flex flex-col items-start gap-2 sm:flex-row sm:items-center">
            <p className="whitespace-nowrap text-xs uppercase tracking-[0.3em] text-zinc-500">
              {title}
            </p>
            <span
              className={`whitespace-nowrap rounded-full border px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.22em] ${
                isAvailable
                  ? "border-stone-200/10 bg-stone-200/[0.03] text-stone-100/76"
                  : "border-slate-200/10 bg-slate-200/[0.03] text-slate-100/76"
              }`}
            >
              {sectionLabel}
            </span>
          </div>
          <h2 className="text-xl font-semibold tracking-tight text-white sm:text-2xl">
            {subtitle}
          </h2>
          <p
            className={`max-w-2xl text-xs leading-6 sm:text-sm ${
              isAvailable ? "text-stone-100/56" : "text-slate-100/56"
            }`}
          >
            {headerNote}
          </p>
        </div>
        <p className="max-w-3xl text-xs leading-6 text-zinc-400 sm:text-right sm:text-sm">
          {body}
        </p>
      </div>

      {cars.length === 0 ? (
        <div className="rounded-[1rem] border border-white/10 bg-zinc-950/70 p-4 text-sm text-zinc-400">
          {emptyLabel}
        </div>
      ) : (
        <PortfolioCarousel
          items={cars.map((car) => {
            const localized = getLocalizedCarText(car, lang);
            return {
              slug: car.slug,
              href: buildLangHref(`/oferta/${car.slug}`, lang),
              name: car.name,
              year: car.year,
              priceRange: car.priceRange,
              summary: getPortfolioCardSummary({
                summary: localized.summary,
                portfolioType: car.portfolioType,
                lang,
              }),
              offerLink,
              images: localized.images.length > 0 ? localized.images : [car.image],
              statusLabel: cardLabel,
              statusTone: (isAvailable ? "available" : "neutral") as
                | "available"
                | "neutral",
            };
          })}
        />
      )}
    </section>
  );
}

function getPortfolioCardSummary({
  summary,
  portfolioType,
  lang,
}: {
  summary: string;
  portfolioType: "example" | "available";
  lang: "pl" | "en";
}) {
  if (portfolioType !== "available") {
    return summary;
  }

  const normalized = summary.toLowerCase();
  const soundsLikePlaceholder =
    normalized.includes("pogl") ||
    normalized.includes("pokaz") ||
    normalized.includes("sekcj") ||
    normalized.includes("niedlug") ||
    normalized.includes("przykladow") ||
    normalized.includes("demo");

  if (!soundsLikePlaceholder) {
    return summary;
  }

  return lang === "pl"
    ? "Samochod dostepny od reki. Skontaktuj sie, aby poznac szczegoly oferty i potwierdzic aktualna dostepnosc."
    : "Vehicle available now. Contact us for full offer details and current availability confirmation.";
}

function LanguageSwitch({
  currentLang,
  path,
}: {
  currentLang: "pl" | "en";
  path: string;
}) {
  return (
    <div className="inline-flex rounded-full border border-white/15 bg-white/5 p-1">
      <Link
        href={buildLangHref(path, "pl")}
        className={`rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] transition ${
          currentLang === "pl" ? "bg-white text-black" : "text-zinc-300 hover:bg-white/10"
        }`}
      >
        PL
      </Link>
      <Link
        href={buildLangHref(path, "en")}
        className={`rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] transition ${
          currentLang === "en" ? "bg-white text-black" : "text-zinc-300 hover:bg-white/10"
        }`}
      >
        EN
      </Link>
    </div>
  );
}
