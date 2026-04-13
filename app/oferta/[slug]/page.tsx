import Link from "next/link";
import { notFound } from "next/navigation";
import { CarGallery } from "@/app/car-gallery";
import { submitInquiryAction } from "@/app/actions";
import { buildLangHref, getLang, text } from "@/lib/i18n";
import { SiteFooter } from "@/lib/site-footer";
import { getCarBySlug, getLocalizedCarText } from "@/lib/store";

type CarDetailsPageProps = {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ lang?: string; contact?: string }>;
};

export default async function CarDetailsPage({
  params,
  searchParams,
}: CarDetailsPageProps) {
  const [{ slug }, query] = await Promise.all([params, searchParams]);
  const lang = getLang(query.lang);
  const copy = text(lang);
  const car = await getCarBySlug(slug);

  if (!car) {
    notFound();
  }

  const localized = getLocalizedCarText(car, lang);
  const galleryImages = localized.images.length > 0 ? localized.images : [car.image];
  const homeHref = buildLangHref("/", lang);
  const isAvailable = car.portfolioType === "available";

  const contactTitle = isAvailable
    ? lang === "pl"
      ? "Chcesz porozmawiac o tym aucie?"
      : "Want to talk about this car?"
    : copy.contactTitle;

  const contactBody = isAvailable
    ? lang === "pl"
      ? `Skontaktuj sie z nami w sprawie modelu ${car.name}. Przekazemy wiecej informacji o dostepnosci auta, wyposazeniu, cenie i kolejnych krokach zakupu.`
      : `Contact us regarding the ${car.name}. We will share more details about the vehicle's availability, equipment, pricing, and the next steps to purchase it.`
    : copy.contactBody.replace("{car}", car.name);

  const priceLabel = isAvailable
    ? lang === "pl"
      ? "Cena sprzedazy"
      : "Sale price"
    : copy.priceLabel;

  const priceDisclaimer = isAvailable
    ? lang === "pl"
      ? "To auto jest juz sprowadzone i dostepne w aktualnej ofercie. Szczegoly wyposazenia, historii oraz finalnych warunkow zakupu przekazujemy podczas kontaktu."
      : "This vehicle has already been imported and is part of the current offer. Full equipment, history, and final purchase terms are shared during direct contact."
    : copy.priceDisclaimer;

  const mileageLabel = lang === "pl" ? "Przebieg" : "Mileage";
  const contactFeedback =
    query.contact === "sent"
      ? copy.contactSent
      : query.contact === "saved"
        ? copy.contactSaved
        : query.contact === "missing"
          ? copy.contactMissing
          : null;

  return (
    <main className="relative min-h-screen bg-black px-4 py-6 text-white sm:px-6 sm:py-8 lg:px-12 lg:py-10">
      <Link
        href={homeHref}
        aria-label={lang === "pl" ? "Powrot na strone glowna" : "Back to homepage"}
        className="absolute inset-0 z-0 block"
      />

      <div className="relative z-10 mx-auto flex max-w-7xl flex-col gap-8">
        <header className="rounded-[1.75rem] border border-white/10 bg-[radial-gradient(circle_at_top,_rgba(255,255,255,0.12),_transparent_30%),linear-gradient(180deg,_#171717_0%,_#050505_100%)] p-5 shadow-[0_30px_80px_rgba(0,0,0,0.55)] sm:p-8">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <Link
              href={homeHref}
              className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-4 py-2 text-sm font-semibold text-zinc-200 transition hover:border-white/20 hover:bg-white/[0.08] hover:text-white"
            >
              <span className="text-base leading-none">&larr;</span>
              <span>{lang === "pl" ? "Strona glowna" : "Home page"}</span>
            </Link>
            <LanguageSwitch currentLang={lang} path={`/oferta/${car.slug}`} />
          </div>

          <div className="mt-6 grid gap-6 lg:grid-cols-[1.05fr_0.95fr] lg:items-start">
            <CarGallery name={car.name} images={galleryImages} />

            <div className="space-y-5 pt-1 lg:-mt-2">
              <p className="text-sm uppercase tracking-[0.35em] text-zinc-500">
                {copy.detailLabel}
              </p>
              <h1 className="text-3xl font-semibold tracking-tight sm:text-5xl">{car.name}</h1>
              <div className="rounded-[1.25rem] border border-white/10 bg-white/[0.04] p-5">
                <p className="text-sm text-zinc-400">{priceLabel}</p>
                <p className="mt-2 text-2xl font-semibold text-white sm:text-3xl">
                  {car.priceRange}
                </p>
                <p className="mt-3 text-sm leading-6 text-zinc-400">{priceDisclaimer}</p>
              </div>
              <div className="rounded-[1.25rem] border border-white/10 bg-white/[0.03] p-5">
                <p className="text-xs uppercase tracking-[0.3em] text-zinc-500">
                  {lang === "pl" ? "Krotki opis oferty" : "Offer summary"}
                </p>
                <p className="mt-3 text-base leading-7 text-zinc-300">{localized.summary}</p>
              </div>
            </div>
          </div>
        </header>

        {contactFeedback ? (
          <div className="rounded-[1.5rem] border border-white/10 bg-white/[0.04] px-5 py-4 text-sm text-zinc-200">
            {contactFeedback}
          </div>
        ) : null}

        <section className="grid gap-6">
          <div className="rounded-[1.5rem] border border-white/10 bg-zinc-950/90 p-5 shadow-[0_24px_60px_rgba(0,0,0,0.45)] sm:p-6">
            <div className="grid gap-6 lg:grid-cols-[minmax(0,0.92fr)_minmax(320px,1.08fr)] lg:items-start">
              <div className="rounded-[1.25rem] border border-white/10 bg-white/[0.03] p-5 sm:p-6">
                <p className="text-sm uppercase tracking-[0.35em] text-zinc-500">
                  {copy.specsLabel}
                </p>
                <div className="mt-5 grid gap-3 sm:grid-cols-3 lg:grid-cols-1">
                  <SpecCard label={copy.bodyType} value={car.body} />
                  <SpecCard label={copy.batteryLabel} value={car.battery} />
                  <SpecCard label={copy.rangeLabel} value={car.range} />
                  {isAvailable && car.mileage ? (
                    <SpecCard label={mileageLabel} value={car.mileage} />
                  ) : null}
                </div>
              </div>

              <div className="rounded-[1.25rem] border border-white/10 bg-white/[0.03] p-5 sm:p-6">
                <p className="text-sm uppercase tracking-[0.35em] text-zinc-500">
                  {lang === "pl" ? "Dokladny opis auta" : "Detailed car description"}
                </p>
                <p className="mt-4 text-[15px] leading-8 text-zinc-300 sm:text-[17px] sm:leading-8">
                  {localized.description}
                </p>
              </div>
            </div>
          </div>
        </section>

        <section id="contact-form" className="grid gap-6 lg:grid-cols-[0.95fr_1.05fr]">
          <div className="rounded-[1.75rem] border border-white/10 bg-[linear-gradient(180deg,_rgba(255,255,255,0.05),_rgba(255,255,255,0.02))] p-5 shadow-[0_24px_60px_rgba(0,0,0,0.45)] sm:p-6">
            <div className="space-y-4">
              <p className="text-sm uppercase tracking-[0.35em] text-zinc-500">autojutra.pl</p>
              <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl">
                {contactTitle}
              </h2>
              <p className="text-sm leading-7 text-zinc-400 sm:text-base">{contactBody}</p>
            </div>
          </div>

          <div className="rounded-[1.75rem] border border-white/10 bg-zinc-950/90 p-5 shadow-[0_24px_60px_rgba(0,0,0,0.45)] sm:p-6">
            <div className="space-y-3">
              <p className="text-sm uppercase tracking-[0.35em] text-zinc-500">
                {copy.contactFormTitle}
              </p>
              <h2 className="text-2xl font-semibold tracking-tight">{copy.sendRequest}</h2>
              <p className="text-sm leading-6 text-zinc-400">{copy.contactFormBody}</p>
            </div>

            {contactFeedback ? (
              <div className="mt-5 rounded-[1.25rem] border border-emerald-400/20 bg-emerald-500/10 px-4 py-3 text-sm leading-6 text-emerald-100">
                {contactFeedback}
              </div>
            ) : null}

            <form action={submitInquiryAction} className="mt-6 space-y-4">
              <input type="hidden" name="lang" value={lang} />
              <input type="hidden" name="carSlug" value={car.slug} />

              <Field label={copy.name} name="customerName" placeholder={copy.fullNamePlaceholder} />
              <Field label={copy.email} name="email" type="email" placeholder="name@email.com" />
              <Field label={copy.phone} name="phone" type="tel" placeholder="+48 123 456 789" />

              <label className="block space-y-2">
                <span className="text-sm font-medium text-zinc-300">{copy.message}</span>
                <textarea
                  name="message"
                  rows={4}
                  className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none transition focus:border-white/25 focus:bg-white/8"
                  placeholder={copy.messagePlaceholder}
                />
              </label>

              <button className="w-full rounded-full bg-white px-6 py-3 text-sm font-semibold text-black transition hover:bg-zinc-200">
                {copy.sendRequest}
              </button>
            </form>
          </div>
        </section>

        <SiteFooter lang={lang} />
      </div>
    </main>
  );
}

function SpecCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[1.1rem] border border-white/10 bg-white/[0.03] p-4">
      <p className="text-sm text-zinc-500">{label}</p>
      <p className="mt-2 text-lg font-semibold text-white">{value}</p>
    </div>
  );
}

function Field({
  label,
  name,
  placeholder,
  type = "text",
}: {
  label: string;
  name: string;
  placeholder: string;
  type?: string;
}) {
  return (
    <label className="block space-y-2">
      <span className="text-sm font-medium text-zinc-300">{label}</span>
      <input
        name={name}
        type={type}
        required
        className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none transition focus:border-white/25 focus:bg-white/8"
        placeholder={placeholder}
      />
    </label>
  );
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
