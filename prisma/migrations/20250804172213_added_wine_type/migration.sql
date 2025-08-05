-- AlterTable
ALTER TABLE "MaalkhanaEntry" ADD COLUMN     "wineType" TEXT NOT NULL DEFAULT 'Desi';

-- AlterTable
ALTER TABLE "MaalkhanaMovement" ALTER COLUMN "isReturned" SET DEFAULT false;
