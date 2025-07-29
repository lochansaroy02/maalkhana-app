/*
  Warnings:

  - You are about to drop the column `chassisNo` on the `SeizedVehicle` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "SeizedVehicle" DROP COLUMN "chassisNo",
ALTER COLUMN "gdDate" SET DATA TYPE TEXT;
