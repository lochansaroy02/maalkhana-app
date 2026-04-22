/*
  Warnings:

  - You are about to drop the column `firNo.` on the `MaalkhanaMovement` table. All the data in the column will be lost.
  - Added the required column `firNo` to the `MaalkhanaMovement` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "MaalkhanaMovement" DROP COLUMN "firNo.",
ADD COLUMN     "firNo" TEXT NOT NULL,
ALTER COLUMN "moveDate" SET DATA TYPE TEXT;
