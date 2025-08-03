// constants/schemas.ts

export const expectedSchemas = {
    seizedVehicle: [
        "id",
        "srNo",
        "gdNo",
        "gdDate",
        "underSection",
        "vehicleType",
        "colour",
        "registrationNo",
        "engineNo",
        "description",
        "status",
        "policeStation",
        "ownerName",
        "seizedBy",
        "caseProperty",
        "createdAt",
        "updatedAt"
    ],
    entry: [
        "id",
        "wine",
        "srNo",
        "gdNo",
        "gdDate",
        "underSection",
        "Year",
        "IOName",
        "vadiName",
        "HM",
        "accused",
        "firNo",
        "status",
        "entryType",
        "place",
        "boxNo",
        "courtNo",
        "courtName",
        "createdAt",
        "updatedAt"
    ],
    movement: [
        "srNo",
        "moveDate",
        "takenOutBy",
        "purpose",
        "expectedReturnDate",
        "station",
        "caseProperty"
    ],
    release: [
        "srNo",
        "name",
        "firNo",
        "underSection",
        "caseProperty",
        "releaseDate",
        "releasedTo"
    ]
};
