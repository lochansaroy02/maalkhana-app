/*
  Warnings:

  - You are about to drop the column `createdAt` on the `District` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `District` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "MalkhanaEntry" DROP CONSTRAINT "MalkhanaEntry_districtId_fkey";

-- DropForeignKey
ALTER TABLE "MalkhanaMovement" DROP CONSTRAINT "MalkhanaMovement_districtId_fkey";

-- DropForeignKey
ALTER TABLE "MalkhanaRelease" DROP CONSTRAINT "MalkhanaRelease_districtId_fkey";

-- DropForeignKey
ALTER TABLE "SeizedVehicle" DROP CONSTRAINT "SeizedVehicle_districtId_fkey";

-- AlterTable
ALTER TABLE "District" DROP COLUMN "createdAt",
DROP COLUMN "updatedAt";

-- AlterTable
ALTER TABLE "MalkhanaEntry" ADD COLUMN     "policeStationId" TEXT;

-- AlterTable
ALTER TABLE "MalkhanaMovement" ADD COLUMN     "policeStationId" TEXT;

-- AlterTable
ALTER TABLE "MalkhanaRelease" ADD COLUMN     "policeStationId" TEXT;

-- AlterTable
ALTER TABLE "SeizedVehicle" ADD COLUMN     "policeStationId" TEXT;

-- CreateTable
CREATE TABLE "PoliceStation" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "districtId" TEXT,

    CONSTRAINT "PoliceStation_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "PoliceStation" ADD CONSTRAINT "PoliceStation_districtId_fkey" FOREIGN KEY ("districtId") REFERENCES "District"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SeizedVehicle" ADD CONSTRAINT "SeizedVehicle_policeStationId_fkey" FOREIGN KEY ("policeStationId") REFERENCES "PoliceStation"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MalkhanaEntry" ADD CONSTRAINT "MalkhanaEntry_policeStationId_fkey" FOREIGN KEY ("policeStationId") REFERENCES "PoliceStation"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MalkhanaMovement" ADD CONSTRAINT "MalkhanaMovement_policeStationId_fkey" FOREIGN KEY ("policeStationId") REFERENCES "PoliceStation"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MalkhanaRelease" ADD CONSTRAINT "MalkhanaRelease_policeStationId_fkey" FOREIGN KEY ("policeStationId") REFERENCES "PoliceStation"("id") ON DELETE SET NULL ON UPDATE CASCADE;
