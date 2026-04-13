"use client";

import { useEffect, useId, useState } from "react";

type PortfolioType = "example" | "available";

type AdminPricingFieldsProps = {
  formId: string;
  lang: "pl" | "en";
  defaultPortfolioType: PortfolioType;
  defaultPrice?: string;
  defaultYear?: string;
  defaultBody?: string;
  defaultBattery?: string;
  defaultRange?: string;
  defaultMileage?: string;
};

export function AdminPricingFields({
  formId,
  lang,
  defaultPortfolioType,
  defaultPrice = "",
  defaultYear = "",
  defaultBody = "",
  defaultBattery = "",
  defaultRange = "",
  defaultMileage = "",
}: AdminPricingFieldsProps) {
  const [portfolioType, setPortfolioType] = useState<PortfolioType>(defaultPortfolioType);
  const priceId = useId();
  const yearId = useId();
  const bodyId = useId();
  const batteryId = useId();
  const rangeId = useId();
  const mileageId = useId();

  useEffect(() => {
    const form = document.getElementById(formId);
    if (!form) {
      return;
    }

    const sync = () => {
      const checked = form.querySelector<HTMLInputElement>('input[name="portfolioType"]:checked');
      setPortfolioType(checked?.value === "available" ? "available" : "example");
    };

    sync();
    form.addEventListener("change", sync);
    return () => form.removeEventListener("change", sync);
  }, [formId]);

  const priceLabel =
    lang === "pl"
      ? portfolioType === "available"
        ? "Cena"
        : "Przedział ceny"
      : portfolioType === "available"
        ? "Price"
        : "Price range";

  return (
    <>
      <NumericFieldWithSuffix
        id={priceId}
        label={priceLabel}
        name="priceRange"
        defaultValue={stripNumericPrefix(defaultPrice)}
        suffix="zł"
        mode={portfolioType === "available" ? "single" : "range"}
      />
      <SimpleField
        id={yearId}
        label={lang === "pl" ? "Rocznik" : "Year"}
        name="year"
        defaultValue={defaultYear}
      />
      <SimpleField
        id={bodyId}
        label={lang === "pl" ? "Nadwozie" : "Body type"}
        name="body"
        defaultValue={defaultBody}
      />
      <NumericFieldWithSuffix
        id={batteryId}
        label={lang === "pl" ? "Bateria" : "Battery"}
        name="battery"
        defaultValue={stripNumericPrefix(defaultBattery)}
        suffix="kWh"
        mode="range"
      />
      <NumericFieldWithSuffix
        id={rangeId}
        label={lang === "pl" ? "Deklarowany zasięg" : "Declared range"}
        name="range"
        defaultValue={stripNumericPrefix(defaultRange)}
        suffix="km CLTC"
        mode="range"
      />
      {portfolioType === "available" ? (
        <NumericFieldWithSuffix
          id={mileageId}
          label={lang === "pl" ? "Przebieg" : "Mileage"}
          name="mileage"
          defaultValue={stripNumericPrefix(defaultMileage)}
          suffix="km"
          mode="single"
        />
      ) : (
        <input type="hidden" name="mileage" value="" />
      )}
    </>
  );
}

function SimpleField({
  id,
  label,
  name,
  defaultValue,
}: {
  id: string;
  label: string;
  name: string;
  defaultValue: string;
}) {
  return (
    <label className="block space-y-2" htmlFor={id}>
      <span className="text-sm font-medium text-zinc-300">{label}</span>
      <input
        id={id}
        name={name}
        type="text"
        required
        defaultValue={defaultValue}
        autoComplete="off"
        autoCorrect="off"
        autoCapitalize="off"
        spellCheck={false}
        className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none transition focus:border-white/25 focus:bg-white/8"
      />
    </label>
  );
}

function NumericFieldWithSuffix({
  id,
  label,
  name,
  defaultValue,
  suffix,
  mode,
}: {
  id: string;
  label: string;
  name: string;
  defaultValue: string;
  suffix: string;
  mode: "single" | "range";
}) {
  return (
    <label className="block space-y-2" htmlFor={id}>
      <span className="text-sm font-medium text-zinc-300">{label}</span>
      <div className="relative">
        <input
          id={id}
          name={name}
          type="text"
          required
          inputMode="decimal"
          autoComplete="off"
          autoCorrect="off"
          autoCapitalize="off"
          spellCheck={false}
          defaultValue={defaultValue}
          onInput={(event) => {
            const element = event.currentTarget;
            element.value = sanitizeNumericInput(element.value, mode);
          }}
          className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 pr-24 text-white outline-none transition focus:border-white/25 focus:bg-white/8"
        />
        <span className="pointer-events-none absolute inset-y-0 right-4 inline-flex items-center text-sm text-zinc-500">
          {suffix}
        </span>
      </div>
    </label>
  );
}

function sanitizeNumericInput(value: string, mode: "single" | "range") {
  if (mode === "single") {
    return value.replace(/[^\d\s.,]/g, "").replace(/\s{2,}/g, " ").trimStart();
  }

  return value
    .replace(/[^\d\s.,/-]/g, "")
    .replace(/\s{2,}/g, " ")
    .replace(/-{2,}/g, "-")
    .trimStart();
}

function stripNumericPrefix(value: string) {
  return value.replace(/[A-Za-z\u00C0-\u024F]/g, "").trim();
}
