import Link from "next/link";
import { buildLangHref, getLang } from "@/lib/i18n";

type CookiesPolicyPageProps = {
  searchParams: Promise<{ lang?: string }>;
};

export default async function CookiesPolicyPage({
  searchParams,
}: CookiesPolicyPageProps) {
  const params = await searchParams;
  const lang = getLang(params.lang);
  const isPl = lang === "pl";

  return (
    <main className="min-h-screen bg-black px-4 py-6 text-white sm:px-6 lg:px-12">
      <div className="mx-auto max-w-4xl">
        <section className="rounded-[1.6rem] border border-white/10 bg-zinc-950/92 p-5 shadow-[0_24px_80px_rgba(0,0,0,0.46)] sm:p-8">
          <Link
            href={buildLangHref("/", lang)}
            className="inline-flex rounded-full border border-white/12 bg-white/[0.04] px-4 py-2 text-sm font-semibold text-zinc-200 transition hover:bg-white/[0.08]"
          >
            {isPl ? "Powrót na stronę główną" : "Back to homepage"}
          </Link>

          <div className="mt-6 space-y-6">
            <div className="space-y-3">
              <p className="text-xs uppercase tracking-[0.3em] text-zinc-500">
                {isPl ? "Dokument informacyjny" : "Information notice"}
              </p>
              <h1 className="text-3xl font-semibold tracking-tight">
                {isPl ? "Polityka cookies" : "Cookies policy"}
              </h1>
              <p className="text-sm leading-7 text-zinc-300">
                {isPl
                  ? "Ta strona opisuje, w jaki sposób autojutra.pl wykorzystuje pliki cookies i podobne technologie."
                  : "This page explains how autojutra.pl uses cookies and similar technologies."}
              </p>
            </div>

            <PolicyBlock
              title={isPl ? "1. Czym są pliki cookies" : "1. What cookies are"}
              body={
                isPl
                  ? "Cookies to niewielkie informacje zapisywane na urządzeniu użytkownika podczas korzystania z serwisu. Umożliwiają one prawidłowe działanie strony, zapamiętanie niektórych ustawień oraz zwiększenie bezpieczeństwa."
                  : "Cookies are small pieces of information stored on a user device while browsing the website. They help the site operate correctly, remember selected preferences, and improve security."
              }
            />

            <PolicyBlock
              title={isPl ? "2. Jakie cookies wykorzystujemy" : "2. Which cookies we use"}
              body={
                isPl
                  ? "Obecnie serwis wykorzystuje przede wszystkim cookies techniczne i bezpieczeństwa, w tym pliki potrzebne do działania sesji logowania panelu oraz zapamiętania decyzji dotyczącej zgody cookies. Jeżeli w przyszłości zostaną dodane narzędzia analityczne, marketingowe lub zewnętrzne, polityka i baner zgody powinny zostać odpowiednio rozszerzone."
                  : "At the moment, the service mainly uses technical and security cookies, including files required for the admin login session and for remembering the cookie consent decision. If analytics, marketing, or third-party tools are added later, both this policy and the consent banner should be updated accordingly."
              }
            />

            <PolicyBlock
              title={isPl ? "3. Podstawa korzystania" : "3. Legal basis"}
              body={
                isPl
                  ? "Cookies niezbędne do działania strony są stosowane na podstawie uzasadnionego interesu administratora, polegającego na zapewnieniu poprawnego działania i bezpieczeństwa serwisu. Ewentualne cookies opcjonalne powinny być uruchamiane dopiero po uzyskaniu zgody użytkownika."
                  : "Cookies necessary for the operation of the website are used based on the controller's legitimate interest in ensuring proper functionality and security. Any optional cookies should only be activated after obtaining user consent."
              }
            />

            <PolicyBlock
              title={isPl ? "4. Jak zarządzać cookies" : "4. How to manage cookies"}
              body={
                isPl
                  ? "Użytkownik może zaakceptować lub odrzucić wybór w banerze cookies. Dodatkowo ustawienia cookies można zmieniać również w przeglądarce internetowej, blokując lub usuwając zapisane pliki."
                  : "Users can accept or reject the choice in the cookie banner. In addition, browser settings can be used to block or delete stored cookies."
              }
            />

            <PolicyBlock
              title={isPl ? "5. Kontakt" : "5. Contact"}
              body={
                isPl
                  ? "Jeżeli chcesz uzupełnić ten dokument przed publikacją, wpisz tutaj pełne dane administratora serwisu oraz adres kontaktowy do spraw związanych z prywatnością."
                  : "Before going live, replace this section with the full website controller details and a contact address for privacy-related matters."
              }
            />
          </div>
        </section>
      </div>
    </main>
  );
}

function PolicyBlock({ title, body }: { title: string; body: string }) {
  return (
    <section className="rounded-[1.1rem] border border-white/10 bg-white/[0.03] p-4 sm:p-5">
      <h2 className="text-base font-semibold text-white">{title}</h2>
      <p className="mt-3 text-sm leading-7 text-zinc-300">{body}</p>
    </section>
  );
}
