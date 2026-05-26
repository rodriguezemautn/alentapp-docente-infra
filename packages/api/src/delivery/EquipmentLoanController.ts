import { FastifyRequest, FastifyReply } from 'fastify';
import { CreateEquipmentLoanUseCase } from '../application/CreateEquipmentLoanUseCase.js';
import { GetEquipmentLoansUseCase } from '../application/GetEquipmentLoansUseCase.js';
import { GetEquipmentLoanByIdUseCase } from '../application/GetEquipmentLoanByIdUseCase.js';
import { ReturnEquipmentLoanUseCase } from '../application/ReturnEquipmentLoanUseCase.js';
import { ReportLostEquipmentLoanUseCase } from '../application/ReportLostEquipmentLoanUseCase.js';
import { DeleteEquipmentLoanUseCase } from '../application/DeleteEquipmentLoanUseCase.js';
import { CreateEquipmentLoanRequest, ReturnEquipmentLoanRequest } from '@alentapp/shared';

export class EquipmentLoanController {
    constructor(
        private readonly createUseCase: CreateEquipmentLoanUseCase,
        private readonly getAllUseCase: GetEquipmentLoansUseCase,
        private readonly getByIdUseCase: GetEquipmentLoanByIdUseCase,
        private readonly returnUseCase: ReturnEquipmentLoanUseCase,
        private readonly reportLostUseCase: ReportLostEquipmentLoanUseCase,
        private readonly deleteUseCase: DeleteEquipmentLoanUseCase,
    ) {}

    async create(
        request: FastifyRequest<{ Body: CreateEquipmentLoanRequest }>,
        reply: FastifyReply,
    ) {
        try {
            const loan = await this.createUseCase.execute(request.body);
            return reply.status(201).send({ data: loan });
        } catch (error: any) {
            if (error.message.includes('no existe')) {
                return reply.status(404).send({ error: error.message });
            }
            if (error.message.includes('no tiene') || error.message.includes('Cadet')) {
                return reply.status(403).send({ error: error.message });
            }
            return reply.status(500).send({ error: 'Error interno, reintente más tarde' });
        }
    }

    async getAll(
        request: FastifyRequest<{ Querystring: { memberId?: string; status?: string } }>,
        reply: FastifyReply,
    ) {
        try {
            const { memberId, status } = request.query;
            const loans = await this.getAllUseCase.execute(memberId, status);
            return reply.status(200).send({ data: loans });
        } catch (error: any) {
            return reply.status(500).send({ error: error.message });
        }
    }

    async getById(
        request: FastifyRequest<{ Params: { id: string } }>,
        reply: FastifyReply,
    ) {
        try {
            const loan = await this.getByIdUseCase.execute(request.params.id);
            return reply.status(200).send({ data: loan });
        } catch (error: any) {
            if (error.message.includes('no existe')) {
                return reply.status(404).send({ error: error.message });
            }
            return reply.status(500).send({ error: 'Error interno, reintente más tarde' });
        }
    }

    async returnLoan(
        request: FastifyRequest<{ Params: { id: string }; Body: ReturnEquipmentLoanRequest }>,
        reply: FastifyReply,
    ) {
        try {
            const loan = await this.returnUseCase.execute(request.params.id, request.body);
            return reply.status(200).send({ data: loan });
        } catch (error: any) {
            if (error.message.includes('no existe')) {
                return reply.status(404).send({ error: error.message });
            }
            if (error.message.includes('ya fue')) {
                return reply.status(400).send({ error: error.message });
            }
            return reply.status(500).send({ error: 'Error interno, reintente más tarde' });
        }
    }

    async reportLost(
        request: FastifyRequest<{ Params: { id: string } }>,
        reply: FastifyReply,
    ) {
        try {
            const loan = await this.reportLostUseCase.execute(request.params.id);
            return reply.status(200).send({ data: loan });
        } catch (error: any) {
            if (error.message.includes('no existe')) {
                return reply.status(404).send({ error: error.message });
            }
            if (error.message.includes('ya fue')) {
                return reply.status(400).send({ error: error.message });
            }
            return reply.status(500).send({ error: 'Error interno, reintente más tarde' });
        }
    }

    async delete(
        request: FastifyRequest<{ Params: { id: string } }>,
        reply: FastifyReply,
    ) {
        try {
            await this.deleteUseCase.execute(request.params.id);
            return reply.status(204).send();
        } catch (error: any) {
            if (error.message.includes('no existe')) {
                return reply.status(404).send({ error: error.message });
            }
            if (error.message.includes('No se puede eliminar')) {
                return reply.status(400).send({ error: error.message });
            }
            return reply.status(500).send({ error: 'Error interno, reintente más tarde' });
        }
    }
}
