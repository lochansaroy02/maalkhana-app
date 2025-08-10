/*
  Warnings:

  - You are about to drop the column `receviedBy` on the `MalkhanaEntry` table. All the data in the column will be lost.
  - You are about to drop the column `recevierName` on the `MalkhanaEntry` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "MalkhanaEntry" DROP COLUMN "receviedBy",
DROP COLUMN "recevierName",
ADD COLUMN     "caseProperty" TEXT,
ADD COLUMN     "receivedBy" TEXT,
ADD COLUMN     "receiverName" TEXT;
