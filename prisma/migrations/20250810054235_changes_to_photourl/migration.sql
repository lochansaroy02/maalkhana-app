/*
  Warnings:

  - You are about to drop the column `photo` on the `SeizedVehicle` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "SeizedVehicle" DROP COLUMN "photo",
ADD COLUMN     "photoUrl" TEXT;
