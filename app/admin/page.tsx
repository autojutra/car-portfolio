import Image from "next/image";
import { redirect } from "next/navigation";
import { AdminDeleteCarForm } from "@/app/admin-delete-car-form";
import { AdminImagePicker } from "@/app/admin-image-picker";
import { AdminPricingFields } from "@/app/admin-pricing-fields";
import {
  logoutAdmin,
  updateSiteSettingsAction,
} from "@/app/actions";
import { isAdminAuthenticated } from "@/lib/auth";
import { buildLangHref, getLang, text } from "@/lib/i18n";
import {
  getCars,
  getCarsByType,
  fixedInquiryEmail,
  getInquiries,
  getLocalizedCarText,
  getSiteSettings,
} from "@/lib/store";

type AdminPageProps = {
  searchParams: Promise<{
    status?: string;
    error?: string;
    lang?: string;
    nonce?: string;
  }>;
};

export default async function AdminPage({ searchParams }: AdminPageProps) {
  const params = await searchParams;
  const lang = getLang(params.lang);
  const copy = text(lang);
  const summaryFieldLabel =
    lang === "pl"
      ? "Krótki opis - widoczny na stronie głównej"
      : "Short description - visible on the homepage";
  const descriptionFieldLabel =
    lang === "pl"
      ? "Opis - po wejściu w profil auta"
      : "Description - shown after opening the car profile";

  if (!(await isAdminAuthenticated())) {
    redirect(buildLangHref("/admin/login", lang));
  }

  const [cars, exampleCars, availableCars, inquiries, settings] = await Promise.all([
    getCars(),
    getCarsByType("example"),
    getCarsByType("available"),
    getInquiries(),
    getSiteSettings(),
  ]);

  return (
    <main className="min-h-screen bg-black px-6 py-8 text-white sm:px-10 lg:px-12">
      <div className="mx-auto flex max-w-7xl flex-col gap-8">
        <section className="rounded-[2rem] border border-white/10 bg-[radial-gradient(circle_at_top,_rgba(255,255,255,0.12),_transparent_30%),linear-gradient(180deg,_#171717_0%,_#050505_100%)] p-6 shadow-[0_30px_80px_rgba(0,0,0,0.55)] sm:p-8">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div className="space-y-3">
              <div className="flex flex-wrap items-center gap-3">
                <p className="text-sm uppercase tracking-[0.35em] text-zinc-500">
                  {copy.adminPanel}
                </p>
                <LanguageSwitch currentLang={lang} path="/admin" />
              </div>
              <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
                {copy.adminTitle}
              </h1>
              <p className="max-w-2xl text-sm leading-6 text-zinc-400">
                {copy.adminBody}
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              <a
                href={buildLangHref("/", lang)}
                className="rounded-full border border-white/15 bg-white/5 px-5 py-3 text-sm font-semibold transition hover:border-white/30 hover:bg-white/10"
              >
                {lang === "pl" ? "Strona glowna" : "Home page"}
              </a>
              <form action={logoutAdmin}>
                <input type="hidden" name="lang" value={lang} />
                <button className="rounded-full border border-white/15 bg-white/5 px-5 py-3 text-sm font-semibold transition hover:border-white/30 hover:bg-white/10">
                  {copy.signOut}
                </button>
              </form>
            </div>
          </div>

          <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            <InfoCard label={copy.carsInPortfolio} value={String(cars.length)} />
            <InfoCard label={copy.savedInquiries} value={String(inquiries.length)} />
            <FixedEmailCard lang={lang} label={copy.publicEmail} value={fixedInquiryEmail} />
            <DeliveryConfigCard
              lang={lang}
              label={copy.publicWhatsapp}
              name="publicWhatsapp"
              defaultValue={settings.publicWhatsapp}
            />
          </div>

          {params.status ? (
            <div className="mt-6 rounded-2xl border border-emerald-500/20 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-200">
              {params.status === "welcome"
                ? copy.welcome
                : params.status === "car-updated"
                  ? copy.carUpdated
                  : params.status === "car-deleted"
                    ? copy.carDeleted
                    : params.status === "settings-updated"
                      ? copy.settingsUpdated
                    : copy.carAdded}
            </div>
          ) : null}

          {params.error ? (
            <div className="mt-6 rounded-2xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-200">
              {copy.missingFields}
            </div>
          ) : null}
        </section>

        <section className="grid gap-8 xl:grid-cols-[0.9fr_1.1fr]">
          <div className="rounded-[2rem] border border-white/10 bg-zinc-950/90 p-6 shadow-[0_24px_60px_rgba(0,0,0,0.45)] sm:p-8">
            <div className="space-y-3">
              <p className="text-sm uppercase tracking-[0.35em] text-zinc-500">
                {copy.addCar}
              </p>
              <h2 className="text-2xl font-semibold tracking-tight">{copy.uploadListing}</h2>
            </div>

            <form
              id="add-car-form"
              action={buildLangHref("/api/admin/create-car", lang)}
              method="post"
              encType="multipart/form-data"
              className="mt-8 space-y-4"
            >
              <input type="hidden" name="lang" value={lang} />
              <div className="rounded-[1.5rem] border border-white/10 bg-white/[0.03] p-4 sm:p-5">
                <PortfolioTypePicker
                  label={copy.portfolioType}
                  name="portfolioType"
                  defaultValue="example"
                  exampleLabel={copy.examplePortfolio}
                  availableLabel={copy.availablePortfolio}
                  lang={lang}
                />
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                <Field label={copy.carName} name="name" />
                <Field label={copy.slugLabel} name="slug" required={false} />
                <AdminPricingFields
                  formId="add-car-form"
                  lang={lang}
                  defaultPortfolioType="example"
                />
              </div>
              <TextAreaField
                label={summaryFieldLabel}
                name="summaryPl"
                rows={3}
              />
              <TextAreaField
                label={descriptionFieldLabel}
                name="descriptionPl"
                rows={5}
              />

              <div className="space-y-4 rounded-[1.5rem] border border-white/10 bg-white/[0.03] p-4 sm:p-5">
                <p className="text-sm font-medium text-zinc-300">
                  {lang === "pl" ? "Galeria zdjęć" : "Image gallery"}
                </p>

                <AdminImagePicker
                  galleryLabel={copy.chooseFromGallery}
                  cameraLabel={copy.takePhoto}
                  lang={lang}
                />
              </div>

              <div className="flex flex-col gap-3 sm:flex-row">
                <button
                  type="submit"
                  className="rounded-full bg-white px-5 py-3 text-sm font-semibold text-black transition hover:bg-zinc-200"
                >
                  {copy.saveCar}
                </button>
              </div>
            </form>
          </div>

          <div className="space-y-8">
            <section className="rounded-[2rem] border border-white/10 bg-zinc-950/90 p-6 shadow-[0_24px_60px_rgba(0,0,0,0.45)] sm:p-8">
              <div className="space-y-2">
                <p className="text-sm uppercase tracking-[0.35em] text-zinc-500">
                  {copy.currentInventory}
                </p>
                <h2 className="text-2xl font-semibold tracking-tight">{copy.portfolioCars}</h2>
              </div>

              <div className="mt-6 space-y-8">
                <AdminCarGroup
                  lang={lang}
                  title={copy.availablePortfolio}
                  description={copy.availablePortfolioBody}
                  cars={availableCars}
                  tone="available"
                  copy={copy}
                  currentStatus={params.status}
                  nonce={params.nonce}
                />
                <AdminCarGroup
                  lang={lang}
                  title={copy.examplePortfolio}
                  description={copy.examplePortfolioBody}
                  cars={exampleCars}
                  tone="example"
                  copy={copy}
                  currentStatus={params.status}
                  nonce={params.nonce}
                />
              </div>
            </section>

            <section className="rounded-[2rem] border border-white/10 bg-zinc-950/90 p-6 shadow-[0_24px_60px_rgba(0,0,0,0.45)] sm:p-8">
              <div className="flex flex-col gap-3 border-b border-white/10 pb-4 sm:flex-row sm:items-end sm:justify-between">
                <div className="space-y-2">
                  <p className="text-sm uppercase tracking-[0.35em] text-zinc-500">
                    {copy.inquiryInbox}
                  </p>
                  <h2 className="text-2xl font-semibold tracking-tight">
                    {copy.customerRequests}
                  </h2>
                </div>
                <span className="inline-flex w-fit rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-xs font-semibold uppercase tracking-[0.22em] text-zinc-300">
                  {inquiries.length}
                </span>
              </div>

              <div className="mt-6 space-y-4">
                {inquiries.length === 0 ? (
                  <div className="rounded-[1.5rem] border border-white/10 bg-white/[0.03] p-5 text-sm text-zinc-400">
                    {copy.noInquiries}
                  </div>
                ) : (
                  inquiries.map((inquiry) => (
                    <details
                      key={inquiry.id}
                      className="group rounded-[1.5rem] border border-white/10 bg-white/[0.03] p-5 open:border-white/20"
                    >
                      <summary className="cursor-pointer list-none">
                        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                          <div className="space-y-2">
                            <div className="flex flex-wrap items-center gap-2">
                              <span className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-zinc-300">
                                {inquiry.portfolioType === "available"
                                  ? copy.availablePortfolio
                                  : copy.examplePortfolio}
                              </span>
                              <span className="rounded-full border border-white/10 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-zinc-500">
                                {lang === "pl" ? "Kontakt klienta" : "Customer contact"}
                              </span>
                            </div>
                            <h3 className="text-lg font-semibold text-white">
                              {inquiry.customerName}
                            </h3>
                            <p className="text-sm text-zinc-300">
                              {lang === "pl" ? "Samochód:" : "Car:"} {inquiry.carName}
                            </p>
                          </div>
                          <div className="flex flex-col gap-2 text-left lg:items-end lg:text-right">
                            <p className="text-xs uppercase tracking-[0.3em] text-zinc-500">
                              {new Date(inquiry.createdAt).toLocaleString(
                                lang === "pl" ? "pl-PL" : "en-US",
                              )}
                            </p>
                            <span className="inline-flex rounded-full border border-white/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-zinc-300 transition group-open:border-white/25 group-open:text-white">
                              {lang === "pl" ? "Rozwiń szczegóły" : "Expand details"}
                            </span>
                          </div>
                        </div>
                      </summary>
                      <div className="mt-5 grid gap-4 border-t border-white/10 pt-5 md:grid-cols-2">
                        <div className="space-y-3 rounded-[1.25rem] border border-white/10 bg-zinc-950/60 p-4">
                          <p className="text-xs uppercase tracking-[0.24em] text-zinc-500">
                            {lang === "pl" ? "Dane klienta" : "Customer details"}
                          </p>
                          <p className="text-sm text-zinc-300">
                            <span className="text-zinc-500">
                              {lang === "pl" ? "Imię i nazwisko:" : "Full name:"}
                            </span>{" "}
                            {inquiry.customerName}
                          </p>
                          <p className="text-sm text-zinc-300">
                            <span className="text-zinc-500">Email:</span> {inquiry.email}
                          </p>
                          <p className="text-sm text-zinc-300">
                            <span className="text-zinc-500">
                              {lang === "pl" ? "Telefon:" : "Phone:"}
                            </span>{" "}
                            {inquiry.phone}
                          </p>
                        </div>
                        <div className="space-y-3 rounded-[1.25rem] border border-white/10 bg-zinc-950/60 p-4">
                          <p className="text-xs uppercase tracking-[0.24em] text-zinc-500">
                            {lang === "pl" ? "Treść zapytania" : "Inquiry message"}
                          </p>
                          <p className="text-sm text-zinc-300">
                            <span className="text-zinc-500">
                              {lang === "pl" ? "Samochód:" : "Car:"}
                            </span>{" "}
                            {inquiry.carName}
                          </p>
                          <p className="text-sm leading-6 text-zinc-300">
                            {inquiry.message || copy.noExtraMessage}
                          </p>
                        </div>
                      </div>
                      <div className="mt-4 flex flex-wrap gap-3 text-xs text-zinc-400">
                        <span className="rounded-full border border-white/10 px-3 py-1">
                          Email: {inquiry.delivery.email}
                        </span>
                        <span className="rounded-full border border-white/10 px-3 py-1">
                          WhatsApp: {inquiry.delivery.whatsapp}
                        </span>
                      </div>
                    </details>
                  ))
                )}
              </div>
            </section>
          </div>
        </section>

        <section className="grid gap-6 md:grid-cols-2">
          <InfoPanel
            title={copy.examplePortfolio}
            count={exampleCars.length}
            description={copy.examplePortfolioBody}
          />
          <InfoPanel
            title={copy.availablePortfolio}
            count={availableCars.length}
            description={copy.availablePortfolioBody}
          />
        </section>
      </div>
    </main>
  );
}

function InfoCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[1.5rem] border border-white/10 bg-white/[0.03] p-5">
      <p className="text-sm text-zinc-500">{label}</p>
      <p className="mt-2 text-2xl font-semibold text-white">{value}</p>
    </div>
  );
}

function DeliveryConfigCard({
  lang,
  label,
  name,
  defaultValue,
}: {
  lang: "pl" | "en";
  label: string;
  name: "publicWhatsapp";
  defaultValue: string;
}) {
  const currentValueLabel =
    lang === "pl"
      ? "Obecnie ustawiony WhatsApp"
      : "Currently selected WhatsApp";

  return (
    <form
      action={updateSiteSettingsAction}
      className="rounded-[1.5rem] border border-white/10 bg-white/[0.03] p-5"
    >
      <input type="hidden" name="lang" value={lang} />
      <p className="text-sm text-zinc-500">{label}</p>
      <input
        name={name}
        type="text"
        defaultValue={defaultValue}
        autoComplete="off"
        autoCorrect="off"
        autoCapitalize="off"
        spellCheck={false}
        className="mt-3 w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-medium text-white outline-none transition focus:border-white/25 focus:bg-white/8"
      />
      <div className="mt-3 flex items-center justify-between gap-3">
        <p className="text-xs text-zinc-500">
          {currentValueLabel}: <span className="text-zinc-300">{defaultValue}</span>
        </p>
        <button className="rounded-full border border-white/15 bg-white/5 px-4 py-2 text-xs font-semibold text-white transition hover:border-white/30 hover:bg-white/10">
          {lang === "pl" ? "Zapisz" : "Save"}
        </button>
      </div>
    </form>
  );
}

