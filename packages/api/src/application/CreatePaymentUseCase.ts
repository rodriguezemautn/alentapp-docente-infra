import { PaymentRepository } from '../domain/PaymentRepository.js';
import { MemberRepository } from '../domain/MemberRepository.js';
import { PaymentValidator } from '../domain/services/PaymentValidator.js';
import { CreatePaymentRequest, PaymentDTO } from '@alentapp/shared';
import { NotFoundError } from '../domain/errors.js';

export class CreatePaymentUseCase {
    constructor(
        private readonly paymentRepo: PaymentRepository,
        private readonly memberRepo: MemberRepository,
        private readonly validator: PaymentValidator,
    ) {}

    async execute(data: CreatePaymentRequest): Promise<PaymentDTO> {
        this.validator.validateAmount(data.amount);
        this.validator.validatePaymentType(data.paymentType);

        const member = await this.memberRepo.findById(data.memberId);
        if (!member) {
            throw new NotFoundError('Miembro no encontrado');
        }

        return this.paymentRepo.create({
            memberId: data.memberId,
            amount: data.amount,
            paymentDate: data.paymentDate || new Date().toISOString(),
            paymentType: data.paymentType,
            status: 'Completed',
        });
    }
}
