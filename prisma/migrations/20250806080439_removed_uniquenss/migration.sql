/*
  Warnings:

  - Made the column `districtId` on table `PoliceStation` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE "PoliceStation" DROP CONSTRAINT "PoliceStation_districtId_fkey";

-- AlterTable
ALTER TABLE "PoliceStation" ALTER COLUMN "districtId" SET NOT NULL;

-- AddForeignKey
ALTER TABLE "PoliceStation" ADD CONSTRAINT "PoliceStation_districtId_fkey" FOREIGN KEY ("districtId") REFERENCES "District"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
