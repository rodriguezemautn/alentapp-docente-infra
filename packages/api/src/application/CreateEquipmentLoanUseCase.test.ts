import { describe, it, expect, vi } from 'vitest';
import { CreateEquipmentLoanUseCase } from './CreateEquipmentLoanUseCase.js';
import { EquipmentLoanValidator } from '../domain/services/EquipmentLoanValidator.js';
import type { EquipmentLoanRepository } from '../domain/EquipmentLoanRepository.js';
import type { MemberRepository } from '../domain/MemberRepository.js';

describe('CreateEquipmentLoanUseCase', () => {
    const mockLoanRepo: EquipmentLoanRepository = {
        create: vi.fn(), findById: vi.fn(), findAll: vi.fn(), update: vi.fn(), delete: vi.fn(),
    };
    const mockMemberRepo: MemberRepository = {
        create: vi.fn(), findById: vi.fn(), findByDni: vi.fn(), findAll: vi.fn(), update: vi.fn(), delete: vi.fn(),
    };
    const validator = new EquipmentLoanValidator();
    const useCase = new CreateEquipmentLoanUseCase(mockLoanRepo, mockMemberRepo, validator);

    it('debe crear un préstamo para socio Senior', async () => {
        vi.mocked(mockMemberRepo.findById).mockResolvedValue({ id: '1', name: 'Juan', sportCategory: 'Senior' } as any);
        vi.mocked(mockLoanRepo.create).mockResolvedValue({ id: '1', memberId: '1', equipmentName: 'Pelota', status: 'Active' } as any);

        const result = await useCase.execute({ memberId: '1', equipmentName: 'Pelota' });
        expect(result.status).toBe('Active');
    });

    it('debe rechazar préstamo para socio Cadet', async () => {
        vi.mocked(mockMemberRepo.findById).mockResolvedValue({ id: '1', name: 'Juan', sportCategory: 'Cadet' } as any);
        await expect(useCase.execute({ memberId: '1', equipmentName: 'Pelota' })).rejects.toThrow('Cadet');
    });

    it('debe rechazar préstamo para socio sin categoría deportiva', async () => {
        vi.mocked(mockMemberRepo.findById).mockResolvedValue({ id: '1', name: 'Juan', sportCategory: undefined } as any);
        await expect(useCase.execute({ memberId: '1', equipmentName: 'Pelota' })).rejects.toThrow('no tiene una categoría deportiva asignada');
    });

    it('debe rechazar préstamo para socio inexistente', async () => {
        vi.mocked(mockMemberRepo.findById).mockResolvedValue(null);
        await expect(useCase.execute({ memberId: '999', equipmentName: 'Pelota' })).rejects.toThrow('El socio no existe');
    });
});
