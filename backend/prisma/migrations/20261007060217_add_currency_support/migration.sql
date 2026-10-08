-- AlterTable
ALTER TABLE "orders" ADD COLUMN     "currency" TEXT NOT NULL DEFAULT 'GBP',
ADD COLUMN     "currencySymbol" TEXT NOT NULL DEFAULT '£';

-- AlterTable
ALTER TABLE "partner_stores" ADD COLUMN     "currency" TEXT NOT NULL DEFAULT 'GBP',
ADD COLUMN     "currencySymbol" TEXT NOT NULL DEFAULT '£';

-- AlterTable
ALTER TABLE "studio_catalog_items" ADD COLUMN     "currency" TEXT NOT NULL DEFAULT 'GBP',
ADD COLUMN     "currencySymbol" TEXT NOT NULL DEFAULT '£';

-- AlterTable
ALTER TABLE "users" ADD COLUMN     "currency" TEXT NOT NULL DEFAULT 'GBP',
ADD COLUMN     "currencySymbol" TEXT NOT NULL DEFAULT '£';
