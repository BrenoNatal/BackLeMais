/*
  Warnings:

  - You are about to alter the column `objective` on the `Meta` table. The data in that column could be lost. The data in that column will be cast from `DoublePrecision` to `Integer`.

*/
-- AlterTable
ALTER TABLE "Meta" ALTER COLUMN "objective" SET DATA TYPE INTEGER;
