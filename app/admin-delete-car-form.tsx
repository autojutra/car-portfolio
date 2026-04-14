"use client";

import { useRef, useState } from "react";
import { deleteCarAction } from "@/app/actions";

type AdminDeleteCarFormProps = {
  id: string;
  lang: "pl" | "en";
  label: string;
};

export function AdminDeleteCarForm({
  id,
  lang,
  label,
}: AdminDeleteCarFormProps) {
  const formRef = useRef<HTMLFormElement>(null);
  const confirmedRef = useRef(false);
  const [open, setOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const title =
    lang === "pl" ? "Usunac auto?" : "Delete car?";
  const message =
    lang === "pl"
      ? "Tej operacji nie da sie cofnac. Czy na pewno chcesz usunac to auto z oferty?"
      : "This action cannot be undone. Are you sure you want to delete this car from the offer?";
  const cancelLabel = lang === "pl" ? "Anuluj" : "Cancel";
  const confirmLabel = lang === "pl" ? "Usun auto" : "Delete car";

  return (
    <>
      <form
        ref={formRef}
        action={deleteCarAction}
        className="mt-3"
        onSubmit={(event) => {
          if (confirmedRef.current) {
            return;
          }

          event.preventDefault();
          setOpen(true);
        }}
      >
        <input type="hidden" name="lang" value={lang} />
        <input type="hidden" name="id" value={id} />
        <button
          type="submit"
          disabled={submitting}
          className="rounded-full border border-red-500/30 bg-red-500/10 px-5 py-3 text-sm font-semibold text-red-200 transition hover:border-red-400/50 hover:bg-red-500/20 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {submitting ? (lang === "pl" ? "Usuwanie..." : "Deleting...") : label}
        </button>
      </form>

      {open ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/65 px-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-[1.5rem] border border-white/10 bg-[linear-gradient(180deg,_#161616_0%,_#0a0a0a_100%)] p-6 text-white shadow-[0_30px_80px_rgba(0,0,0,0.55)]">
            <p className="text-xs uppercase tracking-[0.35em] text-zinc-500">autojutra.pl</p>
            <h3 className="mt-4 text-2xl font-semibold tracking-tight">{title}</h3>
            <p className="mt-3 text-sm leading-7 text-zinc-300">{message}</p>
            <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="inline-flex min-w-28 items-center justify-center rounded-full border border-white/10 bg-white/[0.04] px-5 py-3 text-sm font-semibold text-zinc-200 transition hover:border-white/20 hover:bg-white/[0.08] hover:text-white"
              >
                {cancelLabel}
              </button>
              <button
                type="button"
                onClick={() => {
                  confirmedRef.current = true;
                  setSubmitting(true);
                  setOpen(false);
                  formRef.current?.requestSubmit();
                }}
                className="inline-flex min-w-28 items-center justify-center rounded-full bg-white px-5 py-3 text-sm font-semibold text-black transition hover:bg-zinc-200"
              >
                {confirmLabel}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
