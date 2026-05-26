import { describe, it, expect, vi } from 'vitest';
import { DeleteEquipmentLoanUseCase } from './DeleteEquipmentLoanUseCase.js';
import { EquipmentLoanValidator } from '../domain/services/EquipmentLoanValidator.js';
import type { EquipmentLoanRepository } from '../domain/EquipmentLoanRepository.js';

describe('DeleteEquipmentLoanUseCase', () => {
    const mockRepo: EquipmentLoanRepository = {
        create: vi.fn(), findById: vi.fn(), findAll: vi.fn(), update: vi.fn(), delete: vi.fn(),
    };
    const validator = new EquipmentLoanValidator();
    const useCase = new DeleteEquipmentLoanUseCase(mockRepo, validator);

    it('debe eliminar un préstamo devuelto', async () => {
        vi.mocked(mockRepo.findById).mockResolvedValue({ id: '1', status: 'Returned' } as any);
        await useCase.execute('1');
        expect(mockRepo.delete).toHaveBeenCalledWith('1');
    });

    it('debe rechazar eliminación de préstamo activo', async () => {
        vi.mocked(mockRepo.findById).mockResolvedValue({ id: '1', status: 'Active' } as any);
        await expect(useCase.execute('1')).rejects.toThrow('No se puede eliminar un préstamo activo');
    });

    it('debe rechazar eliminación de préstamo inexistente', async () => {
        vi.mocked(mockRepo.findById).mockResolvedValue(null);
        await expect(useCase.execute('999')).rejects.toThrow('El préstamo no existe');
    });
});
