/*
  Warnings:

  - You are about to drop the column `color` on the `ProductVariant` table. All the data in the column will be lost.
  - You are about to drop the column `size` on the `ProductVariant` table. All the data in the column will be lost.
  - You are about to drop the column `sku` on the `ProductVariant` table. All the data in the column will be lost.
  - You are about to drop the column `stock` on the `ProductVariant` table. All the data in the column will be lost.
  - Added the required column `colorHex` to the `ProductVariant` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "OrderItem" ADD COLUMN     "productSizeStockId" TEXT;

-- AlterTable
ALTER TABLE "ProductVariant" DROP COLUMN "color",
DROP COLUMN "size",
DROP COLUMN "sku",
DROP COLUMN "stock",
ADD COLUMN     "colorHex" TEXT NOT NULL,
ADD COLUMN     "name" TEXT;

-- CreateTable
CREATE TABLE "ProductSizeStock" (
    "id" TEXT NOT NULL,
    "size" TEXT NOT NULL,
    "stock" INTEGER NOT NULL DEFAULT 0,
    "sku" TEXT,
    "variantId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ProductSizeStock_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ProductSizeStock_variantId_idx" ON "ProductSizeStock"("variantId");

-- CreateIndex
CREATE UNIQUE INDEX "ProductSizeStock_variantId_size_key" ON "ProductSizeStock"("variantId", "size");

-- AddForeignKey
ALTER TABLE "ProductSizeStock" ADD CONSTRAINT "ProductSizeStock_variantId_fkey" FOREIGN KEY ("variantId") REFERENCES "ProductVariant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrderItem" ADD CONSTRAINT "OrderItem_productSizeStockId_fkey" FOREIGN KEY ("productSizeStockId") REFERENCES "ProductSizeStock"("id") ON DELETE SET NULL ON UPDATE CASCADE;
