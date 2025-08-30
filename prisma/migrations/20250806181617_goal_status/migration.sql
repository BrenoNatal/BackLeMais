-- CreateEnum
CREATE TYPE "GoalStatus" AS ENUM ('ONGOING', 'COMPLETED', 'EXPIRED');

-- AlterTable
ALTER TABLE "Goal" ADD COLUMN     "status" "GoalStatus" NOT NULL DEFAULT 'ONGOING';
