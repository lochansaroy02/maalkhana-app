/*
  Warnings:

  - You are about to drop the column `receiverName` on the `SeizedVehicle` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "SeizedVehicle" DROP COLUMN "receiverName",
ADD COLUMN     "recevierName" TEXT;
