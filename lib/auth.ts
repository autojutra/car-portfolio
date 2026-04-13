import { createHmac, timingSafeEqual } from "node:crypto";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { cookies } from "next/headers";

const sessionCookieName = "autojutra-admin";
const loginAttemptsFile = path.join(process.cwd(), "data", "login-attempts.json");
const maxLoginAttempts = 3;
const lockoutWindowMs = 30 * 60 * 1000;

type LoginAttemptRecord = {
  failedAttempts: number;
  lockedUntil?: string;
};

type LoginAttemptsStore = {
  records: Record<string, LoginAttemptRecord>;
};

function getCredentials() {
  return {
    username: process.env.ADMIN_USERNAME ?? "handel.polaris",
    password: process.env.ADMIN_PASSWORD ?? "hpolaris231$",
    secret: process.env.ADMIN_SESSION_SECRET ?? "change-this-secret",
  };
}

function sign(value: string) {
  const { secret } = getCredentials();
  return createHmac("sha256", secret).update(value).digest("hex");
}

async function ensureLoginAttemptsStore() {
  await mkdir(path.dirname(loginAttemptsFile), { recursive: true });
  try {
    await readFile(loginAttemptsFile, "utf8");
  } catch {
    const initial: LoginAttemptsStore = { records: {} };
    await writeFile(loginAttemptsFile, JSON.stringify(initial, null, 2), "utf8");
  }
}

async function readLoginAttemptsStore() {
  await ensureLoginAttemptsStore();
  return JSON.parse(
    await readFile(loginAttemptsFile, "utf8"),
  ) as LoginAttemptsStore;
}

async function writeLoginAttemptsStore(store: LoginAttemptsStore) {
  await writeFile(loginAttemptsFile, JSON.stringify(store, null, 2), "utf8");
}

function getAttemptKey(username: string, clientIp: string) {
  const normalizedIp = clientIp.trim();
  if (normalizedIp && normalizedIp !== "unknown") {
    return normalizedIp;
  }
  return username.trim().toLowerCase() || "unknown";
}

function verifyToken(token?: string) {
  if (!token) return false;
  const separatorIndex = token.lastIndexOf(".");
  if (separatorIndex <= 0 || separatorIndex === token.length - 1) return false;
  const username = token.slice(0, separatorIndex);
  const signature = token.slice(separatorIndex + 1);
  const expected = sign(username);
  if (signature.length !== expected.length) return false;
  return timingSafeEqual(Buffer.from(signature), Buffer.from(expected));
}

export async function isAdminAuthenticated() {
  const store = await cookies();
  return verifyToken(store.get(sessionCookieName)?.value);
}

export async function verifyAdminLogin(username: string, password: string) {
  const configured = getCredentials();
  return username === configured.username && password === configured.password;
}

export async function getAdminLoginLock(username: string, clientIp: string) {
  const store = await readLoginAttemptsStore();
  const key = getAttemptKey(username, clientIp);
  const record = store.records[key];
  if (!record?.lockedUntil) {
    return null;
  }

  const lockedUntilTime = new Date(record.lockedUntil).getTime();
  if (Number.isNaN(lockedUntilTime) || lockedUntilTime <= Date.now()) {
    delete store.records[key];
    await writeLoginAttemptsStore(store);
    return null;
  }

  return new Date(lockedUntilTime);
}

export async function registerAdminLoginFailure(username: string, clientIp: string) {
  const store = await readLoginAttemptsStore();
  const key = getAttemptKey(username, clientIp);
  const current = store.records[key];

  if (current?.lockedUntil && new Date(current.lockedUntil).getTime() > Date.now()) {
    return new Date(current.lockedUntil);
  }

  const failedAttempts = (current?.failedAttempts ?? 0) + 1;
  const record: LoginAttemptRecord = { failedAttempts };

  if (failedAttempts >= maxLoginAttempts) {
    record.lockedUntil = new Date(Date.now() + lockoutWindowMs).toISOString();
  }

  store.records[key] = record;
  await writeLoginAttemptsStore(store);
  return record.lockedUntil ? new Date(record.lockedUntil) : null;
}

export async function clearAdminLoginFailures(username: string, clientIp: string) {
  const store = await readLoginAttemptsStore();
  const key = getAttemptKey(username, clientIp);
  if (store.records[key]) {
    delete store.records[key];
    await writeLoginAttemptsStore(store);
  }
}

export async function createAdminSession() {
  const store = await cookies();
  setAdminSessionCookie(store);
}

export async function clearAdminSession() {
  const store = await cookies();
  store.delete(sessionCookieName);
}

export function setAdminSessionCookie(store: {
  set: (
    name: string,
    value: string,
    options: {
      httpOnly: boolean;
      path: string;
      sameSite: "lax";
      secure: boolean;
      maxAge: number;
    },
  ) => void;
}) {
  const username = getCredentials().username;
  store.set(sessionCookieName, `${username}.${sign(username)}`, {
    httpOnly: true,
    path: "/",
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: 60 * 60 * 12,
  });
}
