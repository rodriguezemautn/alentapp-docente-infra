import { EquipmentLoanRepository } from '../domain/EquipmentLoanRepository.js';
import { EquipmentLoanValidator } from '../domain/services/EquipmentLoanValidator.js';
import { EquipmentLoanDTO, CreateEquipmentLoanRequest } from '@alentapp/shared';
import type { MemberRepository } from '../domain/MemberRepository.js';

export class CreateEquipmentLoanUseCase {
    constructor(
        private readonly loanRepo: EquipmentLoanRepository,
        private readonly memberRepo: MemberRepository,
        private readonly validator: EquipmentLoanValidator,
    ) {}

    async execute(data: CreateEquipmentLoanRequest): Promise<EquipmentLoanDTO> {
        const member = await this.memberRepo.findById(data.memberId);
        if (!member) {
            throw new Error('El socio no existe');
        }

        this.validator.validateMemberSportCategory(member);

        return this.loanRepo.create(data);
    }
}
