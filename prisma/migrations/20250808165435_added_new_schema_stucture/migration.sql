/*
  Warnings:

  - You are about to drop the `MalkhanaMovement` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `MalkhanaRelease` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[srNo]` on the table `MalkhanaEntry` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[srNo]` on the table `SeizedVehicle` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `address` to the `SeizedVehicle` table without a default value. This is not possible if the table is not empty.
  - Added the required column `fathersName` to the `SeizedVehicle` table without a default value. This is not possible if the table is not empty.
  - Added the required column `mobile` to the `SeizedVehicle` table without a default value. This is not possible if the table is not empty.
  - Added the required column `recevierName` to the `SeizedVehicle` table without a default value. This is not possible if the table is not empty.
  - Added the required column `releaseItemName` to the `SeizedVehicle` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "MalkhanaMovement" DROP CONSTRAINT "MalkhanaMovement_userId_fkey";

-- DropForeignKey
ALTER TABLE "MalkhanaRelease" DROP CONSTRAINT "MalkhanaRelease_userId_fkey";

-- AlterTable
ALTER TABLE "MalkhanaEntry" ADD COLUMN     "address" TEXT,
ADD COLUMN     "document" TEXT,
ADD COLUMN     "fathersName" TEXT,
ADD COLUMN     "isReturned" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "mobile" TEXT,
ADD COLUMN     "moveDate" TEXT,
ADD COLUMN     "movePurpose" TEXT,
ADD COLUMN     "moveTrackingNo" TEXT,
ADD COLUMN     "name" TEXT,
ADD COLUMN     "photo" TEXT,
ADD COLUMN     "receviedBy" TEXT,
ADD COLUMN     "recevierName" TEXT,
ADD COLUMN     "releaseItemName" TEXT,
ADD COLUMN     "returnBackFrom" TEXT,
ADD COLUMN     "returnDate" TIMESTAMP(3),
ADD COLUMN     "takenOutBy" TEXT,
ALTER COLUMN "srNo" DROP NOT NULL;

-- AlterTable
ALTER TABLE "SeizedVehicle" ADD COLUMN     "address" TEXT NOT NULL,
ADD COLUMN     "document" TEXT,
ADD COLUMN     "fathersName" TEXT NOT NULL,
ADD COLUMN     "isReturned" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "mobile" TEXT NOT NULL,
ADD COLUMN     "movePurpose" TEXT,
ADD COLUMN     "moveTrackingNo" TEXT,
ADD COLUMN     "name" TEXT,
ADD COLUMN     "photo" TEXT,
ADD COLUMN     "receviedBy" TEXT,
ADD COLUMN     "recevierName" TEXT NOT NULL,
ADD COLUMN     "releaseItemName" TEXT NOT NULL,
ADD COLUMN     "returnBackFrom" TEXT,
ADD COLUMN     "returnDate" TIMESTAMP(3),
ADD COLUMN     "takenOutBy" TEXT,
ALTER COLUMN "srNo" DROP NOT NULL;

-- DropTable
DROP TABLE "MalkhanaMovement";

-- DropTable
DROP TABLE "MalkhanaRelease";

-- CreateIndex
CREATE UNIQUE INDEX "MalkhanaEntry_srNo_key" ON "MalkhanaEntry"("srNo");

-- CreateIndex
CREATE UNIQUE INDEX "SeizedVehicle_srNo_key" ON "SeizedVehicle"("srNo");
