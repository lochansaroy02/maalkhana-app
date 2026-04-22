-- /*
--   Warnings:

--   - You are about to drop the column `receiverName` on the `SeizedVehicle` table. All the data in the column will be lost.

-- */
-- -- AlterTable
-- ALTER TABLE "SeizedVehicle" DROP COLUMN "receiverName",
-- ADD COLUMN     "receiverName" TEXT;
-- 20250813032231_fixed_reciver_name/migration.sql