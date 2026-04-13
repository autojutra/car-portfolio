import { redirect } from "next/navigation";
import { isAdminAuthenticated } from "@/lib/auth";
import { buildLangHref, getLang, text } from "@/lib/i18n";

type LoginPageProps = {
  searchParams: Promise<{
    error?: string;
    lockedUntil?: string;
    status?: string;
    lang?: string;
  }>;
};

export default async function AdminLoginPage({ searchParams }: LoginPageProps) {
  const params = await searchParams;
  const lang = getLang(params.lang);
  const copy = text(lang);

  if (await isAdminAuthenticated()) {
    redirect(buildLangHref("/admin", lang));
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-black px-4 py-6 text-white sm:px-10 sm:py-10">
      <div className="mx-auto flex w-full max-w-6xl items-center justify-center">
        <div className="grid w-full overflow-hidden rounded-[2rem] border border-white/10 bg-zinc-950 shadow-[0_30px_80px_rgba(0,0,0,0.55)] lg:grid-cols-[1.05fr_0.95fr]">
          <section className="hidden bg-[radial-gradient(circle_at_top,_rgba(255,255,255,0.18),_transparent_30%),linear-gradient(180deg,_#1c1c1c_0%,_#050505_100%)] lg:block" />

          <section className="p-6 sm:p-10">
            <div className="mx-auto flex max-w-md flex-col justify-center gap-8">
              <div className="flex items-start justify-between gap-4">
                <p className="text-sm uppercase tracking-[0.35em] text-zinc-500">
                  autojutra.pl
                </p>
                <LanguageSwitch currentLang={lang} path="/admin/login" />
              </div>

              <div className="space-y-3">
                <h2 className="text-3xl font-semibold tracking-tight">
                  {copy.login}
                </h2>
              </div>

              {params.error ? (
                <div className="rounded-2xl border border-red-500/25 bg-red-500/10 px-4 py-3 text-sm text-red-200">
                  {params.error === "locked"
                    ? copy.loginLocked
                    : copy.invalidCredentials}
                </div>
              ) : null}

              {params.status === "logout" ? (
                <div className="rounded-2xl border border-emerald-500/25 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-200">
                  {copy.loggedOut}
                </div>
              ) : null}

              <form action="/api/admin/login" method="post" className="space-y-5" autoComplete="off">
                <input type="hidden" name="lang" value={lang} />
                <input
                  type="text"
                  name="fake_username"
                  tabIndex={-1}
                  autoComplete="username"
                  className="hidden"
                  aria-hidden="true"
                />
                <input
                  type="password"
                  name="fake_password"
                  tabIndex={-1}
                  autoComplete="current-password"
                  className="hidden"
                  aria-hidden="true"
                />

                <label className="block space-y-2">
                  <span className="text-sm font-medium text-zinc-300">{copy.login}</span>
                  <input
                    name="adminLoginId"
                    type="text"
                    required
                    autoComplete="off"
                    enterKeyHint="next"
                    autoCorrect="off"
                    autoCapitalize="none"
                    spellCheck={false}
                    inputMode="text"
                    className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none transition focus:border-white/25 focus:bg-white/8"
                  />
                </label>

                <label className="block space-y-2">
                  <span className="text-sm font-medium text-zinc-300">{copy.password}</span>
                  <input
                    name="adminLoginSecret"
                    type="password"
                    required
                    autoComplete="new-password"
                    enterKeyHint="go"
                    autoCorrect="off"
                    autoCapitalize="none"
                    spellCheck={false}
                    className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none transition focus:border-white/25 focus:bg-white/8"
                  />
                </label>

                <button className="w-full rounded-full bg-white px-6 py-3 text-sm font-semibold text-black transition hover:bg-zinc-200">
                  {copy.openAdminPanel}
                </button>
              </form>

              <a
                href={buildLangHref("/", lang)}
                className="text-sm text-zinc-400 transition hover:text-white"
              >
                ← autojutra.pl
              </a>
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}

function LanguageSwitch({
  currentLang,
  path,
}: {
  currentLang: "pl" | "en";
  path: string;
}) {
  return (
    <div className="inline-flex rounded-full border border-white/15 bg-white/5 p-1">
      <a
        href={buildLangHref(path, "pl")}
        className={`rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] transition ${
          currentLang === "pl" ? "bg-white text-black" : "text-zinc-300 hover:bg-white/10"
        }`}
      >
        PL
      </a>
      <a
        href={buildLangHref(path, "en")}
        className={`rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] transition ${
          currentLang === "en" ? "bg-white text-black" : "text-zinc-300 hover:bg-white/10"
        }`}
      >
        EN
      </a>
    </div>
  );
}


