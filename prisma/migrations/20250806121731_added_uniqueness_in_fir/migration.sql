/*
  Warnings:

  - A unique constraint covering the columns `[firNo]` on the table `MalkhanaEntry` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[firNo]` on the table `MalkhanaMovement` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[firNo]` on the table `MalkhanaRelease` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[firNo]` on the table `SeizedVehicle` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "MalkhanaEntry_firNo_key" ON "MalkhanaEntry"("firNo");

-- CreateIndex
CREATE UNIQUE INDEX "MalkhanaMovement_firNo_key" ON "MalkhanaMovement"("firNo");

-- CreateIndex
CREATE UNIQUE INDEX "MalkhanaRelease_firNo_key" ON "MalkhanaRelease"("firNo");

-- CreateIndex
CREATE UNIQUE INDEX "SeizedVehicle_firNo_key" ON "SeizedVehicle"("firNo");
