/*
  Warnings:

  - You are about to drop the column `isReceived` on the `MalkhanaEntry` table. All the data in the column will be lost.
  - You are about to drop the column `isReceived` on the `SeizedVehicle` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "MalkhanaEntry" DROP COLUMN "isReceived",
ADD COLUMN     "isRelease" BOOLEAN DEFAULT false;

-- AlterTable
ALTER TABLE "SeizedVehicle" DROP COLUMN "isReceived",
ADD COLUMN     "isRelease" BOOLEAN DEFAULT false;
