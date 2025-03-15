/*
  Warnings:

  - You are about to drop the column `title` on the `Meta` table. All the data in the column will be lost.
  - Added the required column `description` to the `Meta` table without a default value. This is not possible if the table is not empty.
  - Added the required column `endsAt` to the `Meta` table without a default value. This is not possible if the table is not empty.
  - Added the required column `name` to the `Meta` table without a default value. This is not possible if the table is not empty.
  - Added the required column `objective` to the `Meta` table without a default value. This is not possible if the table is not empty.
  - Added the required column `type` to the `Meta` table without a default value. This is not possible if the table is not empty.
  - Added the required column `body` to the `Note` table without a default value. This is not possible if the table is not empty.
  - Added the required column `tag` to the `Note` table without a default value. This is not possible if the table is not empty.
  - Added the required column `title` to the `Note` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Meta" DROP COLUMN "title",
ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "description" TEXT NOT NULL,
ADD COLUMN     "endsAt" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "genre" TEXT,
ADD COLUMN     "name" TEXT NOT NULL,
ADD COLUMN     "objective" DOUBLE PRECISION NOT NULL,
ADD COLUMN     "type" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "Note" ADD COLUMN     "body" TEXT NOT NULL,
ADD COLUMN     "tag" TEXT NOT NULL,
ADD COLUMN     "title" TEXT NOT NULL;
