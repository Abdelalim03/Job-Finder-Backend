/*
  Warnings:

  - You are about to drop the column `daira` on the `Address` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Address" DROP COLUMN "daira";

-- DropEnum
DROP TYPE "Role";