function PortfolioTypePicker({
  label,
  name,
  defaultValue,
  exampleLabel,
  availableLabel,
  lang,
}: {
  label: string;
  name: string;
  defaultValue: "example" | "available";
  exampleLabel: string;
  availableLabel: string;
  lang: "pl" | "en";
}) {
  return (
    <fieldset className="space-y-3">
      <legend className="text-sm font-medium text-zinc-300">{label}</legend>
      <div className="grid gap-3 lg:grid-cols-2">
        <label className="block cursor-pointer">
          <input
            type="radio"
            name={name}
            value="example"
            defaultChecked={defaultValue === "example"}
            className="peer sr-only"
          />
          <div className="flex min-h-[128px] flex-col rounded-[1.25rem] border border-white/10 bg-white/[0.02] p-5 transition peer-checked:border-white/45 peer-checked:bg-white/[0.08] peer-checked:shadow-[0_14px_34px_rgba(255,255,255,0.06),inset_0_1px_0_rgba(255,255,255,0.1)] peer-focus-visible:border-white/28 peer-focus-visible:bg-white/[0.05]">
            <p className="text-base font-semibold leading-6 text-white">{exampleLabel}</p>
            <span className="mt-auto pt-6 text-[11px] font-semibold uppercase tracking-[0.24em] text-zinc-500 peer-checked:text-white/80">
              {lang === "pl" ? "Tryb przykładowy" : "Example mode"}
            </span>
          </div>
        </label>

        <label className="block cursor-pointer">
          <input
            type="radio"
            name={name}
            value="available"
            defaultChecked={defaultValue === "available"}
            className="peer sr-only"
          />
          <div className="flex min-h-[128px] flex-col rounded-[1.25rem] border border-emerald-400/12 bg-[linear-gradient(180deg,rgba(16,185,129,0.05),rgba(255,255,255,0.015))] p-5 transition peer-checked:border-emerald-300/55 peer-checked:bg-[linear-gradient(180deg,rgba(16,185,129,0.2),rgba(6,24,20,0.55))] peer-checked:shadow-[0_18px_42px_rgba(5,150,105,0.2),inset_0_1px_0_rgba(255,255,255,0.08)] peer-focus-visible:border-emerald-300/24 peer-focus-visible:bg-[linear-gradient(180deg,rgba(16,185,129,0.08),rgba(255,255,255,0.03))]">
            <p className="text-base font-semibold leading-6 text-white">{availableLabel}</p>
            <span className="mt-auto pt-6 text-[11px] font-semibold uppercase tracking-[0.24em] text-emerald-200/75 peer-checked:text-emerald-100">
              {lang === "pl" ? "Tryb sprzedaży" : "Sale mode"}
            </span>
          </div>
        </label>
      </div>
    </fieldset>
  );
}

