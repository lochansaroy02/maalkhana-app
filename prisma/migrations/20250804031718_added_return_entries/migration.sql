/*
  Warnings:

  - Added the required column `isReturned` to the `MaalkhanaMovement` table without a default value. This is not possible if the table is not empty.
  - Added the required column `receviedBy` to the `MaalkhanaMovement` table without a default value. This is not possible if the table is not empty.
  - Added the required column `returnBackFrom` to the `MaalkhanaMovement` table without a default value. This is not possible if the table is not empty.
  - Added the required column `returnDate` to the `MaalkhanaMovement` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "MaalkhanaMovement" ADD COLUMN     "isReturned" BOOLEAN NOT NULL,
ADD COLUMN     "receviedBy" TEXT NOT NULL,
ADD COLUMN     "returnBackFrom" TEXT NOT NULL,
ADD COLUMN     "returnDate" TIMESTAMP(3) NOT NULL;
