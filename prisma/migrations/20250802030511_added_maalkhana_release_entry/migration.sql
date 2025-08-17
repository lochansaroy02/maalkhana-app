/*
  Warnings:

  - You are about to drop the `Demo` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropTable
DROP TABLE "Demo";

-- CreateTable
CREATE TABLE "MaalkhanaRelease" (
    "id" TEXT NOT NULL,
    "srNo" TEXT NOT NULL,
    "moveDate" TEXT NOT NULL,
    "firNo" TEXT NOT NULL,
    "underSection" TEXT NOT NULL,
    "takenOutBy" TEXT NOT NULL,
    "moveTrackingNo" TEXT NOT NULL,
    "movePurpose" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "receiverName" TEXT NOT NULL,
    "fathersName" TEXT NOT NULL,
    "address" TEXT NOT NULL,
    "mobile" TEXT NOT NULL,
    "releaseItemNam" TEXT NOT NULL,
    "photo" TEXT,
    "document" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MaalkhanaRelease_pkey" PRIMARY KEY ("id")
);