function AdminCarGroup({
  lang,
  title,
  description,
  cars,
  tone,
  copy,
  currentStatus,
  nonce,
}: {
  lang: "pl" | "en";
  title: string;
  description: string;
  cars: Awaited<ReturnType<typeof getCarsByType>>;
  tone: "example" | "available";
  copy: ReturnType<typeof text>;
  currentStatus?: string;
  nonce?: string;
}) {
  const isAvailable = tone === "available";

  return (
    <section
      className={`rounded-[1.5rem] border p-4 sm:p-5 ${
        isAvailable
          ? "border-emerald-400/20 bg-[linear-gradient(180deg,rgba(16,185,129,0.09),rgba(10,10,10,0.94)_22%,rgba(0,0,0,0.98)_100%)]"
          : "border-white/10 bg-white/[0.02]"
      }`}
    >
      <div
        className={`flex flex-col gap-2 border-b pb-4 sm:flex-row sm:items-end sm:justify-between ${
          isAvailable ? "border-emerald-300/15" : "border-white/8"
        }`}
      >
        <div className="space-y-1">
          <p
            className={`text-sm uppercase tracking-[0.35em] ${
              isAvailable ? "text-emerald-300/85" : "text-zinc-500"
            }`}
          >
            {title}
          </p>
          <p className="text-sm leading-6 text-zinc-400">{description}</p>
        </div>
        <span
          className={`rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] ${
            isAvailable
              ? "border-emerald-300/20 bg-emerald-400/10 text-emerald-200"
              : "border-white/10 bg-white/[0.03] text-zinc-300"
          }`}
        >
          {cars.length}
        </span>
      </div>

      <div className="mt-4 grid gap-4">
        {cars.length === 0 ? (
          <div className="rounded-[1.25rem] border border-white/10 bg-zinc-950/70 p-4 text-sm text-zinc-400">
            {lang === "pl" ? "Brak aut w tej sekcji." : "No cars in this section yet."}
          </div>
        ) : (
          cars.map((car) => (
            <AdminCarItem
              key={`${car.id}-${currentStatus ?? "idle"}-${nonce ?? "0"}`}
              car={car}
              lang={lang}
              copy={copy}
            />
          ))
        )}
      </div>
    </section>
  );
}

