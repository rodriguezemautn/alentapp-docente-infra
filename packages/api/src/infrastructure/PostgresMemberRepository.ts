import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '../generated/client/client.js';
import { MemberRepository } from '../domain/MemberRepository.js';
import { MemberDTO, CreateMemberRequest, UpdateMemberRequest, MemberReportResponse } from '@alentapp/shared';

if (!process.env.DATABASE_URL) {
    throw new Error('DATABASE_URL environment variable is not set');
}

const prisma = new PrismaClient({
    adapter: new PrismaPg(process.env.DATABASE_URL),
});

type DBMember = {
    id: string;
    dni: string;
    name: string;
    email: string;
    birthdate: Date | null;
    category: 'Pleno' | 'Cadete' | 'Honorario';
    status: 'Activo' | 'Moroso' | 'Suspendido';
    created_at: Date;
};

export class PostgresMemberRepository implements MemberRepository {
    async create(data: CreateMemberRequest): Promise<MemberDTO> {
        const member = await prisma.member.create({
            data: {
                dni: data.dni,
                name: data.name,
                email: data.email,
                birthdate: new Date(data.birthdate),
                category: data.category,
            },
        });

        return this.mapToDTO(member);
    }

    async findById(id: string): Promise<MemberDTO | null> {
        const member = await prisma.member.findUnique({
            where: { id },
        });

        return member ? this.mapToDTO(member) : null;
    }

    async findByDni(dni: string): Promise<MemberDTO | null> {
        const member = await prisma.member.findUnique({
            where: { dni },
        });

        return member ? this.mapToDTO(member) : null;
    }

    async findAll(): Promise<MemberDTO[]> {
        const members = await prisma.member.findMany({
            orderBy: { created_at: 'desc' },
        });

        return members.map(this.mapToDTO);
    }

    async update(id: string, data: UpdateMemberRequest): Promise<MemberDTO> {
        const member = await prisma.member.update({
            where: { id },
            data: {
                ...(data.dni && { dni: data.dni }),
                ...(data.name && { name: data.name }),
                ...(data.email && { email: data.email }),
                ...(data.birthdate && { birthdate: new Date(data.birthdate) }),
                ...(data.category && { category: data.category }),
                ...(data.status && { status: data.status }),
                ...(data.sportCategory !== undefined && { sportCategory: data.sportCategory }),
            },
        });

        return this.mapToDTO(member);
    }

    async delete(id: string): Promise<void> {
        await prisma.member.delete({
            where: { id },
        });
    }

    async getMemberReport(): Promise<MemberReportResponse> {
        const [members, monthlyData] = await Promise.all([
            prisma.member.findMany(),
            prisma.$queryRaw<Array<{ month: string; count: bigint }>>`
                SELECT TO_CHAR(created_at, 'YYYY-MM') as month, COUNT(*)::bigint as count
                FROM members
                WHERE created_at >= NOW() - INTERVAL '12 months'
                GROUP BY month
                ORDER BY month ASC
            `,
        ]);

        const total = members.length;
        const byCategory = { Pleno: 0, Cadete: 0, Honorario: 0 };
        const byStatus = { Activo: 0, Moroso: 0, Suspendido: 0 };

        for (const m of members) {
            const cat = m.category as keyof typeof byCategory;
            if (cat in byCategory) byCategory[cat]++;
            const st = m.status as keyof typeof byStatus;
            if (st in byStatus) byStatus[st]++;
        }

        const delinquencyRate = total > 0 ? Math.round((byStatus.Moroso / total) * 100) : 0;

        return {
            total,
            byCategory,
            byStatus,
            delinquencyRate,
            monthlyRegistrations: monthlyData.map((m) => ({
                month: m.month,
                count: Number(m.count),
            })),
        };
    }

    private mapToDTO(member: DBMember): MemberDTO {
        return {
            id: member.id,
            dni: member.dni,
            name: member.name,
            email: member.email,
            birthdate: member.birthdate ? member.birthdate.toISOString().split('T')[0] : '', // Extract YYYY-MM-DD
            category: member.category,
            status: member.status,
            sportCategory: (member as any).sportCategory || undefined,
            created_at: member.created_at.toISOString(),
        };
    }
}
