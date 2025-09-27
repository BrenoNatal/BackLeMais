/*
  Warnings:

  - You are about to drop the column `pointsAccumulated` on the `UserOnGroup` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "public"."UserOnGroup" DROP COLUMN "pointsAccumulated",
ADD COLUMN     "pointsAccumulatedBooks" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "pointsAccumulatedPages" INTEGER NOT NULL DEFAULT 0;
