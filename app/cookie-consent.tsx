"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { buildLangHref, type Lang } from "@/lib/i18n";

const STORAGE_KEY = "autojutra-cookie-consent";
const COOKIE_NAME = "autojutra_cookie_consent";
const COOKIE_MAX_AGE = 60 * 60 * 24 * 365;

function persistConsent(value: "accepted" | "rejected") {
  if (typeof window !== "undefined") {
    window.localStorage.setItem(STORAGE_KEY, value);
  }

  document.cookie = `${COOKIE_NAME}=${value}; Max-Age=${COOKIE_MAX_AGE}; Path=/; SameSite=Lax`;
}

export function CookieConsent({ defaultLang = "pl" }: { defaultLang?: Lang }) {
  const [visible, setVisible] = useState(false);
  const [lang, setLang] = useState<Lang>(defaultLang);

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => {
      const saved = window.localStorage.getItem(STORAGE_KEY);
      const currentLang = new URLSearchParams(window.location.search).get("lang");

      setLang(currentLang === "en" ? "en" : defaultLang);

      if (!saved) {
        setVisible(true);
      }
    });

    return () => window.cancelAnimationFrame(frame);
  }, [defaultLang]);

  if (!visible) {
    return null;
  }

  const isPl = lang === "pl";

  return (
    <div className="fixed inset-x-3 bottom-3 z-50 sm:inset-x-auto sm:bottom-6 sm:right-6 sm:max-w-xl">
      <div className="rounded-[1.35rem] border border-white/12 bg-zinc-950/96 p-4 shadow-[0_24px_80px_rgba(0,0,0,0.5)] backdrop-blur">
        <div className="space-y-3">
          <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-zinc-500">
            {isPl ? "Pliki cookies" : "Cookies"}
          </p>
          <h2 className="text-lg font-semibold tracking-tight text-white">
            {isPl ? "Ustawienia cookies" : "Cookie settings"}
          </h2>
          <p className="text-sm leading-6 text-zinc-300">
            {isPl
              ? "Używamy plików cookies niezbędnych do działania serwisu oraz bezpieczeństwa. Możesz zaakceptować ich użycie lub odmówić zgody na dodatkowe kategorie, jeśli pojawią się w przyszłości."
              : "We use cookies necessary for site operation and security. You can accept their use or decline consent for any optional categories that may be added in the future."}
          </p>
          <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap">
            <button
              type="button"
              onClick={() => {
                persistConsent("accepted");
                setVisible(false);
              }}
              className="rounded-full bg-white px-4 py-2.5 text-sm font-semibold text-black transition hover:bg-zinc-200"
            >
              {isPl ? "Akceptuję" : "Accept"}
            </button>
            <button
              type="button"
              onClick={() => {
                persistConsent("rejected");
                setVisible(false);
              }}
              className="rounded-full border border-white/12 bg-white/[0.04] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-white/[0.08]"
            >
              {isPl ? "Odrzucam" : "Reject"}
            </button>
            <Link
              href={buildLangHref("/polityka-cookies", lang)}
              className="rounded-full border border-transparent px-2 py-2.5 text-sm font-semibold text-zinc-300 transition hover:text-white"
            >
              {isPl ? "Czytaj politykę cookies" : "Read cookies policy"}
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
