// Item categories for a Malkhana entry (the "श्रेणी / Category" dropdown on the
// Malkhana Entry form). The key is what is saved in MalkhanaEntry.category;
// labels are shown in the app's language.

export const ITEM_CATEGORIES = [
    { key: "weapon", hi: "शस्त्र", en: "Weapons" },
    { key: "ndps", hi: "NDPS", en: "NDPS" },
    { key: "cash", hi: "नकद", en: "Cash" },
    { key: "vehicle", hi: "वाहन", en: "Vehicles" },
    { key: "electronics", hi: "इलेक्ट्रॉनिक्स", en: "Electronics" },
    { key: "document", hi: "दस्तावेज़", en: "Documents" },
    { key: "biological", hi: "जैविक", en: "Biological" },
    { key: "metal", hi: "पीली/सफ़ेद धातु", en: "Yellow/White metal" },
    { key: "explosive", hi: "विस्फोटक", en: "Explosives" },
    { key: "excise", hi: "आबकारी/शराब", en: "Excise/Liquor" },
    { key: "antique", hi: "प्राचीन वस्तु", en: "Antiques" },
    { key: "other", hi: "अन्य", en: "Other" },
] as const;

export type ItemCategoryKey = (typeof ITEM_CATEGORIES)[number]["key"];
/** Entries saved before the dropdown existed (blank category). */
export const UNSET_CATEGORY = "unset";
export type ItemCategoryBucket = ItemCategoryKey | typeof UNSET_CATEGORY;

export const ITEM_CATEGORY_KEYS = ITEM_CATEGORIES.map((c) => c.key) as ItemCategoryKey[];
export const ITEM_CATEGORY_BUCKETS: ItemCategoryBucket[] = [...ITEM_CATEGORY_KEYS, UNSET_CATEGORY];

const squash = (s: string) => s.toLowerCase().replace(/[\s.,\-_/()]+/g, "");

// Older entries have free text in this field; map the common spellings.
const ALIASES: [ItemCategoryKey, string[]][] = [
    ["weapon", ["weapon", "शस्त्र", "हथियार", "असलहा", "तमंचा", "arms"]],
    ["ndps", ["ndps", "एनडीपीएस", "मादक", "गांजा", "स्मैक", "चरस", "drugs"]],
    ["cash", ["cash", "नकद", "नगद", "नकदी"]],
    ["vehicle", ["vehicle", "वाहन", "गाड़ी", "गाडी", "मोटरसाइकिल"]],
    ["electronics", ["electronic", "इलेक्ट्रॉनिक", "इलेक्ट्रानिक", "मोबाइल", "mobile"]],
    ["document", ["document", "दस्तावेज", "दस्तावेज़", "कागजात"]],
    ["biological", ["biological", "जैविक", "विसरा"]],
    ["metal", ["metal", "पीली", "सफ़ेद", "सफेद", "आभूषण", "जेवर", "सोना", "चांदी", "yellow", "white"]],
    ["explosive", ["explosive", "विस्फोटक"]],
    ["excise", ["excise", "आबकारी", "शराब", "liquor", "wine"]],
    ["antique", ["antique", "प्राचीन"]],
    ["other", ["other", "अन्य"]],
];

const BY_KEY = new Map<string, ItemCategoryKey>(ITEM_CATEGORY_KEYS.map((k) => [k, k]));

/** Category key for a stored value; blank → "unset", unknown text → "other". */
export const itemCategoryOf = (value?: string | null): ItemCategoryBucket => {
    const raw = (value || "").trim();
    if (!raw) return UNSET_CATEGORY;
    const exact = BY_KEY.get(raw);
    if (exact) return exact;
    const s = squash(raw);
    for (const c of ITEM_CATEGORIES) {
        if (squash(c.hi) === s || squash(c.en) === s) return c.key;
    }
    for (const [key, words] of ALIASES) {
        if (words.some((w) => s.startsWith(squash(w)))) return key;
    }
    return "other";
};

/** Label for a stored value in the given locale ("hi" | "en"). */
export const itemCategoryLabel = (value: string | null | undefined, locale: string): string => {
    const bucket = itemCategoryOf(value);
    if (bucket === UNSET_CATEGORY) return "";
    const c = ITEM_CATEGORIES.find((x) => x.key === bucket)!;
    return locale === "hi" ? c.hi : c.en;
};

export const isItemCategoryBucket = (v: unknown): v is ItemCategoryBucket =>
    typeof v === "string" && (ITEM_CATEGORY_BUCKETS as string[]).includes(v);
