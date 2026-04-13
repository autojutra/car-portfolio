import Link from "next/link";
import { buildLangHref, type Lang } from "@/lib/i18n";

export function SiteFooter({ lang }: { lang: Lang }) {
  const isPl = lang === "pl";

  return (
    <footer className="rounded-[1.35rem] border border-white/10 bg-zinc-950/90 p-4 text-zinc-300 shadow-[0_18px_48px_rgba(0,0,0,0.42)] sm:p-6">
      <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
        <section className="space-y-3">
          <h3 className="text-sm font-semibold uppercase tracking-[0.28em] text-zinc-500">
            {isPl ? "Informacje prawne" : "Legal information"}
          </h3>
          <p className="text-sm leading-6">
            {isPl
              ? "Serwis ma charakter informacyjny i prezentuje auta przykładowe oraz dostępne. Treści na stronie nie stanowią oferty w rozumieniu art. 66 § 1 Kodeksu cywilnego, chyba że zostanie to wyraźnie potwierdzone odrębnie."
              : "This website is informational in nature and presents example and available vehicles. Content published here does not constitute an offer within the meaning of Article 66 § 1 of the Polish Civil Code unless explicitly confirmed separately."}
          </p>
          <p className="text-sm leading-6">
            {isPl
              ? "Przetwarzanie danych z formularza kontaktowego, informacje o cookies i obowiązki informacyjne opisaliśmy w osobnych dokumentach poniżej. Przed publikacją uzupełnij te dokumenty o pełne dane firmy i administratora."
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
              {isPl ? "Polityka prywatności" : "Privacy policy"}
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
              ? "Nazwy marek, modeli i znaki towarowe należą do ich właścicieli. Układ strony i treści autorskie serwisu są zastrzeżone dla właściciela strony."
              : "Brand names, model names, and trademarks belong to their respective owners. The site layout and original website copy are reserved for the site owner."}
          </p>
        </section>
      </div>

      <details className="mt-6 rounded-[1rem] border border-white/10 bg-white/[0.03] p-4">
        <summary className="cursor-pointer list-none text-sm font-semibold text-white">
          {isPl ? "Źródła zdjęć demonstracyjnych" : "Demonstration photo sources"}
        </summary>
        <div className="mt-4 grid gap-2 text-sm text-zinc-400">
          <a
            href="https://commons.wikimedia.org/wiki/Special:FilePath/BYD%20Dolphin%20184102.jpg"
            className="hover:text-white"
          >
            BYD Dolphin
          </a>
          <a
            href="https://commons.wikimedia.org/wiki/Special:FilePath/BYD%20Atto%203.jpg"
            className="hover:text-white"
          >
            BYD Atto 3
          </a>
          <a
            href="https://commons.wikimedia.org/wiki/Special:FilePath/MG4%20Electric%20%E2%80%93%20f%2021042025.jpg"
            className="hover:text-white"
          >
            MG4 Electric
          </a>
          <a
            href="https://commons.wikimedia.org/wiki/Special:FilePath/XPeng%20G6%20(2023)%20DSC%201247.jpg"
            className="hover:text-white"
          >
            XPeng G6
          </a>
          <a
            href="https://commons.wikimedia.org/wiki/Special:FilePath/NIO%20ET5%20(2024).jpg"
            className="hover:text-white"
          >
            NIO ET5
          </a>
          <a
            href="https://commons.wikimedia.org/wiki/Special:FilePath/Li%20Auto%20L7%20008.jpg"
            className="hover:text-white"
          >
            Li Auto L7
          </a>
          <a
            href="https://commons.wikimedia.org/wiki/Special:FilePath/XPeng%20G6%20018.jpg"
            className="hover:text-white"
          >
            XPeng G6 available
          </a>
        </div>
      </details>

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
