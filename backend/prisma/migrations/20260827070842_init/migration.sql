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
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
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
    "area" TEXT NOT NULL,
    "address" TEXT NOT NULL,
    "postcode" TEXT NOT NULL,
    "distance" TEXT,
    "distanceMiles" DOUBLE PRECISION NOT NULL DEFAULT 0.5,
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
    "date" TEXT NOT NULL,
    "timeSlot" TEXT NOT NULL,
    "garmentBrand" TEXT,
    "fitNotes" TEXT,
    "status" TEXT NOT NULL DEFAULT 'Allocated',
    "price" DOUBLE PRECISION NOT NULL,
    "otp" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "orders_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- AddForeignKey
ALTER TABLE "alteration_services" ADD CONSTRAINT "alteration_services_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "garment_categories"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "orders" ADD CONSTRAINT "orders_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "orders" ADD CONSTRAINT "orders_storeId_fkey" FOREIGN KEY ("storeId") REFERENCES "partner_stores"("id") ON DELETE SET NULL ON UPDATE CASCADE;
