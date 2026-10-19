-- CreateTable
CREATE TABLE "contact_inquiries" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT,
    "phone" TEXT,
    "topic" TEXT,
    "category" TEXT,
    "orderNumber" TEXT,
    "message" TEXT NOT NULL,
    "source" TEXT NOT NULL DEFAULT 'Client Concierge Desk',
    "priority" TEXT NOT NULL DEFAULT 'NORMAL',
    "status" TEXT NOT NULL DEFAULT 'NEW',
    "adminNotes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "contact_inquiries_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "contact_inquiries_status_idx" ON "contact_inquiries"("status");

-- CreateIndex
CREATE INDEX "contact_inquiries_source_idx" ON "contact_inquiries"("source");

-- CreateIndex
CREATE INDEX "contact_inquiries_createdAt_idx" ON "contact_inquiries"("createdAt");

-- CreateIndex
CREATE INDEX "contact_inquiries_email_idx" ON "contact_inquiries"("email");

-- CreateIndex
CREATE INDEX "contact_inquiries_phone_idx" ON "contact_inquiries"("phone");
