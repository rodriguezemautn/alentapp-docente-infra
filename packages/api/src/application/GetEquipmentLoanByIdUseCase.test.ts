import { describe, it, expect, vi } from 'vitest';
import { GetEquipmentLoanByIdUseCase } from './GetEquipmentLoanByIdUseCase.js';
import type { EquipmentLoanRepository } from '../domain/EquipmentLoanRepository.js';

describe('GetEquipmentLoanByIdUseCase', () => {
    const mockRepo: EquipmentLoanRepository = {
        create: vi.fn(), findById: vi.fn(), findAll: vi.fn(), update: vi.fn(), delete: vi.fn(),
    };
    const useCase = new GetEquipmentLoanByIdUseCase(mockRepo);

    it('debe retornar préstamo si existe', async () => {
        vi.mocked(mockRepo.findById).mockResolvedValue({ id: '1', memberId: 'm1', equipmentName: 'Pelota', status: 'Active', loanDate: '', created_at: '' });
        const result = await useCase.execute('1');
        expect(result.id).toBe('1');
    });

    it('debe lanzar error si no existe', async () => {
        vi.mocked(mockRepo.findById).mockResolvedValue(null);
        await expect(useCase.execute('999')).rejects.toThrow('El préstamo no existe');
    });
});
