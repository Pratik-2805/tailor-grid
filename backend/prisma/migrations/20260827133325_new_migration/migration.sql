-- AlterTable
ALTER TABLE "orders" ADD COLUMN     "assignedWorker" TEXT,
ADD COLUMN     "fabricConditionNotes" TEXT,
ADD COLUMN     "hangTagNo" TEXT,
ADD COLUMN     "intakePhotoUrl" TEXT,
ADD COLUMN     "machineNo" TEXT,
ADD COLUMN     "partnerPayout" DOUBLE PRECISION NOT NULL DEFAULT 18.0,
ADD COLUMN     "pinnedAdjustment" TEXT,
ADD COLUMN     "priceAdjustment" DOUBLE PRECISION,
ADD COLUMN     "priceAdjustmentReason" TEXT,
ADD COLUMN     "priceAdjustmentStatus" TEXT NOT NULL DEFAULT 'NONE',
ADD COLUMN     "rating" DOUBLE PRECISION,
ADD COLUMN     "ratingFeedback" TEXT,
ADD COLUMN     "retailCategory" TEXT,
ADD COLUMN     "retailSold" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "retailValue" DOUBLE PRECISION,
ADD COLUMN     "sewingNotes" TEXT,
ADD COLUMN     "slaHours" INTEGER NOT NULL DEFAULT 48,
ADD COLUMN     "slaStartedAt" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "users" ADD COLUMN     "role" TEXT NOT NULL DEFAULT 'CUSTOMER',
ADD COLUMN     "studioId" TEXT,
ADD COLUMN     "studioName" TEXT;
