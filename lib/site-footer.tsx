import Link from "next/link";
import { buildLangHref, type Lang } from "@/lib/i18n";
import { getSiteSettings } from "@/lib/store";

export async function SiteFooter({ lang }: { lang: Lang }) {
  const isPl = lang === "pl";
  const settings = await getSiteSettings();

  return (
    <footer className="rounded-[1.35rem] border border-white/10 bg-zinc-950/90 p-4 text-zinc-300 shadow-[0_18px_48px_rgba(0,0,0,0.42)] sm:p-6">
      <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
        <section className="space-y-3">
          <h3 className="text-sm font-semibold uppercase tracking-[0.28em] text-zinc-500">
            {isPl ? "Informacje prawne" : "Legal information"}
          </h3>
          <p className="text-sm leading-6">
            {isPl
              ? "Serwis ma charakter informacyjny i prezentuje auta przykladowe oraz dostepne. Tresci na stronie nie stanowia oferty w rozumieniu art. 66 § 1 Kodeksu cywilnego, chyba ze zostanie to wyraznie potwierdzone odrebnie."
              : "This website is informational in nature and presents example and available vehicles. Content published here does not constitute an offer within the meaning of Article 66 § 1 of the Polish Civil Code unless explicitly confirmed separately."}
          </p>
          <p className="text-sm leading-6">
            {isPl
              ? "Przetwarzanie danych z formularza kontaktowego, informacje o cookies i obowiazki informacyjne opisalismy w osobnych dokumentach ponizej. Przed publikacja uzupelnij te dokumenty o pelne dane firmy i administratora."
              : "Contact form data processing, cookie information, and information duties are described in the documents below. Before going live, complete them with the full company and controller details."}
          </p>
        </section>

        <section className="space-y-3">
          <h3 className="text-sm font-semibold uppercase tracking-[0.28em] text-zinc-500">
            {isPl ? "Dokumenty" : "Documents"}
          </h3>
          <div className="flex flex-col gap-3">
            <Link
              href={buildLangHref("/polityka-prywatnosci", lang)}
              className="inline-flex w-fit rounded-full border border-white/12 bg-white/[0.04] px-4 py-2 text-sm font-semibold text-white transition hover:bg-white/[0.08]"
            >
              {isPl ? "Polityka prywatnosci" : "Privacy policy"}
            </Link>
            <Link
              href={buildLangHref("/polityka-cookies", lang)}
              className="inline-flex w-fit rounded-full border border-white/12 bg-white/[0.04] px-4 py-2 text-sm font-semibold text-white transition hover:bg-white/[0.08]"
            >
              {isPl ? "Polityka cookies" : "Cookies policy"}
            </Link>
          </div>
          <p className="text-sm leading-6 text-zinc-400">
            {isPl
              ? "Nazwy marek, modeli i znaki towarowe naleza do ich wlascicieli. Uklad strony i tresci autorskie serwisu sa zastrzezone dla wlasciciela strony."
              : "Brand names, model names, and trademarks belong to their respective owners. The site layout and original website copy are reserved for the site owner."}
          </p>
        </section>
      </div>

      <section className="mt-6 rounded-[1rem] border border-white/10 bg-white/[0.03] p-4">
        <h3 className="text-sm font-semibold uppercase tracking-[0.28em] text-zinc-500">
          {isPl ? "Kontakt telefoniczny" : "Phone contact"}
        </h3>
        <p className="mt-3 text-sm leading-6 text-zinc-400">
          {isPl
            ? "Jesli wolisz szybki kontakt telefoniczny, zadzwon bezposrednio."
            : "If you prefer a quick phone conversation, call directly."}
        </p>
        <a
          href={`tel:${settings.publicPhone.replace(/[^\d+]/g, "")}`}
          className="mt-4 inline-flex rounded-full border border-white/12 bg-white/[0.04] px-4 py-2 text-base font-semibold text-white transition hover:bg-white/[0.08]"
        >
          {settings.publicPhone}
        </a>
      </section>

      <div className="mt-6 flex justify-end">
        <Link
          href={buildLangHref("/admin/login", lang)}
          className="text-[10px] uppercase tracking-[0.24em] text-zinc-700 transition hover:text-zinc-500"
        >
          Login
        </Link>
      </div>
    </footer>
  );
}
