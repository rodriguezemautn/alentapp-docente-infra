import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '../generated/client/client.js';
import { PaymentRepository } from '../domain/PaymentRepository.js';
import {
    PaymentDTO,
    PaymentDetailDTO,
    CreatePaymentRequest,
    PaymentFilters,
    PaymentStatus,
    PaginatedResponse,
    IncomeReportResponse,
    IncomeReportItem,
} from '@alentapp/shared';

if (!process.env.DATABASE_URL) {
    throw new Error('DATABASE_URL environment variable is not set');
}

const prisma = new PrismaClient({
    adapter: new PrismaPg(process.env.DATABASE_URL),
});

type DBPayment = {
    id: string;
    memberId: string;
    amount: any; // Prisma.Decimal
    paymentDate: Date;
    paymentType: string;
    status: string;
    created_at: Date;
};

type DBPaymentWithMember = DBPayment & {
    member: { name: string };
};

export class PostgresPaymentRepository implements PaymentRepository {
    async create(data: CreatePaymentRequest & { status: PaymentStatus }): Promise<PaymentDTO> {
        const payment = await prisma.payment.create({
            data: {
                memberId: data.memberId,
                amount: data.amount,
                paymentDate: data.paymentDate || undefined,
                paymentType: data.paymentType,
                status: data.status,
            },
        });
        return this.mapToDTO(payment);
    }

    async findById(id: string): Promise<PaymentDetailDTO | null> {
        const payment = await prisma.payment.findUnique({
            where: { id },
            include: {
                member: {
                    select: { name: true },
                },
            },
        });
        return payment ? this.mapToDetailDTO(payment as any) : null;
    }

    async findAll(filters: PaymentFilters): Promise<PaginatedResponse<PaymentDTO>> {
        const where: any = {};
        const page = filters.page || 1;
        const limit = filters.limit || 10;
        const skip = (page - 1) * limit;

        if (filters.memberId) {
            where.memberId = filters.memberId;
        }
        if (filters.paymentType) {
            where.paymentType = filters.paymentType;
        }
        if (filters.status) {
            where.status = filters.status;
        }
        if (filters.from || filters.to) {
            where.paymentDate = {};
            if (filters.from) {
                where.paymentDate.gte = new Date(filters.from);
            }
            if (filters.to) {
                where.paymentDate.lte = new Date(filters.to);
            }
        }

        const [payments, total] = await Promise.all([
            prisma.payment.findMany({
                where,
                skip,
                take: limit,
                orderBy: { created_at: 'desc' },
            }),
            prisma.payment.count({ where }),
        ]);

        return {
            data: payments.map((p) => this.mapToDTO(p)),
            total,
            page,
            limit,
        };
    }

    async update(id: string, data: Partial<PaymentDTO>): Promise<PaymentDTO> {
        const payment = await prisma.payment.update({
            where: { id },
            data: {
                ...(data.status !== undefined && { status: data.status }),
            },
        });
        return this.mapToDTO(payment);
    }

    async getIncomeReport(from: string, to: string, groupBy: string): Promise<IncomeReportResponse> {
        const payments = await prisma.payment.findMany({
            where: {
                status: 'Completed',
                paymentDate: {
                    gte: new Date(from),
                    lte: new Date(to),
                },
            },
            orderBy: { paymentDate: 'asc' },
        });

        const grouped = new Map<string, IncomeReportItem>();
        let grandTotal = 0;

        for (const p of payments) {
            let period: string;
            const d = p.paymentDate;
            if (groupBy === 'year') {
                period = `${d.getFullYear()}`;
            } else if (groupBy === 'month') {
                period = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
            } else {
                period = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
            }

            if (!grouped.has(period)) {
                grouped.set(period, {
                    period,
                    total: 0,
                    byType: { Cuota: 0, Mensualidad: 0, Inscripcion: 0, Otro: 0 },
                    canceledCount: 0,
                });
            }

            const item = grouped.get(period)!;
            const amount = Number(p.amount);
            item.total += amount;
            grandTotal += amount;

            const type = p.paymentType as keyof IncomeReportItem['byType'];
            if (type in item.byType) {
                item.byType[type] += amount;
            } else {
                item.byType['Otro'] += amount;
            }
        }

        // Obtener conteo de cancelados en el período
        const canceledCount = await prisma.payment.count({
            where: {
                status: 'Canceled',
                paymentDate: {
                    gte: new Date(from),
                    lte: new Date(to),
                },
            },
        });

        return {
            from,
            to,
            grandTotal,
            items: Array.from(grouped.values()),
        };
    }

    private mapToDTO(payment: DBPayment): PaymentDTO {
        return {
            id: payment.id,
            memberId: payment.memberId,
            amount: Number(payment.amount),
            paymentDate: payment.paymentDate.toISOString(),
            paymentType: payment.paymentType as PaymentDTO['paymentType'],
            status: payment.status as PaymentDTO['status'],
            created_at: payment.created_at.toISOString(),
        };
    }

    private mapToDetailDTO(payment: DBPaymentWithMember): PaymentDetailDTO {
        return {
            ...this.mapToDTO(payment),
            memberName: payment.member.name,
        };
    }
}
