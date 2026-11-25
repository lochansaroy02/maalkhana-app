// Dummy test data: ~100 records for one police-station user.
//   70 Malkhana entries across every entry type (incl. 10 licensed weapons)
//   30 seized vehicles
// with a mix of in-station / movement / release / destroy / nilami states.
//
//   node --env-file=.env prisma/seed-dummy.mjs            # add
//   node --env-file=.env prisma/seed-dummy.mjs --clean    # remove what was added
//   SEED_USER_EMAIL=ps@example.com node --env-file=.env prisma/seed-dummy.mjs
//
// When the database has no users yet, a test district + police-station login
// is created (TEST_LOGIN below; local test values only) and --clean removes it.
//
// Only runs against a local database. Created ids are saved to
// prisma/.dummy-seed-ids.json so --clean deletes exactly those rows.

import bcrypt from "bcryptjs";
import { existsSync, readFileSync, unlinkSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { PrismaClient } from "../src/generated/prisma/index.js";

const here = dirname(fileURLToPath(import.meta.url));
const ID_FILE = join(here, ".dummy-seed-ids.json");

const url = process.env.DATABASE_URL || "";
const host = url.replace(/^.*@/, "").replace(/[:/].*$/, "");
if (!["localhost", "127.0.0.1", "::1"].includes(host)) {
    console.error(`Refusing to seed: DATABASE_URL host is "${host}", not a local database.`);
    process.exit(1);
}

const prisma = new PrismaClient();

/** Local-only test logins, created only when the database has no users. */
const TEST_LOGIN = {
    district: { name: "परीक्षण जनपद (Test District)", email: "district@test.local", password: "test1234" },
    station: { name: "Test SHO", email: "ps@test.local", password: "test1234", policeStation: "थाना कोतवाली नगर", mobileNo: "9000000000" },
};

// ------------------------------------------------------------------ helpers
let seed = 42;
const rand = () => ((seed = (seed * 1103515245 + 12345) % 2 ** 31) / 2 ** 31);
const pick = (arr) => arr[Math.floor(rand() * arr.length)];
const int = (min, max) => min + Math.floor(rand() * (max - min + 1));
const pad = (n, w = 2) => String(n).padStart(w, "0");
/** Local-midnight IST as ISO, the way the entry form saves gdDate. */
const istDate = (y, m, d) => new Date(Date.UTC(y, m - 1, d) - 330 * 60 * 1000).toISOString();
const randomDay = (year) => [year, int(1, 12), int(1, 28)];
const dmy = ([y, m, d]) => `${pad(d)}-${pad(m)}-${y}`;

const IO = ["उ0नि0 राजेश कुमार", "उ0नि0 सुनील यादव", "उ0नि0 अमित सिंह", "उ0नि0 प्रदीप शर्मा"];
const HM = ["हे0का0 रमेश चन्द्र", "हे0का0 विनोद कुमार", "हे0का0 संजय पाल"];
const VADI = ["राम प्रसाद", "श्याम लाल", "मोहन सिंह", "सीता देवी", "राकेश वर्मा", "गीता शर्मा"];
const ACCUSED = ["अज्ञात", "राजू पुत्र हरि", "पप्पू पुत्र रामेश्वर", "सोनू पुत्र महेश", "दीपक पुत्र सुरेश"];
const COURTS = [["CJM", "1"], ["ACJM-I", "3"], ["ADJ", "5"], ["Sessions Court", "2"]];
const CATEGORIES = ["हथियार", "इलेक्ट्रॉनिक्स", "दस्तावेज़", "आभूषण", "नकदी", "शराब", "मोबाइल", "अन्य"];

/** Entry type → section, case property, descriptions. */
const TYPES = {
    malkhana: { n: 20, sections: ["379 IPC", "411 IPC", "457/380 IPC", "25 Arms Act", "8/20 NDPS Act"], items: ["चोरी का मोबाइल फोन सैमसंग", "देशी तमंचा .315 बोर मय 2 कारतूस", "सोने की चेन 10 ग्राम", "लैपटॉप डेल मय चार्जर", "चाकू नाजायज", "गांजा 1.2 किग्रा"], category: ["मोबाइल", "हथियार", "आभूषण", "इलेक्ट्रॉनिक्स"] },
    fsl: { n: 6, sections: ["302 IPC", "376 IPC", "304B IPC"], items: ["खून आलूदा कपड़े — FSL लखनऊ भेजे गये", "विसरा सील्ड जार", "मिट्टी का नमूना सील्ड"], category: ["अन्य"] },
    kurki: { n: 5, sections: ["82/83 CrPC"], items: ["कुर्की में मिली मोटरसाइकिल", "घरेलू सामान — फ्रिज, टीवी", "बर्तन व फर्नीचर"], category: ["अन्य", "इलेक्ट्रॉनिक्स"] },
    cash: { n: 6, sections: ["379 IPC", "13 Gambling Act", "420 IPC"], items: ["नकद बरामद रुपये", "जुए की फड़ से बरामद नकदी"], category: ["नकदी"] },
    wine: { n: 7, sections: ["60 Excise Act", "63 Excise Act"], items: ["देशी शराब पव्वे", "अंग्रेजी शराब बोतलें", "कच्ची शराब ड्रम"], category: ["शराब"] },
    unclaimed: { n: 5, sections: ["102 CrPC"], items: ["लावारिस साइकिल", "लावारिस बैग मय कपड़े", "लावारिस मोबाइल"], category: ["अन्य", "मोबाइल"] },
    yellowItem: { n: 5, sections: ["379 IPC", "411 IPC"], items: ["पीली धातु की अंगूठी", "पीली धातु के कंगन जोड़ी", "पीली धातु की चेन"], category: ["आभूषण"] },
    other: { n: 6, sections: ["379 IPC", "420 IPC"], items: ["फर्जी दस्तावेज़ फाइल", "नकली नोट छापने की मशीन", "सिम कार्ड 25 अदद"], category: ["दस्तावेज़", "इलेक्ट्रॉनिक्स"], customType: ["अन्य माल", "आयुद्ध अधि0", "जुआ अधि0"] },
};

const WEAPONS = [["DBBL गन 12 बोर", "DB"], ["SBBL गन 12 बोर", "SB"], ["रिवाल्वर .32 बोर", "RV"], ["पिस्टल .32 बोर", "PT"], ["राइफल .315 बोर", "RF"]];
const DEPOSIT_REASONS = ["चुनाव के दौरान जमा", "लाइसेंस नवीनीकरण लंबित", "न्यायालय आदेश", "स्वेच्छा से जमा"];

const VEHICLES = [
    ["मोटरसाइकिल", "हीरो स्प्लेंडर", "काला"], ["मोटरसाइकिल", "बजाज पल्सर", "लाल"], ["स्कूटी", "होंडा एक्टिवा", "सफेद"],
    ["कार", "मारुति स्विफ्ट", "सिल्वर"], ["कार", "महिंद्रा बोलेरो", "सफेद"], ["ट्रैक्टर", "महिंद्रा 575", "लाल"],
    ["ट्रक", "टाटा 407", "पीला"], ["ई-रिक्शा", "ई-रिक्शा", "हरा"],
];
const VEHICLE_SECTIONS = ["207 MV Act", "379 IPC", "60 Excise Act", "41/102 CrPC"];

// ------------------------------------------------------------------ status mix
/** Spread activity states so every report filter has data. */
const activityFor = (i, year) => {
    const day = randomDay(year + 1 > 2026 ? 2026 : year + 1);
    switch (i % 10) {
        case 1: // movement out (not yet returned)
            return { status: "pending", isMovement: true, moveDate: istDate(...day), movePurpose: pick(["FSL परीक्षण", "न्यायालय में पेशी"]), takenOutBy: pick(IO), moveTrackingNo: `MT${int(1000, 9999)}` };
        case 2: // movement returned
            return { status: "pending", isMovement: true, isReturned: true, moveDate: istDate(...day), movePurpose: "न्यायालय में पेशी", takenOutBy: pick(IO), returnBackFrom: "न्यायालय", receivedBy: pick(HM), returnDate: new Date(istDate(...day)) };
        case 3: { // released
            const [court, courtNo] = pick(COURTS);
            return { status: "released", isRelease: true, releaseDate: new Date(istDate(...day)), releaseItemName: "पूर्ण माल", releaseOrderedBy: `${court} कोर्ट नं0 ${courtNo}`, receiverName: pick(VADI) };
        }
        case 4: // destroyed
            return { status: "destroy", isDestroy: true, destroyDate: new Date(istDate(...day)), destroyOrderedBy: "जिलाधिकारी", destroyPurpose: "न्यायालय आदेश से विनष्टीकरण" };
        case 5: // nilami
            return { status: "nilami", isNilami: true, nilamiDate: istDate(...day), nilamiOrderedBy: "जिलाधिकारी", nilamiValue: String(int(2, 40) * 500), nilamiItemName: "नीलाम माल" };
        case 6:
            return { status: "onCourt" };
        default:
            return { status: "pending" };
    }
};

// ------------------------------------------------------------------ main
const clean = async () => {
    if (!existsSync(ID_FILE)) {
        console.log("Nothing to clean: no prisma/.dummy-seed-ids.json found.");
        return;
    }
    const ids = JSON.parse(readFileSync(ID_FILE, "utf8"));
    const e = await prisma.malkhanaEntry.deleteMany({ where: { id: { in: ids.entries } } });
    const v = await prisma.seizedVehicle.deleteMany({ where: { id: { in: ids.vehicles } } });
    let logins = "";
    if (ids.createdUserId) {
        await prisma.user.deleteMany({ where: { id: ids.createdUserId } });
        await prisma.district.deleteMany({ where: { id: ids.createdDistrictId } });
        logins = " and the test logins";
    }
    unlinkSync(ID_FILE);
    console.log(`Removed ${e.count} Malkhana entries, ${v.count} seized vehicles${logins}.`);
};

const seedAll = async () => {
    if (existsSync(ID_FILE)) {
        console.error("Dummy data already seeded (prisma/.dummy-seed-ids.json exists). Run with --clean first.");
        process.exit(1);
    }
    const email = process.env.SEED_USER_EMAIL;
    let user = await prisma.user.findFirst({
        where: email ? { email } : { role: "policeStation" },
        orderBy: { createdAt: "asc" },
        select: { id: true, districtId: true, policeStation: true },
    });
    let createdUserId, createdDistrictId;
    if (!user && !email && (await prisma.user.count()) === 0) {
        const d = TEST_LOGIN.district, ps = TEST_LOGIN.station;
        const district = await prisma.district.create({
            data: { name: d.name, email: d.email, passwordHash: await bcrypt.hash(d.password, 10) },
        });
        user = await prisma.user.create({
            data: {
                name: ps.name, email: ps.email, passwordHash: await bcrypt.hash(ps.password, 10),
                role: "policeStation", policeStation: ps.policeStation, mobileNo: ps.mobileNo, districtId: district.id,
            },
            select: { id: true, districtId: true, policeStation: true },
        });
        createdUserId = user.id;
        createdDistrictId = district.id;
        console.log("Empty database: created a test district + police-station login (see TEST_LOGIN in this file).");
    }
    if (!user) {
        console.error(email ? "No user with SEED_USER_EMAIL." : "No police-station user found.");
        process.exit(1);
    }
    const station = user.policeStation || "थाना कोतवाली";

    const last = await prisma.malkhanaEntry.aggregate({ where: { userId: user.id }, _max: { srNo: true } });
    let srNo = (last._max.srNo || 0) + 1;
    let firSeq = 900;

    const entries = [];
    let i = 0;
    for (const [type, cfg] of Object.entries(TYPES)) {
        for (let k = 0; k < cfg.n; k++, i++) {
            const year = int(2019, 2026);
            const gd = randomDay(year);
            const [court, courtNo] = pick(COURTS);
            const item = pick(cfg.items);
            const extra = {};
            if (type === "cash") extra.cash = int(5, 200) * 100;
            if (type === "wine") { extra.wineType = pick(["desi", "angrezi"]); extra.wine = int(6, 120); }
            if (type === "yellowItem") extra.yellowItemPrice = int(10, 150) * 1000;
            entries.push({
                firNo: type === "unclaimed" ? null : `${firSeq++}/${year}`,
                srNo: srNo++,
                entryType: type === "other" ? pick(cfg.customType) : type,
                gdNo: int(1, 80),
                gdDate: istDate(...gd),
                Year: year,
                caseProperty: item.split(" ").slice(0, 3).join(" "),
                description: `${item}। माल सील्ड कर मालखाना में दाखिल किया गया। (डमी प्रविष्टि ${i + 1})`,
                underSection: pick(cfg.sections),
                vadiName: pick(VADI),
                accused: pick(ACCUSED),
                IOName: pick(IO),
                HM: pick(HM),
                policeStation: station,
                place: `अलमारी ${int(1, 6)}`,
                boxNo: int(1, 40),
                courtNo, courtName: court,
                wineType: "",
                category: pick(cfg.category),
                malkhanaRackNo: int(1, 12),
                userId: user.id,
                districtId: user.districtId,
                dbName: "m",
                ...extra,
                ...activityFor(i, year),
            });
        }
    }

    // Licensed weapons (लाइसेंसी शस्त्र) — saved the same way as the licence form.
    for (let k = 0; k < 10; k++, i++) {
        const year = int(2022, 2026);
        const dep = randomDay(year);
        const [weapon, code] = pick(WEAPONS);
        const receipt = srNo++;
        const owner = pick(VADI);
        const rack = `R-${int(1, 8)}`;
        entries.push({
            firNo: null,
            srNo: receipt,
            entryType: "licensedWeapon",
            receiptNo: String(receipt),
            licenseNo: `${int(100, 999)}/${year - int(2, 15)}`,
            ownerName: owner,
            address: `ग्राम ${pick(["रामपुर", "सिकन्दरपुर", "नगला", "शाहपुर"])}, ${station}`,
            mobile: `9${int(100000000, 999999999)}`,
            weaponName: weapon,
            weaponNo: `${code}${int(10000, 99999)}`,
            depositDate: dmy(dep),
            depositReason: pick(DEPOSIT_REASONS),
            rackNo: rack,
            gdDate: istDate(...dep),
            Year: year,
            caseProperty: weapon,
            description: `${weapon} मय ${int(0, 10)} कारतूस — लाइसेंसधारक ${owner} द्वारा जमा`,
            underSection: "",
            vadiName: owner,
            accused: "",
            IOName: "",
            HM: pick(HM),
            policeStation: station,
            place: rack,
            courtNo: "", courtName: "",
            wineType: "",
            category: "हथियार",
            malkhanaRackNo: int(1, 12),
            userId: user.id,
            districtId: user.districtId,
            dbName: "m",
            status: k % 4 === 3 ? "released" : "deposited",
            ...(k % 4 === 3 ? { isRelease: true, releaseDate: new Date(istDate(...randomDay(Math.min(year + 1, 2026)))), releaseItemName: weapon, receiverName: owner, releaseOrderedBy: "जिलाधिकारी" } : {}),
        });
    }

    // Seized vehicles
    const lastV = await prisma.seizedVehicle.findMany({ where: { userId: user.id }, select: { srNo: true } });
    let vSr = Math.max(0, ...lastV.map((v) => Number.parseInt(v.srNo || "0", 10) || 0)) + 1;
    const vehicles = [];
    for (let k = 0; k < 30; k++) {
        const year = int(2019, 2026);
        const gd = randomDay(year);
        const [type, model, colour] = pick(VEHICLES);
        const act = activityFor(k, year);
        vehicles.push({
            srNo: String(vSr++),
            firNo: k % 5 === 0 ? null : `${firSeq++}/${year}`,
            gdNo: String(int(1, 80)),
            gdDate: istDate(...gd),
            underSection: pick(VEHICLE_SECTIONS),
            rtoName: pick(["ARTO बुलन्दशहर", "ARTO अलीगढ़", "ARTO मेरठ"]),
            vehicleType: type,
            colour,
            registrationNo: `UP${pad(int(13, 85))}${pick(["A", "B", "C", "D", "AB", "BT"])}${int(1000, 9999)}`,
            engineNo: `E${int(10000000, 99999999)}`,
            description: `${model} ${colour} रंग — ${pick(["चेकिंग के दौरान बिना कागजात", "चोरी की बरामद", "शराब तस्करी में प्रयुक्त", "दुर्घटना में शामिल"])} (डमी वाहन ${k + 1})`,
            status: act.status === "onCourt" ? "pending" : act.status,
            policeStation: station,
            ownerName: pick(VADI),
            fathersName: pick(VADI),
            mobile: `8${int(100000000, 999999999)}`,
            address: `ग्राम ${pick(["रामपुर", "सिकन्दरपुर", "नगला", "शाहपुर"])}`,
            seizedBy: pick(IO),
            caseProperty: `${type} ${model}`,
            userId: user.id,
            districtId: user.districtId,
            dbName: "v",
            ...(act.isMovement ? { isMovement: true, moveDate: act.moveDate, movePurpose: act.movePurpose, takenOutBy: act.takenOutBy, moveTrackingNo: act.moveTrackingNo, isReturned: Boolean(act.isReturned), returnBackFrom: act.returnBackFrom, returnDate: act.returnDate } : {}),
            ...(act.isRelease ? { isRelease: true, releaseDate: act.releaseDate, releaseItemName: `${type} ${model}`, releaseOrderedBy: act.releaseOrderedBy, receiverName: act.receiverName } : {}),
            ...(act.isDestroy ? { isDestroy: true, destroyDate: act.destroyDate, destroyOrderedBy: act.destroyOrderedBy, destroyPurpose: act.destroyPurpose } : {}),
            ...(act.isNilami ? { isNilami: true, nilamiDate: act.nilamiDate, nilamiOrderedBy: act.nilamiOrderedBy, nilamiValue: act.nilamiValue, nilamiItemName: `${type} ${model}` } : {}),
        });
    }

    const created = await prisma.$transaction([
        ...entries.map((data) => prisma.malkhanaEntry.create({ data, select: { id: true } })),
        ...vehicles.map((data) => prisma.seizedVehicle.create({ data, select: { id: true } })),
    ]);
    const ids = {
        entries: created.slice(0, entries.length).map((r) => r.id),
        vehicles: created.slice(entries.length).map((r) => r.id),
        createdUserId,
        createdDistrictId,
    };
    writeFileSync(ID_FILE, JSON.stringify(ids, null, 2));

    const byType = entries.reduce((acc, e) => ((acc[e.entryType] = (acc[e.entryType] || 0) + 1), acc), {});
    console.log(`Seeded for station "${station}": ${entries.length} Malkhana entries + ${vehicles.length} seized vehicles.`);
    console.log("By entry type:", byType);
};

try {
    await (process.argv.includes("--clean") ? clean() : seedAll());
} finally {
    await prisma.$disconnect();
}
