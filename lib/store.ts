import { randomUUID } from "node:crypto";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { defaultCars, type BaseCarRecord } from "@/lib/cars";
import type { Lang } from "@/lib/i18n";

export type CarRecord = BaseCarRecord & {
  id: string;
  createdAt: string;
};

export type InquiryRecord = {
  id: string;
  carSlug: string;
  carName: string;
  portfolioType: "example" | "available";
  customerName: string;
  email: string;
  phone: string;
  message: string;
  createdAt: string;
  delivery: {
    email: string;
    whatsapp: string;
  };
};

export type SiteSettings = {
  publicEmail: string;
  publicPhone: string;
  publicWhatsapp: string;
};

export const fixedInquiryEmail = "kontakt@autojutra.pl";

type AppStore = {
  cars: CarRecord[];
  inquiries: InquiryRecord[];
  settings: SiteSettings;
};

const maxCarImages = 10;
const maxInquiries = 10;

const storeFile = path.join(process.cwd(), "data", "portfolio.json");
const uploadDir = path.join(process.cwd(), "public", "uploads");

const defaultStore: AppStore = {
  cars: defaultCars.map((car, index) => ({
    id: `seed-${index + 1}`,
    createdAt: new Date(Date.UTC(2026, 3, 9, 10, index, 0)).toISOString(),
    ...car,
  })),
  inquiries: [],
  settings: {
    publicEmail: fixedInquiryEmail,
    publicPhone: "+48 500 000 000",
    publicWhatsapp: "+48 500 000 000",
  },
};

async function ensureStore() {
  await mkdir(path.dirname(storeFile), { recursive: true });
  try {
    await readFile(storeFile, "utf8");
  } catch {
    await writeFile(storeFile, JSON.stringify(defaultStore, null, 2), "utf8");
  }
}

async function readStore(): Promise<AppStore> {
  await ensureStore();
  const store = JSON.parse(await readFile(storeFile, "utf8")) as AppStore;
  return {
    ...store,
    cars: store.cars.map((car) => normalizeCarRecord(car)),
    inquiries: [...(store.inquiries ?? [])]
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
      .slice(0, maxInquiries),
    settings: {
      ...defaultStore.settings,
      ...store.settings,
      publicEmail: fixedInquiryEmail,
    },
  };
}

async function writeStore(store: AppStore) {
  await writeFile(storeFile, JSON.stringify(store, null, 2), "utf8");
}

