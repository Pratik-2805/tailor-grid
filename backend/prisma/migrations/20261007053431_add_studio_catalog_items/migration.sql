-- CreateTable
CREATE TABLE "studio_catalog_items" (
    "id" TEXT NOT NULL,
    "studioId" TEXT NOT NULL,
    "userId" TEXT,
    "categoryId" TEXT NOT NULL,
    "categoryName" TEXT NOT NULL,
    "serviceId" TEXT,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "price" DOUBLE PRECISION NOT NULL,
    "partnerPayout" DOUBLE PRECISION,
    "turnaroundDays" INTEGER NOT NULL DEFAULT 2,
    "avgTurnaround" TEXT NOT NULL DEFAULT '48 hours',
    "enabled" BOOLEAN NOT NULL DEFAULT true,
    "isCustom" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "studio_catalog_items_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "studio_catalog_items_studioId_idx" ON "studio_catalog_items"("studioId");

-- CreateIndex
CREATE INDEX "studio_catalog_items_userId_idx" ON "studio_catalog_items"("userId");

-- CreateIndex
CREATE INDEX "studio_catalog_items_categoryId_idx" ON "studio_catalog_items"("categoryId");
