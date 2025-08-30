/*
  Warnings:

  - You are about to drop the column `genre` on the `Goal` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Goal" DROP COLUMN "genre";

-- CreateTable
CREATE TABLE "CategoryOnGoal" (
    "categoryId" TEXT NOT NULL,
    "goalId" TEXT NOT NULL,

    CONSTRAINT "CategoryOnGoal_pkey" PRIMARY KEY ("categoryId","goalId")
);

-- AddForeignKey
ALTER TABLE "CategoryOnGoal" ADD CONSTRAINT "CategoryOnGoal_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "Category"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CategoryOnGoal" ADD CONSTRAINT "CategoryOnGoal_goalId_fkey" FOREIGN KEY ("goalId") REFERENCES "Goal"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
