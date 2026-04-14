import { randomUUID } from "node:crypto";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { defaultCars, type BaseCarRecord } from "@/lib/cars";
import type { Lang } from "@/lib/i18n";
import {
  getSupabaseAdminClient,
  getSupabaseStorageObjectPath,
  isSupabaseEnabled,
  supabaseStorageBucket,
} from "@/lib/supabase";

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

type CreateCarInput = {
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
};

type UpdateCarInput = Partial<
  Omit<CarRecord, "id" | "createdAt" | "slug"> & {
    slug?: string;
  }
>;

type SupabaseCarRow = {
  id: string;
  slug: string;
  portfolio_type: "example" | "available";
  name: string;
  image: string;
  images: string[] | null;
  price_range: string;
  year: string;
  mileage: string | null;
  summary_pl: string;
  summary_en: string;
  description_pl: string;
  description_en: string;
  highlights_pl: string[] | null;
  highlights_en: string[] | null;
  battery: string;
  range: string;
  body: string;
  created_at: string;
};

type SupabaseInquiryRow = {
  id: string;
  car_slug: string;
  car_name: string;
  portfolio_type: "example" | "available";
  customer_name: string;
  email: string;
  phone: string;
  message: string | null;
  created_at: string;
  delivery_email: string;
  delivery_whatsapp: string;
};

type SupabaseSiteSettingsRow = {
  id: string;
  public_email: string;
  public_phone: string;
  public_whatsapp: string;
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
  if (isSupabaseEnabled()) {
    return getSupabaseCars();
  }

  return getJsonCars();
}

export async function getCarsByType(type: "example" | "available") {
  const cars = await getCars();
  return cars.filter((car) => car.portfolioType === type);
}

export async function getCarBySlug(slug: string) {
  if (isSupabaseEnabled()) {
    const supabase = getSupabaseAdminClient();
    const { data, error } = await supabase
      .from("cars")
      .select("*")
      .eq("slug", slug)
      .maybeSingle<SupabaseCarRow>();

    if (error) {
      throw error;
    }

    return data ? mapSupabaseCar(data) : undefined;
  }

  const store = await readStore();
  return store.cars.find((car) => car.slug === slug);
}

export async function getInquiries() {
  if (isSupabaseEnabled()) {
    const supabase = getSupabaseAdminClient();
    const { data, error } = await supabase
      .from("inquiries")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(maxInquiries)
      .returns<SupabaseInquiryRow[]>();

    if (error) {
      throw error;
    }

    return (data ?? []).map(mapSupabaseInquiry);
  }

  const store = await readStore();
  return [...store.inquiries]
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
    .slice(0, maxInquiries);
}

export async function getSiteSettings() {
  if (isSupabaseEnabled()) {
    const settings = await ensureSupabaseSiteSettings();
    return mapSupabaseSiteSettings(settings);
  }

  const store = await readStore();
  return store.settings;
}

export async function updateSiteSettings(input: Partial<SiteSettings>) {
  if (isSupabaseEnabled()) {
    const supabase = getSupabaseAdminClient();
    const current = await ensureSupabaseSiteSettings();
    const { data, error } = await supabase
      .from("site_settings")
      .upsert(
        {
          id: current.id,
          public_email: fixedInquiryEmail,
          public_phone: input.publicPhone ?? current.public_phone,
          public_whatsapp: input.publicWhatsapp ?? current.public_whatsapp,
        },
        { onConflict: "id" },
      )
      .select("*")
      .single<SupabaseSiteSettingsRow>();

    if (error) {
      throw error;
    }

    return mapSupabaseSiteSettings(data);
  }

  const store = await readStore();
  store.settings = {
    ...store.settings,
    ...input,
  };
  await writeStore(store);
  return store.settings;
}

