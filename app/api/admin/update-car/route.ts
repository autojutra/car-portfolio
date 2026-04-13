import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";
import { isAdminAuthenticated } from "@/lib/auth";
import { buildLangHref, getLang } from "@/lib/i18n";
import { saveUploadedImages, updateCar } from "@/lib/store";

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

export async function POST(request: Request) {
  const formData = await request.formData();
  const lang = getLang(String(formData.get("lang") ?? ""));

  if (!(await isAdminAuthenticated())) {
    return NextResponse.redirect(
      new URL(buildLangHref("/admin/login?error=auth", lang), request.url),
      303,
    );
  }

  const id = String(formData.get("id") ?? "").trim();
  const portfolioType = String(formData.get("portfolioType") ?? "").trim();
  const name = String(formData.get("name") ?? "").trim();
  const slug = String(formData.get("slug") ?? "").trim();
  const priceRange = String(formData.get("priceRange") ?? "").trim();
  const year = String(formData.get("year") ?? "").trim();
  const mileage = String(formData.get("mileage") ?? "").trim();
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
  const images = [...formData.getAll("images"), ...formData.getAll("cameraImages")];

  if (
    !id ||
    !name ||
    (portfolioType !== "example" && portfolioType !== "available") ||
    !priceRange ||
    !year ||
    !summaryPl ||
    !descriptionPl ||
    !battery ||
    !range ||
    !body
  ) {
    return NextResponse.redirect(
      new URL(buildLangHref("/admin?error=missing-fields", lang), request.url),
      303,
    );
  }

  let nextImages = currentImages;
  const uploadedImages = await saveUploadedImages(
    images.filter((entry): entry is File => entry instanceof File && entry.size > 0),
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
    priceRange: withSuffix(priceRange, "zł", /zł|zl/i),
    year,
    mileage: portfolioType === "available" && mileage ? withSuffix(mileage, "km", /km/i) : "",
    summaryPl,
    summaryEn: summaryPl,
    descriptionPl,
    descriptionEn: descriptionPl,
    highlightsPl: [],
    highlightsEn: [],
    battery: withSuffix(battery, "kWh", /kwh/i),
    range: withSuffix(range, "km CLTC", /km/i),
    body,
    images: nextImages,
  });

  revalidatePath("/");
  revalidatePath("/admin");
  return NextResponse.redirect(
    new URL(buildLangHref(`/admin?status=car-updated&nonce=${Date.now()}`, lang), request.url),
    303,
  );
}
