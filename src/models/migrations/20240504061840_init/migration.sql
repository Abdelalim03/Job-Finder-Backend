-- DropForeignKey
ALTER TABLE "TaskImage" DROP CONSTRAINT "TaskImage_taskId_fkey";

-- AddForeignKey
ALTER TABLE "TaskImage" ADD CONSTRAINT "TaskImage_taskId_fkey" FOREIGN KEY ("taskId") REFERENCES "Task"("id") ON DELETE CASCADE ON UPDATE CASCADE;
