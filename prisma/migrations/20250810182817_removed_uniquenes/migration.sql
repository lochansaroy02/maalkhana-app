-- DropIndex
DROP INDEX "MalkhanaEntry_firNo_key";

-- DropIndex
DROP INDEX "MalkhanaEntry_srNo_key";

-- DropIndex
DROP INDEX "SeizedVehicle_srNo_key";

-- AlterTable
ALTER TABLE "SeizedVehicle" ALTER COLUMN "underSection" DROP DEFAULT;
