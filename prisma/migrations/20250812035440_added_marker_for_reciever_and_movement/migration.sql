-- AlterTable
ALTER TABLE "MalkhanaEntry" ADD COLUMN     "isMovement" BOOLEAN DEFAULT false,
ADD COLUMN     "isReceived" BOOLEAN DEFAULT false;

-- AlterTable
ALTER TABLE "SeizedVehicle" ADD COLUMN     "isMovement" BOOLEAN DEFAULT false,
ADD COLUMN     "isReceived" BOOLEAN DEFAULT false;
