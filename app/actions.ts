"use server";

import { revalidatePath } from "next/cache";
import { isRedirectError } from "next/dist/client/components/redirect-error";
import { redirect } from "next/navigation";
import {
  clearAdminSession,
  createAdminSession,
  isAdminAuthenticated,
  verifyAdminLogin,
} from "@/lib/auth";
import { buildLangHref, getLang } from "@/lib/i18n";
import { notifyAdmin } from "@/lib/notifications";
import {
  createCar,
  createInquiry,
  deleteCar,
  getCarBySlug,
  saveUploadedImages,
  updateSiteSettings,
  updateCar,
} from "@/lib/store";

function withSuffix(raw: string, suffix: string, detector: RegExp) {
  const value = raw.trim();
  if (!value) {
    return "";
  }

  if (detector.test(value)) {
    return value;
  }

  return `${value} ${suffix}`;
}

export async function loginAdmin(formData: FormData) {
  const username = String(formData.get("username") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  const lang = getLang(String(formData.get("lang") ?? ""));

  if (!(await verifyAdminLogin(username, password))) {
    redirect(buildLangHref("/admin/login?error=invalid", lang));
  }

  await createAdminSession();
  redirect(buildLangHref("/admin?status=welcome", lang));
}

export async function logoutAdmin(formData: FormData) {
  const lang = getLang(String(formData.get("lang") ?? ""));
  await clearAdminSession();
  redirect(buildLangHref("/", lang));
}

export async function addCarAction(formData: FormData) {
  const lang = getLang(String(formData.get("lang") ?? ""));
  if (!(await isAdminAuthenticated())) {
    redirect(buildLangHref("/admin/login?error=auth", lang));
  }

  const name = String(formData.get("name") ?? "").trim();
  const slug = String(formData.get("slug") ?? "").trim();
  const portfolioType = String(formData.get("portfolioType") ?? "").trim();
  const priceRange = String(formData.get("priceRange") ?? "").trim();
  const year = String(formData.get("year") ?? "").trim();
  const summaryPl = String(formData.get("summaryPl") ?? "").trim();
  const descriptionPl = String(formData.get("descriptionPl") ?? "").trim();
  const battery = String(formData.get("battery") ?? "").trim();
  const range = String(formData.get("range") ?? "").trim();
  const body = String(formData.get("body") ?? "").trim();
  const images = [...formData.getAll("images"), ...formData.getAll("cameraImages")];
  const normalizedPriceRange = withSuffix(priceRange, "zl", /zl|zl/i);
  const normalizedBattery = withSuffix(battery, "kWh", /kwh/i);
  const normalizedRange = withSuffix(range, "km CLTC", /km/i);

  if (
    !name ||
    (portfolioType !== "example" && portfolioType !== "available") ||
    !priceRange ||
    !year ||
    !summaryPl ||
    !descriptionPl ||
    !battery ||
    !range ||
    !body ||
    images.length === 0 ||
    !images.some((entry) => entry instanceof File && entry.size > 0)
  ) {
    redirect(buildLangHref("/admin?error=missing-fields", lang));
  }

  const uploadedImages = await saveUploadedImages(
    images.filter((entry): entry is File => entry instanceof File),
  );
  await createCar({
    portfolioType,
    name,
    slug,
    priceRange: normalizedPriceRange,
    year,
    summaryPl,
    summaryEn: summaryPl,
    descriptionPl,
    descriptionEn: descriptionPl,
    highlightsPl: [],
    highlightsEn: [],
    battery: normalizedBattery,
    range: normalizedRange,
    body,
    images: uploadedImages,
  });

  revalidatePath("/");
  revalidatePath("/admin");
  redirect(buildLangHref("/admin?status=car-added", lang));
}

export async function submitInquiryAction(formData: FormData) {
  const lang = getLang(String(formData.get("lang") ?? ""));
  const carSlug = String(formData.get("carSlug") ?? "").trim();
  const customerName = String(formData.get("customerName") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim();
  const phone = String(formData.get("phone") ?? "").trim();
  const message = String(formData.get("message") ?? "").trim();

  if (!carSlug || !customerName || !email || !phone) {
    redirect(buildLangHref(`/?contact=missing`, lang));
  }

  try {
    const car = await getCarBySlug(carSlug);
    if (!car) {
      redirect(buildLangHref("/?contact=missing-car", lang));
    }

    const delivery = await notifyAdmin({
      carSlug: car.slug,
      carName: car.name,
      portfolioType: car.portfolioType,
      customerName,
      email,
      phone,
      message,
    });
    console.info("Inquiry delivery status.", {
      carSlug: car.slug,
      delivery,
    });

    let inquirySaved = false;
    try {
      await createInquiry({
        carSlug: car.slug,
        carName: car.name,
        portfolioType: car.portfolioType,
        customerName,
        email,
        phone,
        message,
        delivery,
      });
      inquirySaved = true;
      revalidatePath("/admin");
    } catch (error) {
      console.error("Failed to save inquiry to store.", error);
    }

    const delivered = delivery.email === "sent" || delivery.whatsapp === "sent";
    const status = delivered ? "sent" : inquirySaved ? "saved" : "failed";

    redirect(`/oferta/${car.slug}?contact=${status}&lang=${lang}#contact-form`);
  } catch (error) {
    if (isRedirectError(error)) {
      throw error;
    }

    console.error("Inquiry submission failed.", error);
    redirect(`/oferta/${carSlug}?contact=failed&lang=${lang}#contact-form`);
  }
}

export async function updateCarAction(formData: FormData) {
  const lang = getLang(String(formData.get("lang") ?? ""));
  if (!(await isAdminAuthenticated())) {
    redirect(buildLangHref("/admin/login?error=auth", lang));
  }

  const id = String(formData.get("id") ?? "").trim();
  const portfolioType = String(formData.get("portfolioType") ?? "").trim();
  const name = String(formData.get("name") ?? "").trim();
  const slug = String(formData.get("slug") ?? "").trim();
  const priceRange = String(formData.get("priceRange") ?? "").trim();
  const year = String(formData.get("year") ?? "").trim();
  const summaryPl = String(formData.get("summaryPl") ?? "").trim();
  const descriptionPl = String(formData.get("descriptionPl") ?? "").trim();
  const battery = String(formData.get("battery") ?? "").trim();
  const range = String(formData.get("range") ?? "").trim();
  const body = String(formData.get("body") ?? "").trim();
  const currentImagesState = String(formData.get("currentImagesState") ?? "").trim();
  const currentImagesFromState = currentImagesState
    ? (() => {
        try {
          const parsed = JSON.parse(currentImagesState);
          return Array.isArray(parsed)
            ? parsed.map((value) => String(value).trim()).filter(Boolean)
            : [];
        } catch {
          return [];
        }
      })()
    : [];
  const currentImages =
    currentImagesFromState.length > 0
      ? currentImagesFromState
      : formData
          .getAll("currentImages")
          .map((value) => String(value).trim())
          .filter(Boolean);
  const newImagesFirst = String(formData.get("newImagesFirst") ?? "") === "1";
  const imageMove = String(formData.get("imageMove") ?? "").trim();
  const images = [...formData.getAll("images"), ...formData.getAll("cameraImages")];
  const normalizedPriceRange = withSuffix(priceRange, "zl", /zl|zl/i);
  const normalizedBattery = withSuffix(battery, "kWh", /kwh/i);
  const normalizedRange = withSuffix(range, "km CLTC", /km/i);

  if (
    !id ||
    !name ||
    !slug ||
    (portfolioType !== "example" && portfolioType !== "available") ||
    !priceRange ||
    !year ||
    !summaryPl ||
    !descriptionPl ||
    !battery ||
    !range ||
    !body
  ) {
    redirect(buildLangHref("/admin?error=missing-fields", lang));
  }

  let nextImages = currentImages;
  const [imageAction, imageIndexRaw] = imageMove.split(":");
  const imageIndex = Number(imageIndexRaw ?? "-1");
  if (
    (imageAction === "move-left" ||
      imageAction === "move-right" ||
      imageAction === "set-main" ||
      imageAction === "remove") &&
    Number.isInteger(imageIndex) &&
    imageIndex >= 0 &&
    imageIndex < currentImages.length
  ) {
    if (imageAction === "set-main") {
      nextImages = [...currentImages];
      const [movedImage] = nextImages.splice(imageIndex, 1);
      nextImages.unshift(movedImage);
    } else if (imageAction === "remove") {
      if (currentImages.length > 1) {
        nextImages = currentImages.filter((_, index) => index !== imageIndex);
      }
    } else {
      const targetIndex = imageAction === "move-left" ? imageIndex - 1 : imageIndex + 1;
      if (targetIndex >= 0 && targetIndex < currentImages.length) {
        nextImages = [...currentImages];
        const [movedImage] = nextImages.splice(imageIndex, 1);
        nextImages.splice(targetIndex, 0, movedImage);
      }
    }
  }

  const uploadedImages = await saveUploadedImages(
    images.filter((entry): entry is File => entry instanceof File),
  );
  if (uploadedImages.length > 0) {
    nextImages = newImagesFirst
      ? [...uploadedImages, ...nextImages].slice(0, 10)
      : [...nextImages, ...uploadedImages].slice(0, 10);
  }

  await updateCar(id, {
    slug,
    portfolioType,
    name,
    priceRange: normalizedPriceRange,
    year,
    summaryPl,
    summaryEn: summaryPl,
    descriptionPl,
    descriptionEn: descriptionPl,
    highlightsPl: [],
    highlightsEn: [],
    battery: normalizedBattery,
    range: normalizedRange,
    body,
    images: nextImages,
  });

  revalidatePath("/");
  revalidatePath("/admin");
  redirect(buildLangHref(`/admin?status=car-updated&nonce=${Date.now()}`, lang));
}

export async function deleteCarAction(formData: FormData) {
  const lang = getLang(String(formData.get("lang") ?? ""));
  if (!(await isAdminAuthenticated())) {
    redirect(buildLangHref("/admin/login?error=auth", lang));
  }

  const id = String(formData.get("id") ?? "").trim();
  if (!id) {
    redirect(buildLangHref("/admin?error=missing-fields", lang));
  }

  await deleteCar(id);
  revalidatePath("/");
  revalidatePath("/admin");
  redirect(buildLangHref("/admin?status=car-deleted", lang));
}

export async function updateSiteSettingsAction(formData: FormData) {
  const lang = getLang(String(formData.get("lang") ?? ""));
  if (!(await isAdminAuthenticated())) {
    redirect(buildLangHref("/admin/login?error=auth", lang));
  }

  const rawEmail = formData.get("publicEmail");
  const rawPhone = formData.get("publicPhone");
  const rawWhatsapp = formData.get("publicWhatsapp");

  const updates: Record<string, string> = {};
  if (rawEmail !== null) {
    updates.publicEmail = "kontakt@autojutra.pl";
  }
  if (rawPhone !== null) {
    updates.publicPhone = String(rawPhone).trim();
  }
  if (rawWhatsapp !== null) {
    updates.publicWhatsapp = String(rawWhatsapp).trim();
  }

  if (Object.keys(updates).length === 0 || Object.values(updates).some((value) => !value)) {
    redirect(buildLangHref("/admin?error=missing-fields", lang));
  }

  await updateSiteSettings(updates as {
    publicEmail?: string;
    publicPhone?: string;
    publicWhatsapp?: string;
  });

  revalidatePath("/");
  revalidatePath("/admin");
  revalidatePath("/oferta/[slug]", "page");
  redirect(buildLangHref("/admin?status=settings-updated", lang));
}

