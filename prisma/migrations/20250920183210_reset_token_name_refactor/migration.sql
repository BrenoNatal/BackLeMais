/*
  Warnings:

  - You are about to drop the column `resettoken` on the `User` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "public"."User" DROP COLUMN "resettoken",
ADD COLUMN     "resetToken" TEXT;
