import { PaymentRepository } from '../domain/PaymentRepository.js';
import { IncomeReportResponse } from '@alentapp/shared';

export class GetIncomeReportUseCase {
    constructor(private readonly paymentRepo: PaymentRepository) {}

    async execute(from: string, to: string, groupBy: string = 'month'): Promise<IncomeReportResponse> {
        if (new Date(from) > new Date(to)) {
            throw new Error('La fecha desde no puede ser posterior a la fecha hasta');
        }
        if (!['day', 'month', 'year'].includes(groupBy)) {
            throw new Error('Agrupación no válida. Use: day, month o year');
        }
        return this.paymentRepo.getIncomeReport(from, to, groupBy);
    }
}
