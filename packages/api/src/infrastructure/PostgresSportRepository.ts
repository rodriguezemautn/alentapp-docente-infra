import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '../generated/client/client.js';
import { SportRepository } from '../domain/SportRepository.js';
import { SportDTO, SportDetailDTO, CreateSportRequest, UpdateSportRequest } from '@alentapp/shared';

type DBSport = {
    id: string;
    name: string;
    description: string | null;
    maxCapacity: number;
    created_at: Date;
};

export class PostgresSportRepository implements SportRepository {
    private prisma: PrismaClient | null = null;

    private get client(): PrismaClient {
        if (!this.prisma) {
            if (!process.env.DATABASE_URL) {
                throw new Error('DATABASE_URL environment variable is not set');
            }
            this.prisma = new PrismaClient({
                adapter: new PrismaPg(process.env.DATABASE_URL),
            });
        }
        return this.prisma;
    }

    async create(data: CreateSportRequest): Promise<SportDTO> {
        const sport = await this.client.sport.create({
            data: {
                name: data.name,
                description: data.description || null,
                maxCapacity: data.maxCapacity,
            },
        });
        return this.mapToDTO(sport);
    }

    async findById(id: string): Promise<SportDTO | null> {
        const sport = await this.client.sport.findUnique({ where: { id } });
        return sport ? this.mapToDTO(sport) : null;
    }

    async findByName(name: string): Promise<SportDTO | null> {
        const sport = await this.client.sport.findUnique({ where: { name } });
        return sport ? this.mapToDTO(sport) : null;
    }

    async findAll(): Promise<SportDetailDTO[]> {
        const sports = await this.client.sport.findMany({
            orderBy: { created_at: 'desc' },
            include: {
                _count: {
                    select: { disciplines: true },
                },
            },
        });
        return sports.map((sport) => ({
            ...this.mapToDTO(sport),
            disciplineCount: sport._count.disciplines,
        }));
    }

    async update(id: string, data: UpdateSportRequest): Promise<SportDTO> {
        const sport = await this.client.sport.update({
            where: { id },
            data: {
                ...(data.description !== undefined && { description: data.description }),
                ...(data.maxCapacity !== undefined && { maxCapacity: data.maxCapacity }),
            },
        });
        return this.mapToDTO(sport);
    }

    async delete(id: string): Promise<void> {
        await this.client.sport.delete({ where: { id } });
    }

    async countDisciplines(sportId: string): Promise<number> {
        const count = await this.client.discipline.count({
            where: { sportId },
        });
        return count;
    }

    private mapToDTO(sport: DBSport): SportDTO {
        return {
            id: sport.id,
            name: sport.name,
            description: sport.description || undefined,
            maxCapacity: sport.maxCapacity,
            created_at: sport.created_at.toISOString(),
        };
    }
}
