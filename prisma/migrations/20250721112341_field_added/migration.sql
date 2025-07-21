-- CreateTable
CREATE TABLE "Demo" (
    "id" SERIAL NOT NULL,
    "gdNo" TEXT NOT NULL,
    "policeStation" TEXT NOT NULL,
    "vadiName" TEXT NOT NULL,
    "accusedName" TEXT NOT NULL,
    "underSection" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "place" TEXT NOT NULL,

    CONSTRAINT "Demo_pkey" PRIMARY KEY ("id")
);
