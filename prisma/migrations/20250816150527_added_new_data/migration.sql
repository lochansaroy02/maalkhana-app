/*
  Warnings:

  - Added the required column `yellowItemPrice` to the `MalkhanaEntry` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "MalkhanaEntry" ADD COLUMN     "yellowItemPrice" INTEGER NOT NULL;