function AdminCarItem({
  car,
  lang,
  copy,
}: {
  car: Awaited<ReturnType<typeof getCars>>[number];
  lang: "pl" | "en";
  copy: ReturnType<typeof text>;
}) {
  const localized = getLocalizedCarText(car, lang);
  const galleryImages = localized.images.length > 0 ? localized.images : [car.image];
  const summaryFieldLabel =
    lang === "pl"
      ? "Krótki opis - widoczny na stronie głównej"
      : "Short description - visible on the homepage";
  const descriptionFieldLabel =
    lang === "pl"
      ? "Opis - po wejściu w profil auta"
      : "Description - shown after opening the car profile";

  return (
    <details className="group rounded-[1.5rem] border border-white/10 bg-white/[0.03] p-4 open:border-white/20">
      <summary className="cursor-pointer list-none">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center">
          <div className="relative aspect-[4/3] overflow-hidden rounded-[1rem] lg:w-36">
            <Image
              src={car.image}
              alt={car.name}
              fill
              sizes="144px"
              unoptimized={car.image.startsWith("data:")}
              className="object-cover"
            />
          </div>
          <div className="flex-1 space-y-2">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <h3 className="text-lg font-semibold">{car.name}</h3>
              <span className="text-sm text-zinc-300">{car.priceRange}</span>
            </div>
            <p className="text-xs uppercase tracking-[0.2em] text-zinc-500">
              {car.portfolioType === "example" ? copy.examplePortfolio : copy.availablePortfolio} |{" "}
              {car.year} | {galleryImages.length} {copy.photoCount}
            </p>
            <p className="line-clamp-2 text-sm leading-6 text-zinc-400">{localized.summary}</p>
          </div>
          <div className="self-start rounded-full border border-white/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-zinc-300 transition group-open:border-white/25 group-open:text-white">
            {copy.editCar}
          </div>
        </div>
      </summary>

      <form
        id={`edit-car-form-${car.id}`}
        action={buildLangHref("/api/admin/update-car", lang)}
        method="post"
        encType="multipart/form-data"
        className="mt-5 grid gap-4 border-t border-white/10 pt-5"
      >
          <input type="hidden" name="lang" value={lang} />
          <input type="hidden" name="id" value={car.id} />
        <div className="grid gap-4 md:grid-cols-2">
          <Field label={copy.carName} name="name" defaultValue={car.name} />
          <Field
            label={copy.slugLabel}
            name="slug"
            defaultValue={car.slug}
            required={false}
          />
          <AdminPricingFields
            formId={`edit-car-form-${car.id}`}
            lang={lang}
            defaultPortfolioType={car.portfolioType}
            defaultPrice={car.priceRange}
            defaultYear={car.year}
            defaultMileage={car.mileage}
            defaultBody={car.body}
            defaultBattery={car.battery}
            defaultRange={car.range}
          />
        </div>
        <div className="rounded-[1.5rem] border border-white/10 bg-white/[0.03] p-4 sm:p-5">
          <PortfolioTypePicker
            label={copy.portfolioType}
            name="portfolioType"
            defaultValue={car.portfolioType}
            exampleLabel={copy.examplePortfolio}
            availableLabel={copy.availablePortfolio}
            lang={lang}
          />
        </div>

        <TextAreaField
          label={summaryFieldLabel}
          name="summaryPl"
          rows={3}
          defaultValue={car.summaryPl}
        />
        <TextAreaField
          label={descriptionFieldLabel}
          name="descriptionPl"
          rows={5}
          defaultValue={car.descriptionPl}
        />

        <div className="space-y-4 rounded-[1.5rem] border border-white/10 bg-white/[0.03] p-4 sm:p-5">
          <p className="text-sm font-medium text-zinc-300">
            {lang === "pl" ? "Galeria zdjec" : "Image gallery"}
          </p>

          <AdminImagePicker
            galleryLabel={copy.chooseFromGallery}
            cameraLabel={copy.takePhoto}
            lang={lang}
            existingImages={galleryImages.map((image, index) => ({
              src: image,
              label:
                index === 0
                  ? lang === "pl"
                    ? "Zdjecie profilowe"
                    : "Main photo"
                  : `${lang === "pl" ? "Zdjecie" : "Photo"} ${index + 1}`,
              isMain: index === 0,
              index,
            }))}
          />
        </div>

        <div className="flex flex-col gap-3 sm:flex-row">
          <button
            type="submit"
            className="rounded-full bg-white px-5 py-3 text-sm font-semibold text-black transition hover:bg-zinc-200"
          >
            {copy.updateCar}
          </button>
        </div>
      </form>

      <AdminDeleteCarForm id={car.id} lang={lang} label={copy.deleteCar} />
    </details>
  );
}

