import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '../generated/client/client.js';
import { DisciplineRepository, DisciplineFilters } from '../domain/DisciplineRepository.js';
import { DisciplineDetailDTO, CreateDisciplineRequest, UpdateDisciplineRequest } from '@alentapp/shared';

if (!process.env.DATABASE_URL) {
    throw new Error('DATABASE_URL environment variable is not set');
}

const prisma = new PrismaClient({
    adapter: new PrismaPg(process.env.DATABASE_URL),
});

type DBDisciplineWithSport = {
    id: string;
    sportId: string;
    name: string;
    description: string | null;
    startDate: Date;
    endDate: Date;
    schedule: string | null;
    professor: string | null;
    created_at: Date;
    sport: {
        name: string;
    };
};

type DBDiscipline = {
    id: string;
    sportId: string;
    name: string;
    description: string | null;
    startDate: Date;
    endDate: Date;
    schedule: string | null;
    professor: string | null;
    created_at: Date;
};

export class PostgresDisciplineRepository implements DisciplineRepository {
    async create(data: CreateDisciplineRequest): Promise<DisciplineDetailDTO> {
        const discipline = await prisma.discipline.create({
            data: {
                sportId: data.sportId,
                name: data.name,
                description: data.description || null,
                startDate: new Date(data.startDate),
                endDate: new Date(data.endDate),
                schedule: data.schedule || null,
                professor: data.professor || null,
            },
            include: {
                sport: {
                    select: { name: true },
                },
            },
        });
        return this.mapToDetailDTO(discipline as DBDisciplineWithSport);
    }

    async findById(id: string): Promise<DisciplineDetailDTO | null> {
        const discipline = await prisma.discipline.findUnique({
            where: { id },
            include: {
                sport: {
                    select: { name: true },
                },
            },
        });
        if (!discipline) return null;
        return this.mapToDetailDTO(discipline as DBDisciplineWithSport);
    }

    async findAll(filters?: DisciplineFilters): Promise<DisciplineDetailDTO[]> {
        const disciplines = await prisma.discipline.findMany({
            where: {
                ...(filters?.sportId ? { sportId: filters.sportId } : {}),
            },
            include: {
                sport: {
                    select: { name: true },
                },
            },
            orderBy: { created_at: 'desc' },
        });
        return disciplines.map((d) => this.mapToDetailDTO(d as unknown as DBDisciplineWithSport));
    }

    async update(id: string, data: UpdateDisciplineRequest): Promise<DisciplineDetailDTO> {
        const updateData: Record<string, unknown> = {};
        if (data.name !== undefined) updateData.name = data.name;
        if (data.description !== undefined) updateData.description = data.description;
        if (data.startDate !== undefined) updateData.startDate = new Date(data.startDate);
        if (data.endDate !== undefined) updateData.endDate = new Date(data.endDate);
        if (data.schedule !== undefined) updateData.schedule = data.schedule;
        if (data.professor !== undefined) updateData.professor = data.professor;

        const discipline = await prisma.discipline.update({
            where: { id },
            data: updateData,
            include: {
                sport: {
                    select: { name: true },
                },
            },
        });
        return this.mapToDetailDTO(discipline as DBDisciplineWithSport);
    }

    async delete(id: string): Promise<void> {
        await prisma.discipline.delete({ where: { id } });
    }

    private mapToDetailDTO(d: DBDisciplineWithSport): DisciplineDetailDTO {
        return {
            id: d.id,
            sportId: d.sportId,
            name: d.name,
            description: d.description || undefined,
            startDate: d.startDate.toISOString().split('T')[0],
            endDate: d.endDate.toISOString().split('T')[0],
            schedule: d.schedule || undefined,
            professor: d.professor || undefined,
            created_at: d.created_at.toISOString(),
            sportName: d.sport.name,
        };
    }
}