export async function createCar(input: CreateCarInput) {
  if (isSupabaseEnabled()) {
    const supabase = getSupabaseAdminClient();
    const existingCars = await getSupabaseCars();
    const baseSlug = slugify(input.slug || input.name);
    const uniqueSlug = ensureUniqueSlug(baseSlug, existingCars.map((car) => car.slug));
    const images = normalizeImageList(input.images);

    const { data, error } = await supabase
      .from("cars")
      .insert({
        slug: uniqueSlug,
        portfolio_type: input.portfolioType,
        name: input.name,
        image: images[0] ?? "",
        images,
        price_range: input.priceRange,
        year: input.year,
        mileage: input.mileage ?? "",
        summary_pl: input.summaryPl,
        summary_en: input.summaryEn,
        description_pl: input.descriptionPl,
        description_en: input.descriptionEn,
        highlights_pl: input.highlightsPl,
        highlights_en: input.highlightsEn,
        battery: input.battery,
        range: input.range,
        body: input.body,
      })
      .select("*")
      .single<SupabaseCarRow>();

    if (error) {
      throw error;
    }

    return mapSupabaseCar(data);
  }

  const store = await readStore();
  const baseSlug = slugify(input.slug || input.name);
  const uniqueSlug = ensureUniqueSlug(baseSlug, store.cars.map((car) => car.slug));
  const images = normalizeImageList(input.images);

  const car: CarRecord = {
    id: randomUUID(),
    slug: uniqueSlug,
    createdAt: new Date().toISOString(),
    ...input,
    mileage: input.mileage ?? "",
    image: images[0] ?? "",
    images,
  };

  store.cars.unshift(car);
  await writeStore(store);
  return car;
}

export async function updateCar(id: string, input: UpdateCarInput) {
  if (isSupabaseEnabled()) {
    const supabase = getSupabaseAdminClient();
    const current = await getSupabaseCarById(id);
    if (!current) {
      throw new Error("Car not found.");
    }

    const requestedSlug = input.slug ? slugify(input.slug) : current.slug;
    const allCars = await getSupabaseCars();
    const uniqueSlug =
      requestedSlug === current.slug
        ? current.slug
        : ensureUniqueSlug(
            requestedSlug,
            allCars.filter((car) => car.id !== id).map((car) => car.slug),
          );

    const nextImages = normalizeImageList(input.images ?? current.images ?? [current.image]);
    const nextCar: CarRecord = {
      ...current,
      ...input,
      slug: uniqueSlug,
      mileage: input.mileage ?? current.mileage ?? "",
      image: nextImages[0] || current.image,
      images: nextImages,
    };

    const { data, error } = await supabase
      .from("cars")
      .update({
        slug: nextCar.slug,
        portfolio_type: nextCar.portfolioType,
        name: nextCar.name,
        image: nextCar.image,
        images: nextCar.images,
        price_range: nextCar.priceRange,
        year: nextCar.year,
        mileage: nextCar.mileage ?? "",
        summary_pl: nextCar.summaryPl,
        summary_en: nextCar.summaryEn,
        description_pl: nextCar.descriptionPl,
        description_en: nextCar.descriptionEn,
        highlights_pl: nextCar.highlightsPl,
        highlights_en: nextCar.highlightsEn,
        battery: nextCar.battery,
        range: nextCar.range,
        body: nextCar.body,
      })
      .eq("id", id)
      .select("*")
      .single<SupabaseCarRow>();

    if (error) {
      throw error;
    }

    await deleteSupabaseStorageImages(
      current.images.filter((image) => !nextImages.includes(image)),
    );

    return mapSupabaseCar(data);
  }

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
  if (isSupabaseEnabled()) {
    const supabase = getSupabaseAdminClient();
    const current = await getSupabaseCarById(id);

    const { error } = await supabase.from("cars").delete().eq("id", id);
    if (error) {
      throw error;
    }

    if (current) {
      await deleteSupabaseStorageImages(current.images);
    }
    return;
  }

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

  if (isSupabaseEnabled()) {
    const supabase = getSupabaseAdminClient();
    const extension = path.extname(file.name).toLowerCase() || ".jpg";
    const objectPath = `cars/${new Date().toISOString().slice(0, 10)}/${Date.now()}-${randomUUID()}${extension}`;
    const buffer = Buffer.from(await file.arrayBuffer());
    const { error } = await supabase.storage.from(supabaseStorageBucket).upload(objectPath, buffer, {
      contentType: file.type,
      upsert: false,
    });

    if (error) {
      throw error;
    }

    const { data } = supabase.storage.from(supabaseStorageBucket).getPublicUrl(objectPath);
    return data.publicUrl;
  }

  await mkdir(uploadDir, { recursive: true });
  const extension = path.extname(file.name).toLowerCase() || ".jpg";
  const filename = `${Date.now()}-${randomUUID()}${extension}`;
  const buffer = Buffer.from(await file.arrayBuffer());
  await writeFile(path.join(uploadDir, filename), buffer);
  return `/uploads/${filename}`;
}

