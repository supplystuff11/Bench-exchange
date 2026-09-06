-- AlterTable
ALTER TABLE "Listing" ADD COLUMN     "shippingCents" INTEGER;

-- AlterTable
ALTER TABLE "Order" ADD COLUMN     "shippingAddress" TEXT,
ADD COLUMN     "shippingCents" INTEGER NOT NULL DEFAULT 0;
