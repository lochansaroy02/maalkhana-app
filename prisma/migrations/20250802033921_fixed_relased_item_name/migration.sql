/*
  Warnings:

  - You are about to drop the column `releaseItemNam` on the `MaalkhanaRelease` table. All the data in the column will be lost.
  - Added the required column `releaseItemName` to the `MaalkhanaRelease` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "MaalkhanaRelease" DROP COLUMN "releaseItemNam",
ADD COLUMN     "releaseItemName" TEXT NOT NULL;
