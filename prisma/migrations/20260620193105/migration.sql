-- CreateEnum
CREATE TYPE "BannerPlacement" AS ENUM ('HERO', 'PROMO', 'COLLECTION');

-- AlterTable
ALTER TABLE "Banner" ADD COLUMN     "placement" "BannerPlacement" NOT NULL DEFAULT 'HERO';

-- CreateIndex
CREATE INDEX "Banner_placement_idx" ON "Banner"("placement");
