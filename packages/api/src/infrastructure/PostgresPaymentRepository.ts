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
