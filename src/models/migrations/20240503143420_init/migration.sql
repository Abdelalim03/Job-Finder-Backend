/*
  Warnings:

  - A unique constraint covering the columns `[wilaya]` on the table `Address` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[commune]` on the table `Address` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "Address_wilaya_key" ON "Address"("wilaya");

-- CreateIndex
CREATE UNIQUE INDEX "Address_commune_key" ON "Address"("commune");