function FixedEmailCard({
  lang,
  label,
  value,
}: {
  lang: "pl" | "en";
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-[1.5rem] border border-white/10 bg-white/[0.03] p-5">
      <p className="text-sm text-zinc-500">{label}</p>
      <div className="mt-3 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-medium text-white">
        {value}
      </div>
      <p className="mt-3 text-xs text-zinc-500">
        {lang === "pl"
          ? "Ten adres jest ustawiony na stale jako glowny email do zapytan."
          : "This address is fixed as the main inquiry email."}
      </p>
    </div>
  );
}

function InfoPanel({
  title,
  count,
  description,
}: {
  title: string;
  count: number;
  description: string;
}) {
  return (
    <div className="rounded-[1.5rem] border border-white/10 bg-zinc-950/90 p-5 shadow-[0_24px_60px_rgba(0,0,0,0.45)]">
      <p className="text-sm uppercase tracking-[0.3em] text-zinc-500">{title}</p>
      <p className="mt-3 text-3xl font-semibold text-white">{count}</p>
      <p className="mt-2 text-sm leading-6 text-zinc-400">{description}</p>
    </div>
  );
}

function Field({
  label,
  name,
  defaultValue,
  required = true,
}: {
  label: string;
  name: string;
  defaultValue?: string;
  required?: boolean;
}) {
  return (
    <label className="block space-y-2">
      <span className="text-sm font-medium text-zinc-300">{label}</span>
      <input
        name={name}
        type="text"
        required={required}
        defaultValue={defaultValue}
        autoComplete="off"
        autoCorrect="off"
        autoCapitalize="off"
        spellCheck={false}
        className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none transition focus:border-white/25 focus:bg-white/8"
      />
    </label>
  );
}

function TextAreaField({
  label,
  name,
  rows,
  defaultValue,
}: {
  label: string;
  name: string;
  rows: number;
  defaultValue?: string;
}) {
  return (
    <label className="block space-y-2">
      <span className="text-sm font-medium text-zinc-300">{label}</span>
      <textarea
        name={name}
        rows={rows}
        defaultValue={defaultValue}
        autoComplete="off"
        autoCorrect="off"
        autoCapitalize="off"
        spellCheck={false}
        className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none transition focus:border-white/25 focus:bg-white/8"
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
      <a
        href={buildLangHref(path, "pl")}
        className={`rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] transition ${
          currentLang === "pl" ? "bg-white text-black" : "text-zinc-300 hover:bg-white/10"
        }`}
      >
        PL
      </a>
      <a
        href={buildLangHref(path, "en")}
        className={`rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] transition ${
          currentLang === "en" ? "bg-white text-black" : "text-zinc-300 hover:bg-white/10"
        }`}
      >
        EN
      </a>
    </div>
  );
}


