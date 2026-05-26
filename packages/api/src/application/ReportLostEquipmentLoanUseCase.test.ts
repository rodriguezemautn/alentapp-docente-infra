import { describe, it, expect, vi } from 'vitest';
import { ReportLostEquipmentLoanUseCase } from './ReportLostEquipmentLoanUseCase.js';
import { EquipmentLoanValidator } from '../domain/services/EquipmentLoanValidator.js';
import type { EquipmentLoanRepository } from '../domain/EquipmentLoanRepository.js';

describe('ReportLostEquipmentLoanUseCase', () => {
    const mockRepo: EquipmentLoanRepository = {
        create: vi.fn(), findById: vi.fn(), findAll: vi.fn(), update: vi.fn(), delete: vi.fn(),
    };
    const validator = new EquipmentLoanValidator();
    const useCase = new ReportLostEquipmentLoanUseCase(mockRepo, validator);

    it('debe reportar como perdido un préstamo activo', async () => {
        vi.mocked(mockRepo.findById).mockResolvedValue({ id: '1', status: 'Active' } as any);
        vi.mocked(mockRepo.update).mockResolvedValue({ id: '1', status: 'Lost' } as any);

        const result = await useCase.execute('1');
        expect(result.status).toBe('Lost');
    });

    it('debe rechazar reportar como perdido un préstamo ya perdido', async () => {
        vi.mocked(mockRepo.findById).mockResolvedValue({ id: '1', status: 'Lost' } as any);
        await expect(useCase.execute('1')).rejects.toThrow('ya fue reportado como perdido');
    });
});
