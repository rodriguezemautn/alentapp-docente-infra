import { describe, it, expect, vi } from 'vitest';
import { ReturnEquipmentLoanUseCase } from './ReturnEquipmentLoanUseCase.js';
import { EquipmentLoanValidator } from '../domain/services/EquipmentLoanValidator.js';
import type { EquipmentLoanRepository } from '../domain/EquipmentLoanRepository.js';

describe('ReturnEquipmentLoanUseCase', () => {
    const mockRepo: EquipmentLoanRepository = {
        create: vi.fn(), findById: vi.fn(), findAll: vi.fn(), update: vi.fn(), delete: vi.fn(),
    };
    const validator = new EquipmentLoanValidator();
    const useCase = new ReturnEquipmentLoanUseCase(mockRepo, validator);

    it('debe devolver un préstamo activo', async () => {
        vi.mocked(mockRepo.findById).mockResolvedValue({ id: '1', status: 'Active' } as any);
        vi.mocked(mockRepo.update).mockResolvedValue({ id: '1', status: 'Returned' } as any);

        const result = await useCase.execute('1', {});
        expect(result.status).toBe('Returned');
    });

    it('debe rechazar devolución de préstamo ya devuelto', async () => {
        vi.mocked(mockRepo.findById).mockResolvedValue({ id: '1', status: 'Returned' } as any);
        await expect(useCase.execute('1', {})).rejects.toThrow('El préstamo ya fue devuelto');
    });

    it('debe rechazar devolución de préstamo inexistente', async () => {
        vi.mocked(mockRepo.findById).mockResolvedValue(null);
        await expect(useCase.execute('999', {})).rejects.toThrow('El préstamo no existe');
    });
});
