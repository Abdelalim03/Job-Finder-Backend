-- AlterEnum
ALTER TYPE "Status" ADD VALUE 'approved';

-- DropForeignKey
ALTER TABLE "Message" DROP CONSTRAINT "Message_workId_fkey";

-- DropForeignKey
ALTER TABLE "WorkReview" DROP CONSTRAINT "WorkReview_workId_fkey";

-- AlterTable
ALTER TABLE "Message" ALTER COLUMN "seen" SET DEFAULT false;

-- AddForeignKey
ALTER TABLE "Message" ADD CONSTRAINT "Message_workId_fkey" FOREIGN KEY ("workId") REFERENCES "Work"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WorkReview" ADD CONSTRAINT "WorkReview_workId_fkey" FOREIGN KEY ("workId") REFERENCES "Work"("id") ON DELETE CASCADE ON UPDATE CASCADE;
