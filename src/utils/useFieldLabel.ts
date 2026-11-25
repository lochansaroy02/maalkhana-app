import { useTranslations } from "next-intl";

/**
 * Translated label for a database field (messages: fieldLabels.<key>).
 * Falls back to the given English label, or the key itself.
 */
export const useFieldLabel = () => {
    const t = useTranslations("fieldLabels");
    return (key: string, fallback?: string) => (key && t.has(key) ? t(key) : fallback ?? key);
};
