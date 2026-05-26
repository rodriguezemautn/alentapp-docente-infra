import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '../generated/client/client.js';
import { EquipmentLoanRepository } from '../domain/EquipmentLoanRepository.js';
import { EquipmentLoanDTO, EquipmentLoanDetailDTO, CreateEquipmentLoanRequest, ReturnEquipmentLoanRequest } from '@alentapp/shared';

if (!process.env.DATABASE_URL) {
    throw new Error('DATABASE_URL environment variable is not set');
}

const prisma = new PrismaClient({
    adapter: new PrismaPg(process.env.DATABASE_URL),
});

type DBEquipmentLoan = {
    id: string;
    memberId: string;
    equipmentName: string;
    loanDate: Date;
    returnDate: Date | null;
    status: string;
    notes: string | null;
    created_at: Date;
};

export class PostgresEquipmentLoanRepository implements EquipmentLoanRepository {
    async create(data: CreateEquipmentLoanRequest): Promise<EquipmentLoanDTO> {
        const loan = await prisma.equipmentLoan.create({
            data: {
                memberId: data.memberId,
                equipmentName: data.equipmentName,
                notes: data.notes || null,
            },
        });
        return this.mapToDTO(loan);
    }

    async findById(id: string): Promise<EquipmentLoanDetailDTO | null> {
        const loan = await prisma.equipmentLoan.findUnique({
            where: { id },
            include: { member: { select: { name: true } } },
        });
        if (!loan) return null;
        return {
            ...this.mapToDTO(loan),
            memberName: loan.member.name,
        };
    }

    async findAll(memberId?: string, status?: string): Promise<EquipmentLoanDetailDTO[]> {
        const where: any = {};
        if (memberId) where.memberId = memberId;
        if (status) where.status = status;

        const loans = await prisma.equipmentLoan.findMany({
            where,
            orderBy: { created_at: 'desc' },
            include: { member: { select: { name: true } } },
        });
        return loans.map((loan) => ({
            ...this.mapToDTO(loan),
            memberName: loan.member.name,
        }));
    }

    async update(id: string, data: Partial<ReturnEquipmentLoanRequest & { status: string }>): Promise<EquipmentLoanDTO> {
        const updateData: any = {};
        if (data.status !== undefined) updateData.status = data.status;
        if (data.returnDate !== undefined) updateData.returnDate = new Date(data.returnDate);
        if (data.notes !== undefined) updateData.notes = data.notes;

        const loan = await prisma.equipmentLoan.update({
            where: { id },
            data: updateData,
        });
        return this.mapToDTO(loan);
    }

    async delete(id: string): Promise<void> {
        await prisma.equipmentLoan.delete({ where: { id } });
    }

    private mapToDTO(loan: DBEquipmentLoan): EquipmentLoanDTO {
        return {
            id: loan.id,
            memberId: loan.memberId,
            equipmentName: loan.equipmentName,
            loanDate: loan.loanDate.toISOString(),
            returnDate: loan.returnDate?.toISOString() || undefined,
            status: loan.status as EquipmentLoanDTO['status'],
            notes: loan.notes || undefined,
            created_at: loan.created_at.toISOString(),
        };
    }
}
