/*
  Warnings:

  - A unique constraint covering the columns `[email]` on the table `PoliceStation` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `updatedAt` to the `District` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `PoliceStation` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "District" ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "PoliceStation" ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "PoliceStation_email_key" ON "PoliceStation"("email");
