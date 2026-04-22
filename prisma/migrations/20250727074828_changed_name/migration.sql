/*
  Warnings:

  - You are about to drop the `SeizedProperty` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropTable
DROP TABLE "SeizedProperty";

-- CreateTable
CREATE TABLE "MaalkhanaEntry" (
    "id" TEXT NOT NULL,
    "srNo" TEXT NOT NULL,
    "gdNo" TEXT NOT NULL,
    "gdDate" TEXT NOT NULL,
    "underSection" TEXT NOT NULL,
    "Year" TEXT NOT NULL,
    "IOName" TEXT NOT NULL,
    "vadiName" TEXT NOT NULL,
    "HM" TEXT NOT NULL,
    "accused" TEXT NOT NULL,
    "firNo" TEXT,
    "status" TEXT NOT NULL,
    "entryType" TEXT NOT NULL,
    "place" TEXT NOT NULL,
    "boxNo" TEXT NOT NULL,
    "courtNo" TEXT NOT NULL,
    "courtName" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MaalkhanaEntry_pkey" PRIMARY KEY ("id")
);
