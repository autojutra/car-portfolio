"use client";

import { useEffect, useState } from "react";

export function ContactFeedbackModal({
  title,
  message,
  buttonLabel,
}: {
  title: string;
  message: string;
  buttonLabel: string;
}) {
  const [open, setOpen] = useState(true);

  useEffect(() => {
    if (!open) {
      return;
    }

    const url = new URL(window.location.href);
    if (!url.searchParams.has("contact")) {
      return;
    }

    url.searchParams.delete("contact");
    const search = url.searchParams.toString();
    const nextUrl = `${url.pathname}${search ? `?${search}` : ""}${url.hash}`;
    window.history.replaceState(null, "", nextUrl);
  }, [open]);

  useEffect(() => {
    if (!open) {
      return;
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [open]);

  if (!open) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/65 px-4 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-[1.5rem] border border-white/10 bg-[linear-gradient(180deg,_#161616_0%,_#0a0a0a_100%)] p-6 text-white shadow-[0_30px_80px_rgba(0,0,0,0.55)]">
        <p className="text-xs uppercase tracking-[0.35em] text-zinc-500">autojutra.pl</p>
        <h3 className="mt-4 text-2xl font-semibold tracking-tight">{title}</h3>
        <p className="mt-3 text-sm leading-7 text-zinc-300">{message}</p>
        <button
          type="button"
          onClick={() => setOpen(false)}
          className="mt-6 inline-flex min-w-28 items-center justify-center rounded-full bg-white px-5 py-3 text-sm font-semibold text-black transition hover:bg-zinc-200"
        >
          {buttonLabel}
        </button>
      </div>
    </div>
  );
}
