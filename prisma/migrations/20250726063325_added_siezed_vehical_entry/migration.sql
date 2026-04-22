-- CreateTable
CREATE TABLE "SeizedVehicle" (
    "id" TEXT NOT NULL,
    "srNo" TEXT NOT NULL,
    "gdNo" TEXT NOT NULL,
    "gdDate" TIMESTAMP(3) NOT NULL,
    "underSection" TEXT NOT NULL DEFAULT '207',
    "vehicleType" TEXT NOT NULL,
    "colour" TEXT NOT NULL,
    "registrationNo" TEXT NOT NULL,
    "engineNo" TEXT NOT NULL,
    "chassisNo" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "policeStation" TEXT NOT NULL,
    "ownerName" TEXT NOT NULL,
    "seizedBy" TEXT NOT NULL,
    "caseProperty" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SeizedVehicle_pkey" PRIMARY KEY ("id")
);
