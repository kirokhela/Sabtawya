/*
  Warnings:

  - A unique constraint covering the columns `[gradeId,nameAr,gender]` on the table `ClassRoom` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `gender` to the `ClassRoom` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "ClassRoom_gradeId_nameAr_key";

-- AlterTable
ALTER TABLE "ClassRoom" ADD COLUMN     "gender" "Gender" NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "ClassRoom_gradeId_nameAr_gender_key" ON "ClassRoom"("gradeId", "nameAr", "gender");
