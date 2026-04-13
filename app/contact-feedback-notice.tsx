"use client";

import { useEffect } from "react";

export function ContactFeedbackNotice({
  message,
  className,
}: {
  message: string;
  className: string;
}) {
  useEffect(() => {
    const url = new URL(window.location.href);
    if (!url.searchParams.has("contact")) {
      return;
    }

    url.searchParams.delete("contact");
    const search = url.searchParams.toString();
    const nextUrl = `${url.pathname}${search ? `?${search}` : ""}${url.hash}`;
    window.history.replaceState(null, "", nextUrl);
  }, []);

  return <div className={className}>{message}</div>;
}
