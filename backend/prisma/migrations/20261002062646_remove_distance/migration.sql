/*
  Warnings:

  - You are about to drop the column `distance` on the `partner_stores` table. All the data in the column will be lost.
  - You are about to drop the column `distanceMiles` on the `partner_stores` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "partner_stores" DROP COLUMN "distance",
DROP COLUMN "distanceMiles";
