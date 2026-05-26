import { EquipmentLoanRepository } from '../domain/EquipmentLoanRepository.js';
import { EquipmentLoanValidator } from '../domain/services/EquipmentLoanValidator.js';
import { EquipmentLoanDTO, ReturnEquipmentLoanRequest } from '@alentapp/shared';

export class ReturnEquipmentLoanUseCase {
    constructor(
        private readonly loanRepo: EquipmentLoanRepository,
        private readonly validator: EquipmentLoanValidator,
    ) {}

    async execute(id: string, data: ReturnEquipmentLoanRequest): Promise<EquipmentLoanDTO> {
        const existing = await this.loanRepo.findById(id);
        if (!existing) {
            throw new Error('El préstamo no existe');
        }

        this.validator.validateStatusForReturn(existing.status);

        return this.loanRepo.update(id, {
            status: 'Returned',
            returnDate: data.returnDate || new Date().toISOString(),
            notes: data.notes,
        });
    }
}
