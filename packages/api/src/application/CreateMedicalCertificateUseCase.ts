import { MedicalCertificateRepository } from '../domain/MedicalCertificateRepository.js';
import { MemberRepository } from '../domain/MemberRepository.js';
import { MedicalCertificateValidator } from '../domain/services/MedicalCertificateValidator.js';
import { CreateMedicalCertificateRequest, MedicalCertificateDTO } from '@alentapp/shared';
import { NotFoundError } from '../domain/errors.js';

export class CreateMedicalCertificateUseCase {
    constructor(
        private readonly mcRepo: MedicalCertificateRepository,
        private readonly validator: MedicalCertificateValidator,
        private readonly memberRepo: MemberRepository,
    ) {}

    async execute(data: CreateMedicalCertificateRequest): Promise<MedicalCertificateDTO> {
        const issueDate = new Date().toISOString();
        this.validator.validateExpirationDate(issueDate, data.expirationDate);

        const member = await this.memberRepo.findById(data.memberId);
        if (!member) {
            throw new NotFoundError('Miembro no encontrado');
        }

        return this.mcRepo.createWithDeactivation(data);
    }
}
