/*
  Warnings:

  - A unique constraint covering the columns `[type,threshold]` on the table `Achievement` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "Achievement_type_threshold_key" ON "Achievement"("type", "threshold");
