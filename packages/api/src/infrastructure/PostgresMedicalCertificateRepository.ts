import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '../generated/client/client.js';
import { MedicalCertificateRepository } from '../domain/MedicalCertificateRepository.js';
import {
    MedicalCertificateDTO,
    CreateMedicalCertificateRequest,
} from '@alentapp/shared';

if (!process.env.DATABASE_URL) {
    throw new Error('DATABASE_URL environment variable is not set');
}

const prisma = new PrismaClient({
    adapter: new PrismaPg(process.env.DATABASE_URL),
});

type DBMedicalCertificate = {
    id: string;
    memberId: string;
    issueDate: Date;
    expirationDate: Date | null;
    isActive: boolean;
    description: string | null;
    doctorName: string | null;
    created_at: Date;
};

export class PostgresMedicalCertificateRepository implements MedicalCertificateRepository {
    async create(data: CreateMedicalCertificateRequest): Promise<MedicalCertificateDTO> {
        const certificate = await prisma.medicalCertificate.create({
            data: {
                memberId: data.memberId,
                issueDate: new Date(),
                expirationDate: data.expirationDate ? new Date(data.expirationDate) : null,
                description: data.description ?? null,
                doctorName: data.doctorName ?? null,
            },
        });
        return this.mapToDTO(certificate);
    }

    async findActiveByMember(memberId: string): Promise<MedicalCertificateDTO | null> {
        const certificate = await prisma.medicalCertificate.findFirst({
            where: { memberId, isActive: true },
        });
        return certificate ? this.mapToDTO(certificate) : null;
    }

    async deactivateAllByMember(memberId: string): Promise<void> {
        await prisma.medicalCertificate.updateMany({
            where: { memberId, isActive: true },
            data: { isActive: false },
        });
    }

    async createWithDeactivation(data: CreateMedicalCertificateRequest): Promise<MedicalCertificateDTO> {
        return prisma.$transaction(async (tx) => {
            await tx.medicalCertificate.updateMany({
                where: { memberId: data.memberId, isActive: true },
                data: { isActive: false },
            });

            const certificate = await tx.medicalCertificate.create({
                data: {
                    memberId: data.memberId,
                    issueDate: new Date(),
                    expirationDate: data.expirationDate ? new Date(data.expirationDate) : null,
                    description: data.description ?? null,
                    doctorName: data.doctorName ?? null,
                },
            });

            return this.mapToDTO(certificate);
        });
    }

    private mapToDTO(cert: DBMedicalCertificate): MedicalCertificateDTO {
        return {
            id: cert.id,
            memberId: cert.memberId,
            issueDate: cert.issueDate.toISOString(),
            expirationDate: cert.expirationDate?.toISOString(),
            isActive: cert.isActive,
            description: cert.description ?? undefined,
            doctorName: cert.doctorName ?? undefined,
            created_at: cert.created_at.toISOString(),
        };
    }
}
