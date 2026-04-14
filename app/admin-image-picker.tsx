"use client";

import Image from "next/image";
import { useEffect, useMemo, useRef, useState } from "react";

type ExistingImage = {
  src: string;
  label: string;
  isMain: boolean;
  index: number;
};

type AdminImagePickerProps = {
  galleryLabel: string;
  cameraLabel: string;
  existingImages?: ExistingImage[];
  lang?: "pl" | "en";
};

type QueuedImage = {
  id: string;
  file: File;
};

type GalleryItem =
  | {
      kind: "existing";
      key: string;
      src: string;
      label: string;
      isMain: boolean;
      index: number;
    }
  | {
      kind: "queued";
      key: string;
      id: string;
      src: string;
      label: string;
      isMain: boolean;
    };

type QueuedGalleryItem = Extract<GalleryItem, { kind: "queued" }>;

const maxImages = 10;
const emptyExistingImages: ExistingImage[] = [];
const visuallyHiddenFileInputStyle = {
  position: "absolute",
  width: "1px",
  height: "1px",
  padding: 0,
  margin: "-1px",
  overflow: "hidden",
  clip: "rect(0, 0, 0, 0)",
  whiteSpace: "nowrap",
  border: 0,
} as const;

export function AdminImagePicker({
  galleryLabel,
  cameraLabel,
  existingImages: existingImagesProp,
  lang = "pl",
}: AdminImagePickerProps) {
  const existingImages = existingImagesProp ?? emptyExistingImages;
  const submitInputRef = useRef<HTMLInputElement>(null);
  const [existingGallery, setExistingGallery] = useState(existingImages);
  const [queuedImages, setQueuedImages] = useState<QueuedImage[]>([]);
  const [selectedPreviewMainId, setSelectedPreviewMainId] = useState<string | null>(null);

  function resetPickerInputs() {
    const input = submitInputRef.current;
    if (input) {
      input.value = "";
    }
  }

  function openNativePicker(options?: { camera?: boolean }) {
    if (typeof document === "undefined") {
      return;
    }

    const picker = document.createElement("input");
    picker.type = "file";
    picker.accept = "image/*";
    picker.multiple = true;
    if (options?.camera) {
      picker.setAttribute("capture", "environment");
    }

    picker.addEventListener(
      "change",
      () => {
        queueFiles(picker.files);
      },
      { once: true },
    );

    picker.click();
  }

  useEffect(() => {
    setExistingGallery(existingImages);
  }, [existingImages]);

  const previewItems = useMemo(
    () =>
      queuedImages.map((item) => ({
        id: item.id,
        file: item.file,
        url: URL.createObjectURL(item.file),
      })),
    [queuedImages],
  );

  useEffect(() => {
    const input = submitInputRef.current;
    if (!input) {
      return;
    }

    if (typeof DataTransfer === "undefined") {
      return;
    }

    const transfer = new DataTransfer();
    queuedImages.forEach((item) => transfer.items.add(item.file));

    try {
      input.files = transfer.files;
    } catch {
      // Some browsers are stricter about assigning files programmatically.
      // The add/edit flow still keeps the visual queue, but submission relies
      // on browsers that support DataTransfer-backed assignment.
    }
  }, [queuedImages]);

  useEffect(() => {
    return () => {
      previewItems.forEach((item) => URL.revokeObjectURL(item.url));
    };
  }, [previewItems]);

  const effectivePreviewMainId =
    selectedPreviewMainId ?? (existingGallery.length === 0 ? queuedImages[0]?.id ?? null : null);

  function queueFiles(nextFiles: FileList | null) {
    if (!nextFiles || nextFiles.length === 0) {
      return;
    }

    setQueuedImages((current) => {
      const additions = Array.from(nextFiles)
        .filter((file) => isImageFile(file))
        .map((file) => ({
          id: buildQueuedImageId(file),
          file,
        }));

      const freeSlots = Math.max(0, maxImages - existingGallery.length - current.length);
      if (freeSlots <= 0) {
        return current;
      }

      return [...current, ...additions.slice(0, freeSlots)];
    });

    resetPickerInputs();
  }

  function removeQueuedImage(id: string) {
    setQueuedImages((current) => current.filter((item) => item.id !== id));
    if (effectivePreviewMainId === id) {
      setSelectedPreviewMainId(null);
    }
    resetPickerInputs();
  }

  function removeExistingImage(index: number) {
    setExistingGallery((current) => {
      if (current.length <= 1) {
        return current;
      }

      return current.filter((_, currentIndex) => currentIndex !== index);
    });
  }

  function setPreviewAsMain(id: string) {
    setSelectedPreviewMainId(id);
    setQueuedImages((current) => {
      const index = current.findIndex((item) => item.id === id);
      if (index <= 0) {
        return current;
      }

      const next = [...current];
      const [moved] = next.splice(index, 1);
      next.unshift(moved);
      return next;
    });
  }

  function setExistingAsMain(index: number) {
    setSelectedPreviewMainId(null);
    setExistingGallery((current) => {
      if (index <= 0) {
        return current;
      }

      const next = [...current];
      const [moved] = next.splice(index, 1);
      next.unshift(moved);
      return next;
    });
  }

  const selectedPreview = previewItems.find((item) => item.id === effectivePreviewMainId) ?? null;
  const previewMainSelected = selectedPreview !== null;

  const galleryItems = useMemo<GalleryItem[]>(() => {
    const photoLabel = lang === "pl" ? "Zdjecie" : "Photo";

    const existingAsItems: GalleryItem[] = existingGallery.map((image, index) => ({
      kind: "existing",
      key: `existing-${image.src}-${index}`,
      src: image.src,
      label: `${photoLabel} ${index + 1}`,
      isMain: !previewMainSelected && index === 0,
      index,
    }));

    const queuedAsItems: QueuedGalleryItem[] = previewItems.map((item) => ({
      kind: "queued",
      key: item.id,
      id: item.id,
      src: item.url,
      label: item.file.name,
      isMain: effectivePreviewMainId === item.id,
    }));

    if (!selectedPreview) {
      return [...existingAsItems, ...queuedAsItems];
    }

    const selectedQueuedItem = queuedAsItems.find(
      (item) => item.kind === "queued" && item.id === selectedPreview.id,
    );
    const remainingQueuedItems = queuedAsItems.filter(
      (item) => item.kind !== "queued" || item.id !== selectedPreview.id,
    );

    return selectedQueuedItem
      ? [selectedQueuedItem, ...existingAsItems, ...remainingQueuedItems]
      : [...existingAsItems, ...queuedAsItems];
  }, [effectivePreviewMainId, existingGallery, lang, previewItems, previewMainSelected, selectedPreview]);

  const totalImages = existingGallery.length + previewItems.length;
  const mainBadge = lang === "pl" ? "Glowne" : "Main";
  const mainLabel = lang === "pl" ? "Zdjecie profilowe" : "Main photo";
  const makeMainLabel = lang === "pl" ? "Glowne" : "Main";

  return (
    <div className="space-y-4">
      <input
        ref={submitInputRef}
        name="images"
        type="file"
        accept="image/*"
        multiple
        tabIndex={-1}
        aria-hidden="true"
        hidden
        style={visuallyHiddenFileInputStyle}
        readOnly
      />
      <input type="hidden" name="currentImagesState" value={JSON.stringify(existingGallery.map((image) => image.src))} />
      {existingGallery.map((image, index) => (
        <input key={`current-${image.src}-${index}`} type="hidden" name="currentImages" value={image.src} />
      ))}
      <input
        type="hidden"
        name="newImagesFirst"
        value={previewMainSelected && previewItems.length > 0 ? "1" : "0"}
      />

      <div className="flex flex-wrap items-center justify-end gap-3">
        <p className="text-xs font-medium text-zinc-500">
          {totalImages}/{maxImages}
        </p>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <button
          type="button"
          className="relative flex min-h-[74px] cursor-pointer items-center justify-between overflow-hidden rounded-[1.25rem] border border-dashed border-white/12 bg-white/[0.035] px-4 py-3 text-left transition hover:border-white/22 hover:bg-white/[0.06]"
          onClick={() => openNativePicker()}
        >
          <div>
            <p className="text-sm font-semibold text-white">{galleryLabel}</p>
          </div>
          <span className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-white/10 bg-white/[0.04] text-lg text-zinc-300">
            +
          </span>
        </button>
        <button
          type="button"
          className="relative flex min-h-[74px] cursor-pointer items-center justify-between overflow-hidden rounded-[1.25rem] border border-dashed border-white/12 bg-white/[0.035] px-4 py-3 text-left transition hover:border-white/22 hover:bg-white/[0.06]"
          onClick={() => openNativePicker({ camera: true })}
        >
          <div>
            <p className="text-sm font-semibold text-white">{cameraLabel}</p>
          </div>
          <span className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-white/10 bg-white/[0.04] text-base text-zinc-300">
            O
          </span>
        </button>
      </div>

      {galleryItems.length > 0 ? (
        <div className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-4">
          {galleryItems.map((item, displayIndex) => (
            <div
              key={item.key}
              className="overflow-hidden rounded-[1rem] border border-white/10 bg-zinc-950/75"
            >
              <div className="relative aspect-[4/3]">
                <Image
                  src={item.src}
                  alt={item.label}
                  fill
                  unoptimized={item.kind === "queued" || item.src.startsWith("data:")}
                  className="object-cover"
                />
                <div className="absolute inset-0 p-2">
                  {item.isMain ? (
                    <span className="absolute left-2 top-2 inline-flex h-6 max-w-[calc(100%-2.75rem)] items-center truncate rounded-full border border-white/15 bg-black/70 px-2 text-[11px] font-semibold text-white">
                      {mainBadge}
                    </span>
                  ) : item.kind === "existing" ? (
                    <button
                      type="button"
                      onClick={() => setExistingAsMain(item.index)}
                      className="absolute left-2 top-2 inline-flex h-6 max-w-[calc(100%-2.75rem)] items-center truncate rounded-full border border-white/15 bg-black/65 px-2 text-[11px] font-semibold text-white transition hover:bg-black/80"
                    >
                      {makeMainLabel}
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setPreviewAsMain(item.id)}
                      className="absolute left-2 top-2 inline-flex h-6 max-w-[calc(100%-2.75rem)] items-center truncate rounded-full border border-white/15 bg-black/65 px-2 text-[11px] font-semibold text-white transition hover:bg-black/80"
                    >
                      {makeMainLabel}
                    </button>
                  )}

                  {item.kind === "existing" ? (
                    !item.isMain ? (
                      <button
                        type="button"
                        onClick={() => removeExistingImage(item.index)}
                        aria-label={
                          lang === "pl"
                            ? `Usun zdjecie ${displayIndex + 1}`
                            : `Remove image ${displayIndex + 1}`
                        }
                        className="absolute right-2 top-2 inline-flex h-6 w-6 items-center justify-center rounded-full border border-white/15 bg-black/65 text-xs font-semibold text-white transition hover:bg-black/80 disabled:cursor-not-allowed disabled:opacity-35"
                        disabled={totalImages <= 1}
                      >
                        x
                      </button>
                    ) : (
                      <span className="absolute right-2 top-2 inline-flex h-6 w-6" aria-hidden="true" />
                    )
                  ) : (
                    <button
                      type="button"
                      onClick={() => removeQueuedImage(item.id)}
                      aria-label={lang === "pl" ? `Usun ${item.label}` : `Remove ${item.label}`}
                      className="absolute right-2 top-2 inline-flex h-6 w-6 items-center justify-center rounded-full border border-white/15 bg-black/65 text-xs font-semibold text-white transition hover:bg-black/80"
                    >
                      x
                    </button>
                  )}
                </div>
              </div>

              <div className="flex h-12 items-center px-3 py-2 text-xs text-zinc-500">
                <span className="truncate">{item.isMain ? mainLabel : item.label}</span>
              </div>
            </div>
          ))}
        </div>
      ) : null}
    </div>
  );
}

function buildQueuedImageId(file: File) {
  const randomPart =
    typeof crypto !== "undefined" && typeof crypto.randomUUID === "function"
      ? crypto.randomUUID()
      : Math.random().toString(36).slice(2);

  return `${file.name}-${file.size}-${file.lastModified}-${randomPart}`;
}

function isImageFile(file: File) {
  if (file.type.startsWith("image/")) {
    return true;
  }

  return /\.(avif|bmp|gif|heic|heif|jpe?g|png|svg|webp)$/i.test(file.name);
}
