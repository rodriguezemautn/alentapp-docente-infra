import { FastifyRequest, FastifyReply } from 'fastify';
import { CreatePaymentUseCase } from '../application/CreatePaymentUseCase.js';
import { GetPaymentsUseCase } from '../application/GetPaymentsUseCase.js';
import { GetPaymentByIdUseCase } from '../application/GetPaymentByIdUseCase.js';
import { CancelPaymentUseCase } from '../application/CancelPaymentUseCase.js';
import { CreatePaymentRequest, PaymentFilters } from '@alentapp/shared';
import { ValidationError, NotFoundError, ConflictError } from '../domain/errors.js';

export class PaymentController {
    constructor(
        private readonly createPaymentUseCase: CreatePaymentUseCase,
        private readonly getPaymentsUseCase: GetPaymentsUseCase,
        private readonly getPaymentByIdUseCase: GetPaymentByIdUseCase,
        private readonly cancelPaymentUseCase: CancelPaymentUseCase,
    ) {}

    async create(
        request: FastifyRequest<{ Body: CreatePaymentRequest }>,
        reply: FastifyReply,
    ) {
        try {
            const payment = await this.createPaymentUseCase.execute(request.body);
            return reply.status(201).send({ data: payment });
        } catch (error: any) {
            if (error.name === 'ValidationError') {
                return reply.status(400).send({ error: error.message });
            }
            if (error.name === 'NotFoundError') {
                return reply.status(404).send({ error: error.message });
            }
            return reply.status(500).send({ error: 'Error interno, reintente más tarde' });
        }
    }

    async getAll(
        request: FastifyRequest<{ Querystring: PaymentFilters }>,
        reply: FastifyReply,
    ) {
        try {
            const filters: PaymentFilters = {
                memberId: request.query.memberId,
                paymentType: request.query.paymentType,
                status: request.query.status,
                from: request.query.from,
                to: request.query.to,
                page: request.query.page ? Number(request.query.page) : undefined,
                limit: request.query.limit ? Number(request.query.limit) : undefined,
            };
            const result = await this.getPaymentsUseCase.execute(filters);
            return reply.status(200).send(result);
        } catch (error: any) {
            if (error.name === 'ValidationError') {
                return reply.status(400).send({ error: error.message });
            }
            return reply.status(500).send({ error: error.message });
        }
    }

    async getById(
        request: FastifyRequest<{ Params: { id: string } }>,
        reply: FastifyReply,
    ) {
        try {
            const { id } = request.params;
            const payment = await this.getPaymentByIdUseCase.execute(id);
            return reply.status(200).send({ data: payment });
        } catch (error: any) {
            if (error.name === 'NotFoundError') {
                return reply.status(404).send({ error: error.message });
            }
            return reply.status(500).send({ error: 'Error interno, reintente más tarde' });
        }
    }

    async cancel(
        request: FastifyRequest<{ Params: { id: string } }>,
        reply: FastifyReply,
    ) {
        try {
            const { id } = request.params;
            const payment = await this.cancelPaymentUseCase.execute(id);
            return reply.status(200).send({ data: payment });
        } catch (error: any) {
            if (error.name === 'NotFoundError') {
                return reply.status(404).send({ error: error.message });
            }
            if (error.name === 'ConflictError') {
                return reply.status(409).send({ error: error.message });
            }
            return reply.status(500).send({ error: 'Error interno, reintente más tarde' });
        }
    }
}
