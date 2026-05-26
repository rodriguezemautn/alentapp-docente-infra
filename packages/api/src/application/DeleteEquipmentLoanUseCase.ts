import { EquipmentLoanRepository } from '../domain/EquipmentLoanRepository.js';
import { EquipmentLoanValidator } from '../domain/services/EquipmentLoanValidator.js';

export class DeleteEquipmentLoanUseCase {
    constructor(
        private readonly loanRepo: EquipmentLoanRepository,
        private readonly validator: EquipmentLoanValidator,
    ) {}

    async execute(id: string): Promise<void> {
        const existing = await this.loanRepo.findById(id);
        if (!existing) {
            throw new Error('El préstamo no existe');
        }

        this.validator.validateStatusForDeletion(existing.status);
        await this.loanRepo.delete(id);
    }
}
