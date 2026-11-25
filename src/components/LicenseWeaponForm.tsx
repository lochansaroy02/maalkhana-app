"use client";

import InputComponent from "@/components/InputComponent";
import DatePicker from "@/components/ui/datePicker";
import { Textarea } from "@/components/ui/textarea";
import { useTranslations } from "next-intl";
import NewBadge from "./NewBadge";

export interface LicenseWeaponData {
    receiptNo: string;
    policeStation: string;
    licenseNo: string;
    ownerName: string;
    address: string;
    mobile: string;
    weaponName: string;
    weaponNo: string;
    depositDate?: Date;
    depositReason: string;
    rackNo: string;
}

export const EMPTY_LICENSE_DATA: LicenseWeaponData = {
    receiptNo: "",
    policeStation: "",
    licenseNo: "",
    ownerName: "",
    address: "",
    mobile: "",
    weaponName: "",
    weaponNo: "",
    depositDate: undefined,
    depositReason: "",
    rackNo: "",
};

export const LICENSE_REQUIRED_FIELDS: (keyof LicenseWeaponData)[] = [
    "receiptNo",
    "policeStation",
    "licenseNo",
    "ownerName",
    "weaponName",
    "depositDate",
];

/** Builds the form state from a saved MalkhanaEntry row. */
export const licenseDataFromEntry = (data: any): LicenseWeaponData => {
    const d = data?.depositDate ? new Date(data.depositDate) : undefined;
    return {
        receiptNo: data?.receiptNo || "",
        policeStation: data?.policeStation || "",
        licenseNo: data?.licenseNo || "",
        ownerName: data?.ownerName || data?.vadiName || "",
        address: data?.address || "",
        mobile: data?.mobile || "",
        weaponName: data?.weaponName || "",
        weaponNo: data?.weaponNo || "",
        depositDate: d && !isNaN(d.getTime()) ? d : undefined,
        depositReason: data?.depositReason || "",
        rackNo: data?.rackNo || "",
    };
};

/** Maps the form to a MalkhanaEntry payload (required legacy columns get safe values). */
export const licenseDataToPayload = (v: LicenseWeaponData) => {
    const receipt = v.receiptNo.trim();
    const deposit = v.depositDate && !isNaN(v.depositDate.getTime()) ? v.depositDate.toISOString() : "";
    return {
        entryType: "licensedWeapon",
        receiptNo: receipt,
        policeStation: v.policeStation.trim(),
        licenseNo: v.licenseNo.trim(),
        ownerName: v.ownerName.trim(),
        address: v.address.trim(),
        mobile: v.mobile.trim(),
        weaponName: v.weaponName.trim(),
        weaponNo: v.weaponNo.trim(),
        depositDate: deposit,
        depositReason: v.depositReason.trim(),
        rackNo: v.rackNo.trim(),
        // Shared columns, so licensed weapons show up sensibly in existing reports,
        // search and barcode generation.
        srNo: /^\d+$/.test(receipt) ? Number(receipt) : null,
        firNo: null,
        gdNo: null,
        gdDate: deposit,
        Year: v.depositDate ? v.depositDate.getFullYear() : new Date().getFullYear(),
        caseProperty: [v.weaponName.trim(), v.weaponNo.trim() && `(${v.weaponNo.trim()})`].filter(Boolean).join(" "),
        description: v.depositReason.trim(),
        vadiName: v.ownerName.trim(),
        place: v.rackNo.trim(),
        status: "deposited",
        underSection: "",
        accused: "",
        IOName: "",
        HM: "",
        courtNo: "",
        courtName: "",
        wineType: "",
        wine: 0,
        cash: 0,
        yellowItemPrice: 0,
    };
};

const LicenseWeaponForm = ({
    value,
    onChange,
}: {
    value: LicenseWeaponData;
    onChange: (next: LicenseWeaponData) => void;
}) => {
    const t = useTranslations("entry.malkhanaEntryForm.licenseForm");
    const set = (k: keyof LicenseWeaponData, v: any) => onChange({ ...value, [k]: v });
    const req = (k: keyof LicenseWeaponData) => (LICENSE_REQUIRED_FIELDS.includes(k) ? " *" : "");

    const text = (k: keyof LicenseWeaponData, type = "text") => (
        <InputComponent
            key={k}
            label={`${t(k)}${req(k)}`}
            type={type}
            value={value[k] as string}
            setInput={(e) => set(k, type === "tel" ? e.target.value.replace(/[^\d+ -]/g, "") : e.target.value)}
        />
    );

    return (
        <div className="mt-2">
            <h2 className="mb-3 flex items-center gap-2 border-l-4 border-maroon pl-3 text-lg font-semibold text-blue-100">{t("title")} <NewBadge /></h2>
            <div className="grid gap-2 lg:grid-cols-2">
                {text("receiptNo")}
                {text("policeStation")}
                {text("licenseNo")}
                {text("ownerName")}
                {text("address")}
                {text("mobile", "tel")}
                {text("weaponName")}
                {text("weaponNo")}
                <DatePicker label={`${t("depositDate")}${req("depositDate")}`} date={value.depositDate} setDate={(d) => set("depositDate", d)} />
                {text("rackNo")}
                <div className="flex flex-col gap-1 lg:col-span-2">
                    <label className="text-blue-100" htmlFor="depositReason">{t("depositReason")}</label>
                    <Textarea
                        id="depositReason"
                        className="text-blue-100"
                        value={value.depositReason}
                        onChange={(e) => set("depositReason", e.target.value)}
                    />
                </div>
            </div>
        </div>
    );
};

export default LicenseWeaponForm;
