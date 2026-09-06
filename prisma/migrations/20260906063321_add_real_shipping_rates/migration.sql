-- AlterTable
ALTER TABLE "Listing" ADD COLUMN     "packageSize" TEXT,
ADD COLUMN     "shipFromZip" TEXT,
ADD COLUMN     "shipsAvailable" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "weightLbs" DOUBLE PRECISION;
