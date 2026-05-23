import { MedicalCertificateRepository } from '../domain/MedicalCertificateRepository.js';
import { MedicalCertificateDTO } from '@alentapp/shared';
import { NotFoundError } from '../domain/errors.js';

export class GetActiveMedicalCertificateUseCase {
    constructor(
        private readonly mcRepo: MedicalCertificateRepository,
    ) {}

    async execute(memberId: string): Promise<MedicalCertificateDTO> {
        const certificate = await this.mcRepo.findActiveByMember(memberId);
        if (!certificate) {
            throw new NotFoundError('No se encontró un certificado médico activo para el miembro');
        }
        return certificate;
    }
}