export async function createInquiry(input: Omit<InquiryRecord, "id" | "createdAt">) {
  if (isSupabaseEnabled()) {
    const supabase = getSupabaseAdminClient();
    const { data, error } = await supabase
      .from("inquiries")
      .insert({
        car_slug: input.carSlug,
        car_name: input.carName,
        portfolio_type: input.portfolioType,
        customer_name: input.customerName,
        email: input.email,
        phone: input.phone,
        message: input.message,
        delivery_email: input.delivery.email,
        delivery_whatsapp: input.delivery.whatsapp,
      })
      .select("*")
      .single<SupabaseInquiryRow>();

    if (error) {
      throw error;
    }

    return mapSupabaseInquiry(data);
  }

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

async function getJsonCars() {
  const store = await readStore();
  return [...store.cars].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

async function getSupabaseCars() {
  const supabase = getSupabaseAdminClient();
  const { data, error } = await supabase
    .from("cars")
    .select("*")
    .order("created_at", { ascending: false })
    .returns<SupabaseCarRow[]>();

  if (error) {
    throw error;
  }

  return (data ?? []).map(mapSupabaseCar);
}

async function getSupabaseCarById(id: string) {
  const supabase = getSupabaseAdminClient();
  const { data, error } = await supabase
    .from("cars")
    .select("*")
    .eq("id", id)
    .maybeSingle<SupabaseCarRow>();

  if (error) {
    throw error;
  }

  return data ? mapSupabaseCar(data) : undefined;
}

async function ensureSupabaseSiteSettings() {
  const supabase = getSupabaseAdminClient();
  const { data, error } = await supabase
    .from("site_settings")
    .select("*")
    .eq("id", "primary")
    .maybeSingle<SupabaseSiteSettingsRow>();

  if (error) {
    throw error;
  }

  if (data) {
    return data;
  }

  const { data: inserted, error: insertError } = await supabase
    .from("site_settings")
    .upsert(
      {
        id: "primary",
        public_email: fixedInquiryEmail,
        public_phone: defaultStore.settings.publicPhone,
        public_whatsapp: defaultStore.settings.publicWhatsapp,
      },
      { onConflict: "id" },
    )
    .select("*")
    .single<SupabaseSiteSettingsRow>();

  if (insertError) {
    throw insertError;
  }

  return inserted;
}

function mapSupabaseCar(row: SupabaseCarRow): CarRecord {
  return normalizeCarRecord({
    id: row.id,
    slug: row.slug,
    portfolioType: row.portfolio_type,
    name: row.name,
    image: row.image,
    images: row.images ?? [],
    priceRange: row.price_range,
    year: row.year,
    mileage: row.mileage ?? "",
    summaryPl: row.summary_pl,
    summaryEn: row.summary_en,
    descriptionPl: row.description_pl,
    descriptionEn: row.description_en,
    highlightsPl: row.highlights_pl ?? [],
    highlightsEn: row.highlights_en ?? [],
    battery: row.battery,
    range: row.range,
    body: row.body,
    createdAt: row.created_at,
  });
}

function mapSupabaseInquiry(row: SupabaseInquiryRow): InquiryRecord {
  return {
    id: row.id,
    carSlug: row.car_slug,
    carName: row.car_name,
    portfolioType: row.portfolio_type,
    customerName: row.customer_name,
    email: row.email,
    phone: row.phone,
    message: row.message ?? "",
    createdAt: row.created_at,
    delivery: {
      email: row.delivery_email,
      whatsapp: row.delivery_whatsapp,
    },
  };
}

function mapSupabaseSiteSettings(row: SupabaseSiteSettingsRow): SiteSettings {
  return {
    publicEmail: fixedInquiryEmail,
    publicPhone: row.public_phone,
    publicWhatsapp: row.public_whatsapp,
  };
}

async function deleteSupabaseStorageImages(images: string[]) {
  const objectPaths = images
    .map((image) => getSupabaseStorageObjectPath(image))
    .filter((value): value is string => Boolean(value));

  if (objectPaths.length === 0) {
    return;
  }

  const supabase = getSupabaseAdminClient();
  const { error } = await supabase.storage.from(supabaseStorageBucket).remove(objectPaths);
  if (error) {
    console.error("Failed to remove Supabase storage objects.", error);
  }
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
