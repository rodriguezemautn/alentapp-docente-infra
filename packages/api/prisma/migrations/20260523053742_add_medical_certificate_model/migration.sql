-- CreateTable
CREATE TABLE "medical_certificates" (
    "id" TEXT NOT NULL,
    "memberId" TEXT NOT NULL,
    "issueDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expirationDate" TIMESTAMP(3),
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "description" TEXT,
    "doctorName" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "medical_certificates_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "medical_certificates" ADD CONSTRAINT "medical_certificates_memberId_fkey" FOREIGN KEY ("memberId") REFERENCES "members"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
