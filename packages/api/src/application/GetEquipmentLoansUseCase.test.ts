import { describe, it, expect, vi } from 'vitest';
import { GetEquipmentLoansUseCase } from './GetEquipmentLoansUseCase.js';
import type { EquipmentLoanRepository } from '../domain/EquipmentLoanRepository.js';

describe('GetEquipmentLoansUseCase', () => {
    const mockRepo: EquipmentLoanRepository = {
        create: vi.fn(), findById: vi.fn(), findAll: vi.fn(), update: vi.fn(), delete: vi.fn(),
    };
    const useCase = new GetEquipmentLoansUseCase(mockRepo);

    it('debe retornar lista de préstamos', async () => {
        vi.mocked(mockRepo.findAll).mockResolvedValue([{ id: '1', memberId: 'm1', equipmentName: 'Pelota', status: 'Active', loanDate: '', created_at: '' }]);
        const result = await useCase.execute();
        expect(result).toHaveLength(1);
    });

    it('debe filtrar por memberId', async () => {
        vi.mocked(mockRepo.findAll).mockResolvedValue([]);
        await useCase.execute('m1');
        expect(mockRepo.findAll).toHaveBeenCalledWith('m1', undefined);
    });
});
