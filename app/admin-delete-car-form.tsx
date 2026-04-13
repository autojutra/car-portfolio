"use client";

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
  const confirmMessage =
    lang === "pl"
      ? "Czy na pewno chcesz usunac to auto?"
      : "Are you sure you want to delete this car?";

  return (
    <form
      action={deleteCarAction}
      className="mt-3"
      onSubmit={(event) => {
        if (!window.confirm(confirmMessage)) {
          event.preventDefault();
        }
      }}
    >
      <input type="hidden" name="lang" value={lang} />
      <input type="hidden" name="id" value={id} />
      <button className="rounded-full border border-red-500/30 bg-red-500/10 px-5 py-3 text-sm font-semibold text-red-200 transition hover:border-red-400/50 hover:bg-red-500/20">
        {label}
      </button>
    </form>
  );
}
