import { describe, it, expect, vi } from 'vitest';
import { DeleteLockerUseCase } from './DeleteLockerUseCase.js';
import { LockerValidator } from '../domain/services/LockerValidator.js';
import type { LockerRepository } from '../domain/LockerRepository.js';

describe('DeleteLockerUseCase', () => {
    const mockRepo: LockerRepository = {
        create: vi.fn(),
        findById: vi.fn(),
        findByNumber: vi.fn(),
        findAll: vi.fn(),
        update: vi.fn(),
        delete: vi.fn(),
    };

    const validator = new LockerValidator(mockRepo);
    const useCase = new DeleteLockerUseCase(mockRepo, validator);

    it('debe eliminar un casillero disponible', async () => {
        vi.mocked(mockRepo.findById).mockResolvedValue({ id: '1', number: 101, status: 'Available', created_at: '' });
        await useCase.execute('1');
        expect(mockRepo.delete).toHaveBeenCalledWith('1');
    });

    it('debe rechazar eliminación de casillero ocupado', async () => {
        vi.mocked(mockRepo.findById).mockResolvedValue({ id: '1', number: 101, status: 'Occupied', created_at: '' });
        await expect(useCase.execute('1')).rejects.toThrow('No se puede eliminar un casillero ocupado');
    });

    it('debe rechazar eliminación de casillero inexistente', async () => {
        vi.mocked(mockRepo.findById).mockResolvedValue(null);
        await expect(useCase.execute('999')).rejects.toThrow('El casillero no existe');
    });
});
