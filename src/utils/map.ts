export const orderedKeys = [
    "firNo", "srNo", "gdNo", "gdDate", "underSection", "caseProperty", "policeStation", "IOName", "vadiName", "accused", "status", "entryType", "place", "boxNo", "courtNo", "courtName", "address", "fathersName", "mobile", "name", "releaseItemName", "returnDate", "description", "wine", "wineType", "Year", "HM", "moveDate", "movePurpose", "moveTrackingNo", "returnBackFrom", "takenOutBy", "receivedBy", "receiverName", "photoUrl", "documentUrl", "cash", "isMovement", "isRelease", "yellowItemPrice", "dbName",
];
export const exportMap = {
    "SR. No.": "srNo",
    "FIR No.": "firNo",
    "GD No.": "gdNo",
    "GD Date": "gdDate",
    "Under Section": "underSection",
    "Description": "description",
    "Case Property": "caseProperty",
    "Police Station": "policeStation",
    "Year": "Year",
    "IO Name": "IOName",
    "Vadi Name": "vadiName",
    "Accused": "accused",
    "Status": "status",
    "Entry Type": "entryType",
    "Place": "place",
    "Box No.": "boxNo",
    "Court No.": "courtNo",
    "Court Name": "courtName",
    "Cash": "cash",
    "Wine": "wine",
    "Wine Type": "wineType",
    "HM": "HM",
};

export const headerMap = {
    "क्र0सं0": "srlNO",
    "fir No": "firNo",
    "Sr No": "srNo",
    "Gd no": "gdNo",
    "Gd Date": "gdDate",
    "under section": "underSection",
    "description": "description",
    "year": "Year",
    "policestatiion": "policeStation",
    "विवेचक का नाम": "IOName",
    "वादी का नाम": "vadiName",
    "एचएम दाखिल कर्ता का नाम": "HM",
    "accused": "accused",
    "status": "status",
    "entry type": "entryType",
    "box no": "boxNo",
    "court no": "courtNo",
    "court name": "courtName",
    "case protery": "caseProperty", // Corrected typo
    "wine": "wine",
    "cash": "cash",
    "wine type": "wineType",
    "place": "place",
};

export const keysFromExcel = Object.values(headerMap);
export const excelHeaders = Object.keys(headerMap);
export const reportKeys = Object.values(headerMap)


