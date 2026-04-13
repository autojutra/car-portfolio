import { NextResponse } from "next/server";
import { buildLangHref, getLang } from "@/lib/i18n";
import {
  clearAdminLoginFailures,
  getAdminLoginLock,
  setAdminSessionCookie,
  verifyAdminLogin,
  registerAdminLoginFailure,
} from "@/lib/auth";

function buildLoginRedirect(request: Request, lang: "pl" | "en", params: Record<string, string>) {
  const url = new URL("/admin/login", request.url);
  url.searchParams.set("lang", lang);
  for (const [key, value] of Object.entries(params)) {
    url.searchParams.set(key, value);
  }
  return NextResponse.redirect(url, 303);
}

export async function POST(request: Request) {
  const formData = await request.formData();
  const username = String(
    formData.get("adminLoginId") ?? formData.get("username") ?? "",
  ).trim();
  const password = String(
    formData.get("adminLoginSecret") ?? formData.get("password") ?? "",
  );
  const lang = getLang(String(formData.get("lang") ?? ""));
  const clientIp =
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    request.headers.get("x-real-ip")?.trim() ??
    "unknown";

  const lockedUntil = await getAdminLoginLock(username, clientIp);
  if (lockedUntil) {
    return buildLoginRedirect(request, lang, {
      error: "locked",
      lockedUntil: lockedUntil.toISOString(),
    });
  }

  if (!(await verifyAdminLogin(username, password))) {
    const nextLock = await registerAdminLoginFailure(username, clientIp);
    return buildLoginRedirect(request, lang, {
      error: nextLock ? "locked" : "invalid",
      ...(nextLock ? { lockedUntil: nextLock.toISOString() } : {}),
    });
  }

  await clearAdminLoginFailures(username, clientIp);

  const response = NextResponse.redirect(
    new URL(buildLangHref("/admin?status=welcome", lang), request.url),
    303,
  );
  setAdminSessionCookie(response.cookies);
  return response;
}
