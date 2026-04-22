/*
  Warnings:

  - You are about to drop the column `wineQuantity` on the `MaalkhanaEntry` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "MaalkhanaEntry" DROP COLUMN "wineQuantity",
ADD COLUMN     "wine" INTEGER;
