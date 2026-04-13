"use client";

import { useFormStatus } from "react-dom";

export function AdminSubmitButton({
  idleLabel,
  pendingLabel,
  fullWidth = false,
}: {
  idleLabel: string;
  pendingLabel: string;
  fullWidth?: boolean;
}) {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      className={`${fullWidth ? "w-full justify-center" : ""} inline-flex items-center rounded-full bg-white px-5 py-3 text-sm font-semibold text-black transition hover:bg-zinc-200 disabled:cursor-not-allowed disabled:bg-zinc-300`}
    >
      {pending ? pendingLabel : idleLabel}
    </button>
  );
}
