import {
    MedicalCertificateDTO,
    CreateMedicalCertificateRequest,
} from '@alentapp/shared';

export interface MedicalCertificateRepository {
    create(
        data: CreateMedicalCertificateRequest,
    ): Promise<MedicalCertificateDTO>;
    findActiveByMember(memberId: string): Promise<MedicalCertificateDTO | null>;
    deactivateAllByMember(memberId: string): Promise<void>;
    createWithDeactivation(
        data: CreateMedicalCertificateRequest,
    ): Promise<MedicalCertificateDTO>;
}
