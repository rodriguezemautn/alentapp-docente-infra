-- CreateEnum
CREATE TYPE "SportCategory" AS ENUM ('Senior', 'Lifetime', 'Cadet');

-- CreateEnum
CREATE TYPE "LockerStatus" AS ENUM ('Available', 'Occupied', 'Maintenance');

-- CreateEnum
CREATE TYPE "LockerEventType" AS ENUM ('Assignment', 'Release');

-- CreateEnum
CREATE TYPE "LoanStatus" AS ENUM ('Active', 'Returned', 'Lost');

-- AlterTable
ALTER TABLE "members" ADD COLUMN     "sportCategory" "SportCategory";

-- CreateTable
CREATE TABLE "lockers" (
    "id" TEXT NOT NULL,
    "number" INTEGER NOT NULL,
    "location" TEXT,
    "status" "LockerStatus" NOT NULL DEFAULT 'Available',
    "memberId" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "lockers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "locker_assignment_logs" (
    "id" TEXT NOT NULL,
    "lockerId" TEXT NOT NULL,
    "memberId" TEXT NOT NULL,
    "eventType" "LockerEventType" NOT NULL,
    "assignedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "releasedAt" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "locker_assignment_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "equipment_loans" (
    "id" TEXT NOT NULL,
    "memberId" TEXT NOT NULL,
    "equipmentName" TEXT NOT NULL,
    "loanDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "returnDate" TIMESTAMP(3),
    "status" "LoanStatus" NOT NULL DEFAULT 'Active',
    "notes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "equipment_loans_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "lockers_number_key" ON "lockers"("number");

-- AddForeignKey
ALTER TABLE "lockers" ADD CONSTRAINT "lockers_memberId_fkey" FOREIGN KEY ("memberId") REFERENCES "members"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "locker_assignment_logs" ADD CONSTRAINT "locker_assignment_logs_lockerId_fkey" FOREIGN KEY ("lockerId") REFERENCES "lockers"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "locker_assignment_logs" ADD CONSTRAINT "locker_assignment_logs_memberId_fkey" FOREIGN KEY ("memberId") REFERENCES "members"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "equipment_loans" ADD CONSTRAINT "equipment_loans_memberId_fkey" FOREIGN KEY ("memberId") REFERENCES "members"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
