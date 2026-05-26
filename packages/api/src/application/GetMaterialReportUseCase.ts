import { EquipmentLoanRepository } from '../domain/EquipmentLoanRepository.js';
import { MaterialReportResponse } from '@alentapp/shared';

export class GetMaterialReportUseCase {
    constructor(private readonly loanRepo: EquipmentLoanRepository) {}

    async execute(): Promise<MaterialReportResponse> {
        return this.loanRepo.getMaterialReport();
    }
}
