import { FastifyRequest, FastifyReply } from 'fastify';
import { CreateMedicalCertificateUseCase } from '../application/CreateMedicalCertificateUseCase.js';
import { GetActiveMedicalCertificateUseCase } from '../application/GetActiveMedicalCertificateUseCase.js';
import { CreateMedicalCertificateRequest } from '@alentapp/shared';

export class MedicalCertificateController {
    constructor(
        private readonly createUseCase: CreateMedicalCertificateUseCase,
        private readonly getActiveUseCase: GetActiveMedicalCertificateUseCase,
    ) {}

    async create(
        request: FastifyRequest<{ Body: CreateMedicalCertificateRequest }>,
        reply: FastifyReply,
    ) {
        try {
            const certificate = await this.createUseCase.execute(request.body);
            return reply.status(201).send({ data: certificate });
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

    async getActive(
        request: FastifyRequest<{ Params: { memberId: string } }>,
        reply: FastifyReply,
    ) {
        try {
            const { memberId } = request.params;
            const certificate = await this.getActiveUseCase.execute(memberId);
            return reply.status(200).send({ data: certificate });
        } catch (error: any) {
            if (error.name === 'NotFoundError') {
                return reply.status(404).send({ error: error.message });
            }
            return reply.status(500).send({ error: 'Error interno, reintente más tarde' });
        }
    }
}
