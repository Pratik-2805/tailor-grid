-- AlterTable
ALTER TABLE "partner_stores" DROP COLUMN IF EXISTS "distance",
DROP COLUMN IF EXISTS "distanceMiles",
ADD COLUMN IF NOT EXISTS "email" TEXT,
ALTER COLUMN "phone" DROP DEFAULT;

-- CreateIndex
CREATE INDEX IF NOT EXISTS "partner_stores_email_idx" ON "partner_stores"("email");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "partner_stores_phone_idx" ON "partner_stores"("phone");
