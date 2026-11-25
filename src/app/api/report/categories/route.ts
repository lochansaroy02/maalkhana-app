import { prisma } from "@/lib/prisma";
import { Prisma } from "@/generated/prisma";
import { ITEM_CATEGORY_BUCKETS, isItemCategoryBucket, itemCategoryOf, UNSET_CATEGORY } from "@/utils/itemCategories";
import {
    categoryForEntryType,
    deriveItemStatus,
    ENTRY_TYPE_CATEGORIES,
    formatDisplayDate,
    isMaalCategory,
    isPlainCategorySpelling,
    toIsoDay,
} from "@/utils/maalCategories";
import { NextRequest, NextResponse } from "next/server";

export interface CategoryItem {
    id: string;
    firNo: string;
    srNo: string;
    malkhanaNo: string;
    /** Entry-type category, or the item category when by=category. */
    category: string;
    /** The saved entryType; for "other" this is the custom text the user typed. */
    entryType: string;
    description: string;
    statusKey: string;
    date: string;
    isoDate: string;
    policeStation: string;
}

const clean = (v: unknown) => (v === null || v === undefined ? "" : String(v).trim());

const ENTRY_SELECT = {
    id: true, firNo: true, srNo: true, entryType: true, category: true, caseProperty: true, description: true,
    gdDate: true, status: true, policeStation: true, isRelease: true, isDestroy: true,
    isNilami: true, isMovement: true, isReturned: true, receiptNo: true, licenseNo: true,
    weaponName: true, weaponNo: true, depositDate: true, ownerName: true,
} satisfies Prisma.MalkhanaEntrySelect;

type EntryRow = Prisma.MalkhanaEntryGetPayload<{ select: typeof ENTRY_SELECT }>;

/**
 * GET /api/report/categories
 *   userId?     – police station user (omit for district / admin view)
 *   districtId? – restrict the admin view to one district
 *   by?         – "category": group by the item category field (weapon, ndps,
 *                 cash…, "unset" for entries saved without one). Default:
 *                 group by entry type (malkhana, fsl, kurki, cash, wine,
 *                 unclaimed, yellowItem, licensedWeapon, other)
 *   category?   – the group to list
 *   subType?    – entry-type "other": one specific custom entry type
 *   search, status, from, to (yyyy-mm-dd) – item filters
 *   page, pageSize – pagination (default 50); all=1 returns every match (export)
 */
