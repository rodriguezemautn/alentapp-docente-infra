/*
  Warnings:

  - Added the required column `endDate` to the `disciplines` table without a default value. This is not possible if the table is not empty.
  - Added the required column `name` to the `disciplines` table without a default value. This is not possible if the table is not empty.
  - Added the required column `startDate` to the `disciplines` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "disciplines" ADD COLUMN     "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "description" TEXT,
ADD COLUMN     "endDate" DATE NOT NULL,
ADD COLUMN     "name" TEXT NOT NULL,
ADD COLUMN     "professor" TEXT,
ADD COLUMN     "schedule" TEXT,
ADD COLUMN     "startDate" DATE NOT NULL;
