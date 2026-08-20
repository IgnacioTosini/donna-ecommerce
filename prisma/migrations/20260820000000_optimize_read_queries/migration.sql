-- DropIndex
DROP INDEX IF EXISTS "Banner_placement_idx";

-- CreateIndex
CREATE INDEX "Product_active_createdAt_idx" ON "Product"("active", "createdAt");

-- CreateIndex
CREATE INDEX "Product_active_featured_createdAt_idx" ON "Product"("active", "featured", "createdAt");

-- CreateIndex
CREATE INDEX "Banner_placement_active_order_idx" ON "Banner"("placement", "active", "order");

-- CreateIndex
CREATE INDEX "Order_createdAt_idx" ON "Order"("createdAt");
