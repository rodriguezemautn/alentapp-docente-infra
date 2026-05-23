import { describe, it, expect, vi, beforeEach } from 'vitest';
import { GetActiveMedicalCertificateUseCase } from './GetActiveMedicalCertificateUseCase.js';
import { MedicalCertificateRepository } from '../domain/MedicalCertificateRepository.js';
import { MedicalCertificateDTO } from '@alentapp/shared';
import { NotFoundError } from '../domain/errors.js';

describe('GetActiveMedicalCertificateUseCase', () => {
    const mockMcRepo = {
        create: vi.fn(),
        findActiveByMember: vi.fn(),
        deactivateAllByMember: vi.fn(),
        createWithDeactivation: vi.fn(),
    } as unknown as MedicalCertificateRepository;

    const useCase = new GetActiveMedicalCertificateUseCase(mockMcRepo);

    beforeEach(() => {
        vi.clearAllMocks();
    });

    const activeDTO: MedicalCertificateDTO = {
        id: 'mc-uuid-1',
        memberId: 'member-uuid-1',
        issueDate: '2026-05-23T00:00:00.000Z',
        expirationDate: '2026-12-31T00:00:00.000Z',
        isActive: true,
        description: 'Certificado médico anual',
        doctorName: 'Dr. Pérez',
        created_at: '2026-05-23T00:00:00.000Z',
    };

    it('debe retornar el certificado activo si existe', async () => {
        vi.mocked(mockMcRepo.findActiveByMember).mockResolvedValueOnce(activeDTO);

        const result = await useCase.execute('member-uuid-1');

        expect(mockMcRepo.findActiveByMember).toHaveBeenCalledWith('member-uuid-1');
        expect(result).toEqual(activeDTO);
    });

    it('debe lanzar NotFoundError si no hay certificado activo', async () => {
        vi.mocked(mockMcRepo.findActiveByMember).mockResolvedValueOnce(null);

        await expect(useCase.execute('member-uuid-1')).rejects.toThrow(NotFoundError);
        expect(mockMcRepo.findActiveByMember).toHaveBeenCalledWith('member-uuid-1');
    });
});
