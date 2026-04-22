/*
  Warnings:

  - Added the required column `mobNo` to the `User` table without a default value. This is not possible if the table is not empty.
  - Added the required column `policeStation` to the `User` table without a default value. This is not possible if the table is not empty.
  - Added the required column `rank` to the `User` table without a default value. This is not possible if the table is not empty.
  - Added the required column `role` to the `User` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "User" ADD COLUMN     "mobNo" TEXT NOT NULL,
ADD COLUMN     "policeStation" TEXT NOT NULL,
ADD COLUMN     "rank" TEXT NOT NULL,
ADD COLUMN     "role" TEXT NOT NULL;
