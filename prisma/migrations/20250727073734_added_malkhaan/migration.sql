-- CreateTable
CREATE TABLE "SeizedProperty" (
    "id" TEXT NOT NULL,
    "srNo" TEXT NOT NULL,
    "gdNo" TEXT NOT NULL,
    "gdDate" TEXT NOT NULL,
    "underSection" TEXT NOT NULL,
    "Year" TEXT NOT NULL,
    "IOName" TEXT NOT NULL,
    "vadiName" TEXT NOT NULL,
    "HM" TEXT NOT NULL,
    "accused" TEXT NOT NULL,
    "firNo" TEXT,
    "status" TEXT NOT NULL,
    "entryType" TEXT NOT NULL,
    "place" TEXT NOT NULL,
    "boxNo" TEXT NOT NULL,
    "courtNo" TEXT NOT NULL,
    "courtName" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SeizedProperty_pkey" PRIMARY KEY ("id")
);
