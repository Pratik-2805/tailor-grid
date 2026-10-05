-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT,
    "contact" TEXT,
    "phone" TEXT,
    "avatar" TEXT,
    "address" TEXT,
    "postcode" TEXT,
    "method" TEXT NOT NULL DEFAULT 'email',
    "password" TEXT,
    "role" TEXT NOT NULL DEFAULT 'CUSTOMER',
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "studioId" TEXT,
    "studioName" TEXT,
    "measurements" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "otp_verifications" (
    "id" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "verified" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "otp_verifications_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "garment_categories" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "tagline" TEXT,
    "startingPrice" DOUBLE PRECISION NOT NULL,
    "avgTurnaround" TEXT NOT NULL DEFAULT '48 hours',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "garment_categories_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "alteration_services" (
    "id" TEXT NOT NULL,
    "categoryId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "customerPrice" DOUBLE PRECISION NOT NULL,
    "partnerPayout" DOUBLE PRECISION NOT NULL,
    "platformFee" DOUBLE PRECISION NOT NULL,
    "turnaroundDays" INTEGER NOT NULL DEFAULT 2,
    "popular" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "alteration_services_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "partner_stores" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT,
    "phone" TEXT,
    "area" TEXT NOT NULL,
    "address" TEXT NOT NULL,
    "postcode" TEXT NOT NULL,
    "rating" DOUBLE PRECISION NOT NULL DEFAULT 4.9,
    "reviewCount" INTEGER NOT NULL DEFAULT 100,
    "openingHours" TEXT NOT NULL DEFAULT '09:00 - 19:00',
    "dailyCapacity" INTEGER NOT NULL DEFAULT 25,
    "machines" INTEGER NOT NULL DEFAULT 6,
    "workers" INTEGER NOT NULL DEFAULT 4,
    "leadTailor" TEXT NOT NULL,
    "specialties" TEXT[],
    "retailSold" BOOLEAN NOT NULL DEFAULT true,
    "lat" DOUBLE PRECISION NOT NULL,
    "lng" DOUBLE PRECISION NOT NULL,
    "distance" TEXT,
    "distanceMiles" DOUBLE PRECISION,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "partner_stores_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "orders" (
    "id" TEXT NOT NULL,
    "userId" TEXT,
    "customerName" TEXT NOT NULL,
    "customerEmail" TEXT NOT NULL,
    "customerPhone" TEXT,
    "postcode" TEXT NOT NULL,
    "garmentId" TEXT NOT NULL,
    "garmentName" TEXT NOT NULL,
    "serviceId" TEXT NOT NULL,
    "serviceName" TEXT NOT NULL,
    "storeId" TEXT,
    "storeName" TEXT,
    "storePhone" TEXT,
    "date" TEXT NOT NULL,
    "timeSlot" TEXT NOT NULL,
    "garmentBrand" TEXT,
    "fitNotes" TEXT,
    "pinnedAdjustment" TEXT,
    "sewingNotes" TEXT,
    "slaHours" INTEGER NOT NULL DEFAULT 48,
    "partnerPayout" DOUBLE PRECISION NOT NULL DEFAULT 18.0,
    "retailSold" BOOLEAN NOT NULL DEFAULT false,
    "retailValue" DOUBLE PRECISION,
    "retailCategory" TEXT,
    "assignedWorker" TEXT,
    "machineNo" TEXT,
    "hangTagNo" TEXT,
    "intakePhotoUrl" TEXT,
    "fabricConditionNotes" TEXT,
    "priceAdjustment" DOUBLE PRECISION,
    "priceAdjustmentReason" TEXT,
    "priceAdjustmentStatus" TEXT NOT NULL DEFAULT 'NONE',
    "slaStartedAt" TIMESTAMP(3),
    "rating" DOUBLE PRECISION,
    "ratingFeedback" TEXT,
    "customerLat" DOUBLE PRECISION,
    "customerLng" DOUBLE PRECISION,
    "tailorLat" DOUBLE PRECISION,
    "tailorLng" DOUBLE PRECISION,
    "status" TEXT NOT NULL DEFAULT 'Allocated',
    "price" DOUBLE PRECISION NOT NULL,
    "otp" TEXT NOT NULL,
    "otpExpiresAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "orders_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "newsletter_subscriptions" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "source" TEXT NOT NULL DEFAULT 'footer',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "newsletter_subscriptions_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "users_phone_key" ON "users"("phone");

-- CreateIndex
CREATE INDEX "users_email_idx" ON "users"("email");

-- CreateIndex
CREATE INDEX "users_phone_idx" ON "users"("phone");

-- CreateIndex
CREATE INDEX "otp_verifications_phone_idx" ON "otp_verifications"("phone");

-- CreateIndex
CREATE INDEX "alteration_services_categoryId_idx" ON "alteration_services"("categoryId");

-- CreateIndex
CREATE INDEX "partner_stores_area_idx" ON "partner_stores"("area");

-- CreateIndex
CREATE INDEX "partner_stores_postcode_idx" ON "partner_stores"("postcode");

-- CreateIndex
CREATE INDEX "partner_stores_email_idx" ON "partner_stores"("email");

-- CreateIndex
CREATE INDEX "partner_stores_phone_idx" ON "partner_stores"("phone");

-- CreateIndex
CREATE INDEX "orders_userId_idx" ON "orders"("userId");

-- CreateIndex
CREATE INDEX "orders_customerEmail_idx" ON "orders"("customerEmail");

-- CreateIndex
CREATE INDEX "orders_customerPhone_idx" ON "orders"("customerPhone");

-- CreateIndex
CREATE INDEX "orders_storeId_idx" ON "orders"("storeId");

-- CreateIndex
CREATE INDEX "orders_status_idx" ON "orders"("status");

-- CreateIndex
CREATE UNIQUE INDEX "newsletter_subscriptions_email_key" ON "newsletter_subscriptions"("email");

-- CreateIndex
CREATE INDEX "newsletter_subscriptions_email_idx" ON "newsletter_subscriptions"("email");

-- CreateIndex
CREATE INDEX "newsletter_subscriptions_status_idx" ON "newsletter_subscriptions"("status");

-- AddForeignKey
ALTER TABLE "alteration_services" ADD CONSTRAINT "alteration_services_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "garment_categories"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "orders" ADD CONSTRAINT "orders_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "orders" ADD CONSTRAINT "orders_storeId_fkey" FOREIGN KEY ("storeId") REFERENCES "partner_stores"("id") ON DELETE SET NULL ON UPDATE CASCADE;
