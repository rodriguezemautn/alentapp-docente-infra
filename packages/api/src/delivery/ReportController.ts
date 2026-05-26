import { FastifyRequest, FastifyReply } from 'fastify';
import { GetIncomeReportUseCase } from '../application/GetIncomeReportUseCase.js';
import { GetLockerReportUseCase } from '../application/GetLockerReportUseCase.js';
import { GetMaterialReportUseCase } from '../application/GetMaterialReportUseCase.js';
import { GetMemberReportUseCase } from '../application/GetMemberReportUseCase.js';

export class ReportController {
    constructor(
        private readonly incomeReportUseCase: GetIncomeReportUseCase,
        private readonly lockerReportUseCase: GetLockerReportUseCase,
        private readonly materialReportUseCase: GetMaterialReportUseCase,
        private readonly memberReportUseCase: GetMemberReportUseCase,
    ) {}

    async getIncomeReport(
        request: FastifyRequest<{ Querystring: { from: string; to: string; groupBy?: string } }>,
        reply: FastifyReply,
    ) {
        try {
            const { from, to, groupBy } = request.query;
            const report = await this.incomeReportUseCase.execute(from, to, groupBy);
            return reply.status(200).send({ data: report });
        } catch (error: any) {
            if (error.message.includes('no puede ser posterior') || error.message.includes('Agrupación no válida')) {
                return reply.status(400).send({ error: error.message });
            }
            return reply.status(500).send({ error: 'Error interno, reintente más tarde' });
        }
    }

    async getLockerReport(_request: FastifyRequest, reply: FastifyReply) {
        try {
            const report = await this.lockerReportUseCase.execute();
            return reply.status(200).send({ data: report });
        } catch (error: any) {
            return reply.status(500).send({ error: error.message });
        }
    }

    async getMaterialReport(_request: FastifyRequest, reply: FastifyReply) {
        try {
            const report = await this.materialReportUseCase.execute();
            return reply.status(200).send({ data: report });
        } catch (error: any) {
            return reply.status(500).send({ error: error.message });
        }
    }

    async getMemberReport(_request: FastifyRequest, reply: FastifyReply) {
        try {
            const report = await this.memberReportUseCase.execute();
            return reply.status(200).send({ data: report });
        } catch (error: any) {
            return reply.status(500).send({ error: error.message });
        }
    }
}