export const GET = async (req: NextRequest) => {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("userId") || undefined;
    const districtId = searchParams.get("districtId") || undefined;
    const byItemCategory = searchParams.get("by") === "category";
    const category = searchParams.get("category");
    const search = clean(searchParams.get("search")).toLowerCase();
    const subType = clean(searchParams.get("subType"));
    const statusFilter = clean(searchParams.get("status"));
    const from = clean(searchParams.get("from"));
    const to = clean(searchParams.get("to"));
    const all = searchParams.get("all") === "1";
    const page = Math.max(1, Number(searchParams.get("page")) || 1);
    const pageSize = Math.min(500, Math.max(1, Number(searchParams.get("pageSize")) || 50));

    if (category && !(byItemCategory ? isItemCategoryBucket(category) : isMaalCategory(category))) {
        return NextResponse.json({ success: false, error: "Invalid category" }, { status: 400 });
    }
    const where: Prisma.MalkhanaEntryWhereInput = userId ? { userId } : districtId ? { districtId } : {};

    try {
        // ---- counts (straight from the database) and the filter for the chosen group
        let counts: Record<string, number>;
        let total = 0;
        let groupWhere: Prisma.MalkhanaEntryWhereInput = {};
        let subTypes: { value: string; count: number }[] = [];
        let groupOf: (e: EntryRow) => string;

        if (byItemCategory) {
            const grouped = await prisma.malkhanaEntry.groupBy({ by: ["category"], where, _count: { _all: true } });
            counts = Object.fromEntries(ITEM_CATEGORY_BUCKETS.map((c) => [c, 0]));
            for (const g of grouped) {
                counts[itemCategoryOf(g.category)] += g._count._all;
                total += g._count._all;
            }
            if (category) {
                // Saved values are keys, or free text on older entries: match every spelling in this group.
                const texts = grouped
                    .filter((g) => itemCategoryOf(g.category) === category && g.category !== null)
                    .map((g) => g.category as string);
                groupWhere = category === UNSET_CATEGORY
                    ? { OR: [{ category: null }, { category: { in: texts } }] }
                    : { category: { in: texts.length ? texts : ["__none__"] } };
            }
            groupOf = (e) => itemCategoryOf(e.category);
        } else {
            const grouped = await prisma.malkhanaEntry.groupBy({ by: ["entryType"], where, _count: { _all: true } });
            counts = Object.fromEntries(ENTRY_TYPE_CATEGORIES.map((c) => [c, 0]));
            for (const g of grouped) {
                counts[categoryForEntryType(g.entryType)] += g._count._all;
                total += g._count._all;
            }
            if (category) {
                // entryType is free text, so collect every stored spelling in this category.
                const rawTypes = grouped.map((g) => g.entryType ?? "").filter((t) => categoryForEntryType(t) === category);
                groupWhere = subType
                    ? { entryType: rawTypes.includes(subType) ? subType : "__no_matching_type__" }
                    : { entryType: { in: rawTypes } };
                // Custom / crime-head values in this category, for the sub-type filter
                // (most common first; independent of the current filter).
                subTypes = grouped
                    .filter((g) => categoryForEntryType(g.entryType) === category && !isPlainCategorySpelling(g.entryType))
                    .sort((a, b) => b._count._all - a._count._all)
                    .map((g) => ({ value: g.entryType, count: g._count._all }));
            }
            groupOf = (e) => categoryForEntryType(e.entryType);
        }

        if (!category) {
            return NextResponse.json({ success: true, counts, total });
        }

        // ---- items of the chosen group
        const entries = await prisma.malkhanaEntry.findMany({
            where: { AND: [where, groupWhere] },
            orderBy: [{ createdAt: "desc" }],
            select: ENTRY_SELECT,
        });

        const items: CategoryItem[] = entries.map((e) => {
            const isLicensed = e.entryType === "licensedWeapon";
            const rawDate = isLicensed ? e.depositDate || e.gdDate : e.gdDate;
            const description = isLicensed
                ? [clean(e.weaponName), clean(e.weaponNo) && `#${clean(e.weaponNo)}`,
                    clean(e.licenseNo), clean(e.ownerName)].filter(Boolean).join(" · ")
                : clean(e.description) || clean(e.caseProperty);
            return {
                id: e.id,
                firNo: clean(e.firNo),
                srNo: clean(e.srNo),
                malkhanaNo: isLicensed && e.receiptNo ? clean(e.receiptNo) : clean(e.srNo),
                category: groupOf(e),
                entryType: clean(e.entryType),
                description,
                statusKey: deriveItemStatus(e),
                date: formatDisplayDate(rawDate),
                isoDate: toIsoDay(rawDate),
                policeStation: clean(e.policeStation),
            };
        });

        const filtered = items.filter((i) => {
            if (statusFilter && i.statusKey !== statusFilter) return false;
            if (from && (!i.isoDate || i.isoDate < from)) return false;
            if (to && (!i.isoDate || i.isoDate > to)) return false;
            if (search) {
                const hay = `${i.firNo} ${i.srNo} ${i.malkhanaNo} ${i.description} ${i.policeStation} ${i.entryType}`.toLowerCase();
                if (!hay.includes(search)) return false;
            }
            return true;
        });

        const pageItems = all ? filtered : filtered.slice((page - 1) * pageSize, page * pageSize);

        return NextResponse.json({
            success: true,
            counts,
            total,
            category,
            subTypes,
            totalItems: filtered.length,
            page: all ? 1 : page,
            pageSize: all ? filtered.length : pageSize,
            items: pageItems,
        });
    } catch (error) {
        console.error("GET /api/report/categories error:", error);
        return NextResponse.json({ success: false, error: "Failed to load categories" }, { status: 500 });
    }
};
