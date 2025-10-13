-- DropForeignKey
ALTER TABLE "public"."UserOnGroup" DROP CONSTRAINT "UserOnGroup_groupId_fkey";

-- AddForeignKey
ALTER TABLE "public"."UserOnGroup" ADD CONSTRAINT "UserOnGroup_groupId_fkey" FOREIGN KEY ("groupId") REFERENCES "public"."Group"("id") ON DELETE CASCADE ON UPDATE CASCADE;
