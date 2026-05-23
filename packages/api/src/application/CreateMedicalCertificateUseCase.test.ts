import { describe, it, expect, vi, beforeEach } from 'vitest';
import { CreateMedicalCertificateUseCase } from './CreateMedicalCertificateUseCase.js';
import { MedicalCertificateRepository } from '../domain/MedicalCertificateRepository.js';
import { MemberRepository } from '../domain/MemberRepository.js';
import { MedicalCertificateValidator } from '../domain/services/MedicalCertificateValidator.js';
import { CreateMedicalCertificateRequest, MedicalCertificateDTO } from '@alentapp/shared';
import { ValidationError, NotFoundError } from '../domain/errors.js';

describe('CreateMedicalCertificateUseCase', () => {
    const mockMcRepo = {
        create: vi.fn(),
        findActiveByMember: vi.fn(),
        deactivateAllByMember: vi.fn(),
        createWithDeactivation: vi.fn(),
    } as unknown as MedicalCertificateRepository;

    const mockMemberRepo = {
        findById: vi.fn(),
        create: vi.fn(),
        findByDni: vi.fn(),
        findAll: vi.fn(),
        update: vi.fn(),
        delete: vi.fn(),
    } as unknown as MemberRepository;

    const mockValidator = {
        validateExpirationDate: vi.fn(),
    } as unknown as MedicalCertificateValidator;

    const useCase = new CreateMedicalCertificateUseCase(
        mockMcRepo,
        mockValidator,
        mockMemberRepo,
    );

    beforeEach(() => {
        vi.clearAllMocks();
    });

    const validRequest: CreateMedicalCertificateRequest = {
        memberId: 'member-uuid-1',
        expirationDate: '2026-12-31',
        description: 'Certificado médico anual',
        doctorName: 'Dr. Pérez',
    };

    const expectedDTO: MedicalCertificateDTO = {
        id: 'mc-uuid-1',
        memberId: 'member-uuid-1',
        issueDate: '2026-05-23T00:00:00.000Z',
        expirationDate: '2026-12-31T00:00:00.000Z',
        isActive: true,
        description: 'Certificado médico anual',
        doctorName: 'Dr. Pérez',
        created_at: '2026-05-23T00:00:00.000Z',
    };

    it('debe crear un certificado exitosamente cuando no hay certificado previo', async () => {
        vi.mocked(mockMemberRepo.findById).mockResolvedValueOnce({ id: 'member-uuid-1', name: 'Juan' } as any);
        vi.mocked(mockMcRepo.createWithDeactivation).mockResolvedValueOnce(expectedDTO);

        const result = await useCase.execute(validRequest);

        expect(mockValidator.validateExpirationDate).toHaveBeenCalledWith(
            expect.any(String),
            validRequest.expirationDate,
        );
        expect(mockMemberRepo.findById).toHaveBeenCalledWith('member-uuid-1');
        expect(mockMcRepo.createWithDeactivation).toHaveBeenCalledWith(validRequest);
        expect(result).toEqual(expectedDTO);
    });

    it('debe crear un certificado y desactivar el anterior si existe', async () => {
        vi.mocked(mockMemberRepo.findById).mockResolvedValueOnce({ id: 'member-uuid-1', name: 'Juan' } as any);
        vi.mocked(mockMcRepo.createWithDeactivation).mockResolvedValueOnce(expectedDTO);

        const result = await useCase.execute(validRequest);

        expect(mockMemberRepo.findById).toHaveBeenCalledWith('member-uuid-1');
        expect(mockMcRepo.createWithDeactivation).toHaveBeenCalledWith(validRequest);
        expect(result).toEqual(expectedDTO);
    });

    it('debe lanzar NotFoundError si el miembro no existe', async () => {
        vi.mocked(mockMemberRepo.findById).mockResolvedValueOnce(null);

        await expect(useCase.execute(validRequest)).rejects.toThrow(NotFoundError);
        expect(mockMemberRepo.findById).toHaveBeenCalledWith('member-uuid-1');
        expect(mockMcRepo.createWithDeactivation).not.toHaveBeenCalled();
    });

    it('debe lanzar ValidationError si la fecha de vencimiento es inválida', async () => {
        vi.mocked(mockValidator.validateExpirationDate).mockImplementationOnce(() => {
            throw new ValidationError('La fecha de vencimiento no puede ser anterior a la fecha de emisión');
        });

        await expect(useCase.execute(validRequest)).rejects.toThrow(ValidationError);
        expect(mockValidator.validateExpirationDate).toHaveBeenCalled();
        expect(mockMemberRepo.findById).not.toHaveBeenCalled();
        expect(mockMcRepo.createWithDeactivation).not.toHaveBeenCalled();
    });

    it('debe crear un certificado sin expirationDate ni description ni doctorName', async () => {
        const minimalRequest: CreateMedicalCertificateRequest = {
            memberId: 'member-uuid-2',
        };

        const minimalDTO: MedicalCertificateDTO = {
            id: 'mc-uuid-2',
            memberId: 'member-uuid-2',
            issueDate: '2026-05-23T00:00:00.000Z',
            isActive: true,
            created_at: '2026-05-23T00:00:00.000Z',
        };

        vi.mocked(mockMemberRepo.findById).mockResolvedValueOnce({ id: 'member-uuid-2', name: 'María' } as any);
        vi.mocked(mockMcRepo.createWithDeactivation).mockResolvedValueOnce(minimalDTO);

        const result = await useCase.execute(minimalRequest);

        expect(mockValidator.validateExpirationDate).toHaveBeenCalledWith(
            expect.any(String),
            undefined,
        );
        expect(mockMemberRepo.findById).toHaveBeenCalledWith('member-uuid-2');
        expect(mockMcRepo.createWithDeactivation).toHaveBeenCalledWith(minimalRequest);
        expect(result).toEqual(minimalDTO);
    });
});
