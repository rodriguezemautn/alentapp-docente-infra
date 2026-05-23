import { PaymentRepository } from '../domain/PaymentRepository.js';
import { PaymentDetailDTO } from '@alentapp/shared';
import { NotFoundError } from '../domain/errors.js';

export class GetPaymentByIdUseCase {
    constructor(private readonly paymentRepo: PaymentRepository) {}

    async execute(id: string): Promise<PaymentDetailDTO> {
        const payment = await this.paymentRepo.findById(id);
        if (!payment) {
            throw new NotFoundError('Pago no encontrado');
        }
        return payment;
    }
}
