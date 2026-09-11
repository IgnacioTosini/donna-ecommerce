ALTER TABLE "Product" ADD COLUMN "sizeGuide" TEXT;
ALTER TABLE "Order" ADD COLUMN "stockDeducted" BOOLEAN NOT NULL DEFAULT false;
-- Existing non-cancelled orders already deducted stock under the previous flow.
-- Keep that fact to prevent a second deduction or a missing restoration.
UPDATE "Order" SET "stockDeducted" = true WHERE "status" <> 'CANCELLED';
