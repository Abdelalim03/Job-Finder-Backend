/*
  Warnings:

  - You are about to drop the column `tasksCount` on the `Tasker` table. All the data in the column will be lost.
  - You are about to drop the column `description` on the `User` table. All the data in the column will be lost.
  - Added the required column `seen` to the `Message` table without a default value. This is not possible if the table is not empty.
  - Changed the type of `price` on the `Task` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Added the required column `amount` to the `Tasker` table without a default value. This is not possible if the table is not empty.
  - Added the required column `description` to the `Tasker` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Message" ADD COLUMN     "seen" BOOLEAN NOT NULL;

-- AlterTable
ALTER TABLE "Task" DROP COLUMN "price",
ADD COLUMN     "price" DOUBLE PRECISION NOT NULL;

-- AlterTable
ALTER TABLE "Tasker" DROP COLUMN "tasksCount",
ADD COLUMN     "amount" DOUBLE PRECISION NOT NULL,
ADD COLUMN     "description" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "User" DROP COLUMN "description";
