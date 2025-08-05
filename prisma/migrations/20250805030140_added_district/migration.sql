/*
  Warnings:

  - You are about to drop the `MaalkhanaEntry` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `MaalkhanaMovement` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `MaalkhanaRelease` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `districtId` to the `SeizedVehicle` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "SeizedVehicle" ADD COLUMN     "districtId" TEXT NOT NULL;

-- DropTable
DROP TABLE "MaalkhanaEntry";

-- DropTable
DROP TABLE "MaalkhanaMovement";

-- DropTable
DROP TABLE "MaalkhanaRelease";

-- CreateTable
CREATE TABLE "District" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "District_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MalkhanaEntry" (
    "id" TEXT NOT NULL,
    "wine" INTEGER,
    "wineType" TEXT NOT NULL,
    "srNo" TEXT NOT NULL,
    "gdNo" TEXT NOT NULL,
    "gdDate" TEXT NOT NULL,
    "underSection" TEXT NOT NULL,
    "Year" TEXT NOT NULL,
    "policeStation" TEXT NOT NULL,
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
    "districtId" TEXT,

    CONSTRAINT "MalkhanaEntry_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MalkhanaMovement" (
    "id" TEXT NOT NULL,
    "srNo" TEXT NOT NULL,
    "moveDate" TEXT NOT NULL,
    "firNo" TEXT NOT NULL,
    "underSection" TEXT NOT NULL,
    "takenOutBy" TEXT NOT NULL,
    "moveTrackingNo" TEXT NOT NULL,
    "movePurpose" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "photo" TEXT,
    "document" TEXT,
    "isReturned" BOOLEAN NOT NULL DEFAULT false,
    "receviedBy" TEXT NOT NULL,
    "returnBackFrom" TEXT NOT NULL,
    "returnDate" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "districtId" TEXT,

    CONSTRAINT "MalkhanaMovement_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MalkhanaRelease" (
    "id" TEXT NOT NULL,
    "srNo" TEXT NOT NULL,
    "moveDate" TEXT NOT NULL,
    "firNo" TEXT NOT NULL,
    "underSection" TEXT NOT NULL,
    "takenOutBy" TEXT NOT NULL,
    "moveTrackingNo" TEXT NOT NULL,
    "movePurpose" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "recevierName" TEXT NOT NULL,
    "fathersName" TEXT NOT NULL,
    "address" TEXT NOT NULL,
    "mobile" TEXT NOT NULL,
    "releaseItemName" TEXT NOT NULL,
    "photo" TEXT,
    "document" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "districtId" TEXT,

    CONSTRAINT "MalkhanaRelease_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "District_email_key" ON "District"("email");

-- AddForeignKey
ALTER TABLE "SeizedVehicle" ADD CONSTRAINT "SeizedVehicle_districtId_fkey" FOREIGN KEY ("districtId") REFERENCES "District"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MalkhanaEntry" ADD CONSTRAINT "MalkhanaEntry_districtId_fkey" FOREIGN KEY ("districtId") REFERENCES "District"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MalkhanaMovement" ADD CONSTRAINT "MalkhanaMovement_districtId_fkey" FOREIGN KEY ("districtId") REFERENCES "District"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MalkhanaRelease" ADD CONSTRAINT "MalkhanaRelease_districtId_fkey" FOREIGN KEY ("districtId") REFERENCES "District"("id") ON DELETE SET NULL ON UPDATE CASCADE;
