import { EquipmentLoanRepository } from '../domain/EquipmentLoanRepository.js';
import { EquipmentLoanDetailDTO } from '@alentapp/shared';

export class GetEquipmentLoanByIdUseCase {
    constructor(private readonly loanRepo: EquipmentLoanRepository) {}

    async execute(id: string): Promise<EquipmentLoanDetailDTO> {
        const loan = await this.loanRepo.findById(id);
        if (!loan) {
            throw new Error('El préstamo no existe');
        }
        return loan;
    }
}
