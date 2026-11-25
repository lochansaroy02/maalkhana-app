"use client";

import { useTranslations } from "next-intl";
import type { BarcodeLabels } from "./generateBarcodePDF";

/** Translated words for barcode stickers, in the current app language. */
export const useBarcodeLabels = (): BarcodeLabels => {
    const tType = useTranslations("entry.malkhanaEntryForm.entryType.options");
    const t = useTranslations("categories.barcode");
    return {
        entryType: (key: string) => tType(key),
        receipt: t("receipt"),
        license: t("license"),
        vehicle: t("vehicle"),
        weaponNo: t("weaponNo"),
    };
};
