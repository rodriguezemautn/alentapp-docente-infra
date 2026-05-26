import { EquipmentLoanRepository } from '../domain/EquipmentLoanRepository.js';
import { EquipmentLoanDetailDTO } from '@alentapp/shared';

export class GetEquipmentLoansUseCase {
    constructor(private readonly loanRepo: EquipmentLoanRepository) {}

    async execute(memberId?: string, status?: string): Promise<EquipmentLoanDetailDTO[]> {
        return this.loanRepo.findAll(memberId, status);
    }
}
