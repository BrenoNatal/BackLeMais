/*
  Warnings:

  - You are about to drop the `CategoryOnGoal` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "CategoryOnGoal" DROP CONSTRAINT "CategoryOnGoal_categoryId_fkey";

-- DropForeignKey
ALTER TABLE "CategoryOnGoal" DROP CONSTRAINT "CategoryOnGoal_goalId_fkey";

-- DropTable
DROP TABLE "CategoryOnGoal";

-- CreateTable
CREATE TABLE "_CategoryToGoal" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_CategoryToGoal_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE INDEX "_CategoryToGoal_B_index" ON "_CategoryToGoal"("B");

-- AddForeignKey
ALTER TABLE "_CategoryToGoal" ADD CONSTRAINT "_CategoryToGoal_A_fkey" FOREIGN KEY ("A") REFERENCES "Category"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_CategoryToGoal" ADD CONSTRAINT "_CategoryToGoal_B_fkey" FOREIGN KEY ("B") REFERENCES "Goal"("id") ON DELETE CASCADE ON UPDATE CASCADE;
