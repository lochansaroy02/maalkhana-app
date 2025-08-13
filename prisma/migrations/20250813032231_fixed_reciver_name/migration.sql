/*
  Warnings:

  - You are about to drop the column `recevierName` on the `SeizedVehicle` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "SeizedVehicle" DROP COLUMN "recevierName",
ADD COLUMN     "receiverName" TEXT;
