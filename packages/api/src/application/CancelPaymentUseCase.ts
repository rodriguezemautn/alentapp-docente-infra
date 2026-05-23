import { PaymentRepository } from '../domain/PaymentRepository.js';
import { PaymentValidator } from '../domain/services/PaymentValidator.js';
import { PaymentDTO } from '@alentapp/shared';

export class CancelPaymentUseCase {
    constructor(
        private readonly paymentRepo: PaymentRepository,
        private readonly validator: PaymentValidator,
    ) {}

    async execute(id: string): Promise<PaymentDTO> {
        const payment = await this.paymentRepo.findById(id);
        this.validator.validateCancel(payment);
        return this.paymentRepo.update(id, { status: 'Canceled' });
    }
}
