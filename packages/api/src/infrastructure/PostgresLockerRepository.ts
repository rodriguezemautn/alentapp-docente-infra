import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '../generated/client/client.js';
import { LockerRepository, LockerAssignmentLogRepository } from '../domain/LockerRepository.js';
import { LockerDTO, LockerDetailDTO, CreateLockerRequest, UpdateLockerRequest, LockerAssignmentLogDTO, LockerReportResponse } from '@alentapp/shared';

if (!process.env.DATABASE_URL) {
    throw new Error('DATABASE_URL environment variable is not set');
}

const prisma = new PrismaClient({
    adapter: new PrismaPg(process.env.DATABASE_URL),
});

type DBLocker = {
    id: string;
    number: number;
    location: string | null;
    status: string;
    memberId: string | null;
    created_at: Date;
};

export class PostgresLockerRepository implements LockerRepository {
    async create(data: CreateLockerRequest): Promise<LockerDTO> {
        const locker = await prisma.locker.create({
            data: {
                number: data.number,
                location: data.location || null,
            },
        });
        return this.mapToDTO(locker);
    }

    async findById(id: string): Promise<LockerDetailDTO | null> {
        const locker = await prisma.locker.findUnique({
            where: { id },
            include: { member: { select: { name: true } } },
        });
        if (!locker) return null;
        return {
            ...this.mapToDTO(locker),
            memberName: locker.member?.name,
        };
    }

    async findByNumber(number: number): Promise<LockerDTO | null> {
        const locker = await prisma.locker.findUnique({ where: { number } });
        return locker ? this.mapToDTO(locker) : null;
    }

    async findAll(status?: string): Promise<LockerDetailDTO[]> {
        const lockers = await prisma.locker.findMany({
            where: status ? { status: status as any } : undefined,
            orderBy: { number: 'asc' },
            include: { member: { select: { name: true } } },
        });
        return lockers.map((locker) => ({
            ...this.mapToDTO(locker),
            memberName: locker.member?.name,
        }));
    }

    async update(id: string, data: UpdateLockerRequest): Promise<LockerDTO> {
        const locker = await prisma.locker.update({
            where: { id },
            data: {
                ...(data.number !== undefined && { number: data.number }),
                ...(data.location !== undefined && { location: data.location }),
                ...(data.status !== undefined && { status: data.status as any }),
                ...(data.memberId !== undefined && { memberId: data.memberId }),
            },
        });
        return this.mapToDTO(locker);
    }

    async delete(id: string): Promise<void> {
        await prisma.locker.delete({ where: { id } });
    }

    async getLockerReport(): Promise<LockerReportResponse> {
        const lockers = await prisma.locker.findMany();
        const total = lockers.length;
        const available = lockers.filter((l) => l.status === 'Available').length;
        const occupied = lockers.filter((l) => l.status === 'Occupied').length;
        const maintenance = lockers.filter((l) => l.status === 'Maintenance').length;
        const occupancyRate = total > 0 ? Math.round((occupied / total) * 100) : 0;

        return { total, available, occupied, maintenance, occupancyRate };
    }

    private mapToDTO(locker: DBLocker): LockerDTO {
        return {
            id: locker.id,
            number: locker.number,
            location: locker.location || undefined,
            status: locker.status as LockerDTO['status'],
            memberId: locker.memberId || undefined,
            created_at: locker.created_at.toISOString(),
        };
    }
}

export class PostgresLockerAssignmentLogRepository implements LockerAssignmentLogRepository {
    async create(event: {
        lockerId: string;
        memberId: string;
        eventType: 'Assignment' | 'Release';
        assignedAt: Date;
        releasedAt?: Date;
    }): Promise<void> {
        await prisma.lockerAssignmentLog.create({
            data: {
                lockerId: event.lockerId,
                memberId: event.memberId,
                eventType: event.eventType as any,
                assignedAt: event.assignedAt,
                releasedAt: event.releasedAt,
            },
        });
    }

    async findByLocker(lockerId: string): Promise<LockerAssignmentLogDTO[]> {
        const logs = await prisma.lockerAssignmentLog.findMany({
            where: { lockerId },
            orderBy: { created_at: 'desc' },
            include: {
                locker: { select: { number: true } },
                member: { select: { name: true } },
            },
        });
        return logs.map((log) => ({
            id: log.id,
            lockerId: log.lockerId,
            lockerNumber: log.locker.number,
            memberId: log.memberId,
            memberName: log.member.name,
            eventType: log.eventType as LockerAssignmentLogDTO['eventType'],
            assignedAt: log.assignedAt.toISOString(),
            releasedAt: log.releasedAt?.toISOString(),
            created_at: log.created_at.toISOString(),
        }));
    }

    async findByMember(memberId: string): Promise<LockerAssignmentLogDTO[]> {
        const logs = await prisma.lockerAssignmentLog.findMany({
            where: { memberId },
            orderBy: { created_at: 'desc' },
            include: {
                locker: { select: { number: true } },
                member: { select: { name: true } },
            },
        });
        return logs.map((log) => ({
            id: log.id,
            lockerId: log.lockerId,
            lockerNumber: log.locker.number,
            memberId: log.memberId,
            memberName: log.member.name,
            eventType: log.eventType as LockerAssignmentLogDTO['eventType'],
            assignedAt: log.assignedAt.toISOString(),
            releasedAt: log.releasedAt?.toISOString(),
            created_at: log.created_at.toISOString(),
        }));
    }
}
