import { EquipmentLoanRepository } from '../domain/EquipmentLoanRepository.js';
import { EquipmentLoanValidator } from '../domain/services/EquipmentLoanValidator.js';
import { EquipmentLoanDTO } from '@alentapp/shared';

export class ReportLostEquipmentLoanUseCase {
    constructor(
        private readonly loanRepo: EquipmentLoanRepository,
        private readonly validator: EquipmentLoanValidator,
    ) {}

    async execute(id: string): Promise<EquipmentLoanDTO> {
        const existing = await this.loanRepo.findById(id);
        if (!existing) {
            throw new Error('El préstamo no existe');
        }

        this.validator.validateStatusForReturn(existing.status);

        return this.loanRepo.update(id, { status: 'Lost' });
    }
}
