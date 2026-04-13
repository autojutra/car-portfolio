import { NextResponse } from "next/server";
import { isAdminAuthenticated } from "@/lib/auth";
import { buildLangHref, getLang } from "@/lib/i18n";
import { createCar, saveUploadedImages } from "@/lib/store";

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

  const name = String(formData.get("name") ?? "").trim();
  const slug = String(formData.get("slug") ?? "").trim();
  const portfolioType = String(formData.get("portfolioType") ?? "").trim();
  const priceRange = String(formData.get("priceRange") ?? "").trim();
  const year = String(formData.get("year") ?? "").trim();
  const mileage = String(formData.get("mileage") ?? "").trim();
  const summaryPl = String(formData.get("summaryPl") ?? "").trim();
  const descriptionPl = String(formData.get("descriptionPl") ?? "").trim();
  const battery = String(formData.get("battery") ?? "").trim();
  const range = String(formData.get("range") ?? "").trim();
  const body = String(formData.get("body") ?? "").trim();
  const images = [...formData.getAll("images"), ...formData.getAll("cameraImages")];

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
    return NextResponse.redirect(
      new URL(buildLangHref("/admin?error=missing-fields", lang), request.url),
      303,
    );
  }

  const uploadedImages = await saveUploadedImages(
    images.filter((entry): entry is File => entry instanceof File && entry.size > 0),
  );

  await createCar({
    portfolioType,
    name,
    slug,
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
    images: uploadedImages,
  });

  return NextResponse.redirect(
    new URL(buildLangHref("/admin?status=car-added", lang), request.url),
    303,
  );
}
