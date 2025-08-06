/*
  Warnings:

  - You are about to drop the column `policeStationId` on the `MalkhanaEntry` table. All the data in the column will be lost.
  - You are about to drop the column `policeStationId` on the `MalkhanaMovement` table. All the data in the column will be lost.
  - You are about to drop the column `policeStationId` on the `MalkhanaRelease` table. All the data in the column will be lost.
  - You are about to drop the column `policeStationId` on the `SeizedVehicle` table. All the data in the column will be lost.
  - You are about to drop the `PoliceStation` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "MalkhanaEntry" DROP CONSTRAINT "MalkhanaEntry_policeStationId_fkey";

-- DropForeignKey
ALTER TABLE "MalkhanaMovement" DROP CONSTRAINT "MalkhanaMovement_policeStationId_fkey";

-- DropForeignKey
ALTER TABLE "MalkhanaRelease" DROP CONSTRAINT "MalkhanaRelease_policeStationId_fkey";

-- DropForeignKey
ALTER TABLE "PoliceStation" DROP CONSTRAINT "PoliceStation_districtId_fkey";

-- DropForeignKey
ALTER TABLE "SeizedVehicle" DROP CONSTRAINT "SeizedVehicle_policeStationId_fkey";

-- AlterTable
ALTER TABLE "MalkhanaEntry" DROP COLUMN "policeStationId",
ADD COLUMN     "userId" TEXT;

-- AlterTable
ALTER TABLE "MalkhanaMovement" DROP COLUMN "policeStationId",
ADD COLUMN     "userId" TEXT;

-- AlterTable
ALTER TABLE "MalkhanaRelease" DROP COLUMN "policeStationId",
ADD COLUMN     "userId" TEXT;

-- AlterTable
ALTER TABLE "SeizedVehicle" DROP COLUMN "policeStationId",
ADD COLUMN     "userId" TEXT;

-- DropTable
DROP TABLE "PoliceStation";

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "districtId" TEXT NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_districtId_fkey" FOREIGN KEY ("districtId") REFERENCES "District"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SeizedVehicle" ADD CONSTRAINT "SeizedVehicle_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MalkhanaEntry" ADD CONSTRAINT "MalkhanaEntry_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MalkhanaMovement" ADD CONSTRAINT "MalkhanaMovement_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MalkhanaRelease" ADD CONSTRAINT "MalkhanaRelease_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
