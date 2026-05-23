import { PaymentRepository } from '../domain/PaymentRepository.js';
import { PaymentValidator } from '../domain/services/PaymentValidator.js';
import { PaymentFilters, PaginatedResponse, PaymentDTO } from '@alentapp/shared';

export class GetPaymentsUseCase {
    constructor(
        private readonly paymentRepo: PaymentRepository,
        private readonly validator: PaymentValidator,
    ) {}

    async execute(filters: PaymentFilters): Promise<PaginatedResponse<PaymentDTO>> {
        this.validator.validateDateRange(filters.from, filters.to);
        return this.paymentRepo.findAll(filters);
    }
}
