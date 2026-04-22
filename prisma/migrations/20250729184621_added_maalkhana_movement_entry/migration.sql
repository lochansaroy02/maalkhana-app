-- CreateTable
CREATE TABLE "MaalkhanaMovement" (
    "id" TEXT NOT NULL,
    "srNo" TEXT NOT NULL,
    "moveDate" TIMESTAMP(3) NOT NULL,
    "firNo." TEXT NOT NULL,
    "underSection" TEXT NOT NULL,
    "takenOutBy" TEXT NOT NULL,
    "moveTrackingNo" TEXT NOT NULL,
    "movePurpose" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "photo" TEXT NOT NULL,
    "document" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MaalkhanaMovement_pkey" PRIMARY KEY ("id")
);
