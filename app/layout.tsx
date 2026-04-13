import type { Metadata } from "next";
import { CookieConsent } from "./cookie-consent";
import "./globals.css";

export const metadata: Metadata = {
  title: "autojutra.pl",
  description: "Chińskie samochody elektryczne sprowadzane do Polski na zamówienie.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pl">
      <body className="min-h-screen bg-black text-white antialiased">
        {children}
        <CookieConsent defaultLang="pl" />
      </body>
    </html>
  );
}
