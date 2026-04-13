import Link from "next/link";
import { buildLangHref, getLang } from "@/lib/i18n";

type PrivacyPolicyPageProps = {
  searchParams: Promise<{ lang?: string }>;
};

export default async function PrivacyPolicyPage({
  searchParams,
}: PrivacyPolicyPageProps) {
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
                {isPl ? "Polityka prywatności" : "Privacy policy"}
              </h1>
              <p className="text-sm leading-7 text-zinc-300">
                {isPl
                  ? "Ten dokument opisuje, w jaki sposób autojutra.pl przetwarza dane osobowe przesyłane przez formularze kontaktowe oraz wykorzystywane przy obsłudze serwisu."
                  : "This document explains how autojutra.pl processes personal data submitted through contact forms and used to operate the service."}
              </p>
            </div>

            <PolicyBlock
              title={isPl ? "1. Administrator danych" : "1. Data controller"}
              body={
                isPl
                  ? "Przed publikacją wpisz tutaj pełne dane administratora: nazwę firmy, adres, adres e-mail, numer telefonu, NIP oraz właściwy rejestr przedsiębiorcy."
                  : "Before going live, replace this section with the full controller details: company name, address, email address, phone number, tax ID, and the relevant business register details."
              }
            />

            <PolicyBlock
              title={isPl ? "2. Zakres danych" : "2. Scope of data"}
              body={
                isPl
                  ? "Formularz kontaktowy może obejmować imię i nazwisko, adres e-mail, numer telefonu oraz treść wiadomości. Dane te są przekazywane dobrowolnie przez użytkownika."
                  : "The contact form may include full name, email address, phone number, and the content of the message. This data is provided voluntarily by the user."
              }
            />

            <PolicyBlock
              title={isPl ? "3. Cel i podstawa przetwarzania" : "3. Purpose and legal basis"}
              body={
                isPl
                  ? "Dane są przetwarzane w celu obsługi zapytania o samochód, kontaktu handlowego, przygotowania kalkulacji oraz prowadzenia korespondencji związanej z ofertą. Podstawą przetwarzania jest podjęcie działań na żądanie osoby, której dane dotyczą, przed zawarciem umowy oraz prawnie uzasadniony interes administratora polegający na obsłudze komunikacji z klientami."
                  : "Data is processed in order to handle a vehicle inquiry, make business contact, prepare a quotation, and maintain communication related to the offer. The legal basis is taking steps at the request of the data subject prior to entering into a contract and the controller's legitimate interest in handling customer communication."
              }
            />

            <PolicyBlock
              title={isPl ? "4. Odbiorcy danych" : "4. Data recipients"}
              body={
                isPl
                  ? "Dane mogą być przekazywane podmiotom wspierającym obsługę techniczną strony, hostingu, poczty elektronicznej oraz narzędzi komunikacyjnych wykorzystywanych do odpowiedzi na zapytanie. Zakres udostępnienia powinien być ograniczony do niezbędnego minimum."
                  : "Data may be shared with entities supporting website hosting, email delivery, and communication tools used to respond to the inquiry. Any disclosure should be limited to what is strictly necessary."
              }
            />

            <PolicyBlock
              title={isPl ? "5. Prawa użytkownika" : "5. User rights"}
              body={
                isPl
                  ? "Osobie, której dane dotyczą, przysługuje prawo dostępu do danych, ich sprostowania, usunięcia, ograniczenia przetwarzania, wniesienia sprzeciwu oraz złożenia skargi do właściwego organu nadzorczego. Przed publikacją warto uzupełnić tę sekcję o konkretne dane kontaktowe do realizacji tych praw."
                  : "Data subjects have the right to access, rectify, erase, restrict processing, object, and lodge a complaint with the competent supervisory authority. Before publication, it is worth adding the exact contact details for exercising these rights."
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
