/*
  Warnings:

  - A unique constraint covering the columns `[wilaya,commune]` on the table `Address` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "Address_commune_key";

-- DropIndex
DROP INDEX "Address_wilaya_key";

-- CreateIndex
CREATE UNIQUE INDEX "Address_wilaya_commune_key" ON "Address"("wilaya", "commune");