export async function getCars() {
  const store = await readStore();
  return [...store.cars].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export async function getCarsByType(type: "example" | "available") {
  const cars = await getCars();
  return cars.filter((car) => car.portfolioType === type);
}

export async function getCarBySlug(slug: string) {
  const store = await readStore();
  return store.cars.find((car) => car.slug === slug);
}

export async function getInquiries() {
  const store = await readStore();
  return [...store.inquiries]
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
    .slice(0, maxInquiries);
}

export async function getSiteSettings() {
  const store = await readStore();
  return store.settings;
}

export async function updateSiteSettings(input: Partial<SiteSettings>) {
  const store = await readStore();
  store.settings = {
    ...store.settings,
    ...input,
  };
  await writeStore(store);
  return store.settings;
}

export async function createCar(input: {
  portfolioType: "example" | "available";
  name: string;
  slug?: string;
  priceRange: string;
  year: string;
  mileage?: string;
  summaryPl: string;
  summaryEn: string;
  descriptionPl: string;
  descriptionEn: string;
  highlightsPl: string[];
  highlightsEn: string[];
  battery: string;
  range: string;
  body: string;
  images: string[];
}) {
  const store = await readStore();
  const baseSlug = slugify(input.slug || input.name);
  const uniqueSlug = ensureUniqueSlug(baseSlug, store.cars.map((car) => car.slug));
  const images = normalizeImageList(input.images);

  const car: CarRecord = {
    id: randomUUID(),
    slug: uniqueSlug,
    createdAt: new Date().toISOString(),
    ...input,
    image: images[0] ?? "",
    images,
  };

  store.cars.unshift(car);
  await writeStore(store);
  return car;
}

export async function updateCar(
  id: string,
  input: Partial<
    Omit<CarRecord, "id" | "createdAt" | "slug"> & {
      slug?: string;
    }
  >,
) {
  const store = await readStore();
  const index = store.cars.findIndex((car) => car.id === id);
  if (index === -1) {
    throw new Error("Car not found.");
  }

  const current = store.cars[index];
  const requestedSlug = input.slug ? slugify(input.slug) : current.slug;
  const uniqueSlug =
    requestedSlug === current.slug
      ? current.slug
      : ensureUniqueSlug(
          requestedSlug,
          store.cars.filter((car) => car.id !== id).map((car) => car.slug),
        );

  const updated: CarRecord = {
    ...current,
    ...input,
    mileage: input.mileage ?? current.mileage ?? "",
    image:
      normalizeImageList(input.images ?? current.images ?? [current.image])[0] ||
      current.image,
    images: normalizeImageList(input.images ?? current.images ?? [current.image]),
    slug: uniqueSlug,
  };

  store.cars[index] = updated;
  await writeStore(store);
  return updated;
}

export async function deleteCar(id: string) {
  const store = await readStore();
  store.cars = store.cars.filter((car) => car.id !== id);
  await writeStore(store);
}

export async function saveUploadedImages(files: File[]) {
  const validFiles = files.filter((file) => file.size > 0);
  if (validFiles.length === 0) {
    return [];
  }
  if (validFiles.length > maxCarImages) {
    throw new Error("Too many images.");
  }

  const uploaded: string[] = [];
  for (const file of validFiles) {
    uploaded.push(await saveUploadedImage(file));
  }
  return uploaded;
}

async function saveUploadedImage(file: File) {
  if (!file.type.startsWith("image/")) {
    throw new Error("Invalid image file.");
  }

  await mkdir(uploadDir, { recursive: true });
  const extension = path.extname(file.name).toLowerCase() || ".jpg";
  const filename = `${Date.now()}-${randomUUID()}${extension}`;
  const buffer = Buffer.from(await file.arrayBuffer());
  await writeFile(path.join(uploadDir, filename), buffer);
  return `/uploads/${filename}`;
}

export async function createInquiry(input: Omit<InquiryRecord, "id" | "createdAt">) {
  const store = await readStore();
  const inquiry: InquiryRecord = {
    id: randomUUID(),
    createdAt: new Date().toISOString(),
    ...input,
  };
  store.inquiries = [inquiry, ...store.inquiries].slice(0, maxInquiries);
  await writeStore(store);
  return inquiry;
}

export function getLocalizedCarText(car: CarRecord, lang: Lang) {
  const images = normalizeImageList(car.images ?? [car.image]);
  return {
    images,
    summary: lang === "en" ? car.summaryEn || car.summaryPl : car.summaryPl,
    description:
      lang === "en" ? car.descriptionEn || car.descriptionPl : car.descriptionPl,
    highlights:
      lang === "en" && car.highlightsEn.length > 0 ? car.highlightsEn : car.highlightsPl,
  };
}

function normalizeCarRecord(car: CarRecord): CarRecord {
  const images = normalizeImageList(car.images ?? [car.image]);
  const fallbackImage = car.image || images[0] || "";
  return {
    ...car,
    mileage: car.mileage ?? "",
    image: images[0] || fallbackImage,
    images: images.length > 0 ? images : fallbackImage ? [fallbackImage] : [],
  };
}

function normalizeImageList(images: string[]) {
  const normalized = images.filter(Boolean).slice(0, maxCarImages);
  return normalized;
}

function slugify(value: string) {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60);
}

function ensureUniqueSlug(slug: string, existing: string[]) {
  if (!existing.includes(slug)) {
    return slug;
  }
  let counter = 2;
  let candidate = `${slug}-${counter}`;
  while (existing.includes(candidate)) {
    counter += 1;
    candidate = `${slug}-${counter}`;
  }
  return candidate;
}
