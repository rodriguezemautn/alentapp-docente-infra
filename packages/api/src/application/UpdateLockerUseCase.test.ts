import { describe, it, expect, vi } from 'vitest';
import { UpdateLockerUseCase } from './UpdateLockerUseCase.js';
import { LockerValidator } from '../domain/services/LockerValidator.js';
import type { LockerRepository } from '../domain/LockerRepository.js';

describe('UpdateLockerUseCase', () => {
    const mockRepo: LockerRepository = {
        create: vi.fn(),
        findById: vi.fn(),
        findByNumber: vi.fn(),
        findAll: vi.fn(),
        update: vi.fn(),
        delete: vi.fn(),
    };

    const validator = new LockerValidator(mockRepo);
    const useCase = new UpdateLockerUseCase(mockRepo, validator);

    it('debe actualizar un casillero existente', async () => {
        vi.mocked(mockRepo.findById).mockResolvedValue({ id: '1', number: 101, status: 'Available', created_at: '' });
        vi.mocked(mockRepo.update).mockResolvedValue({ id: '1', number: 101, location: 'Planta baja', status: 'Available', created_at: '' });

        const result = await useCase.execute('1', { location: 'Planta baja' });
        expect(result.location).toBe('Planta baja');
    });

    it('debe rechazar actualización de casillero inexistente', async () => {
        vi.mocked(mockRepo.findById).mockResolvedValue(null);
        await expect(useCase.execute('999', { location: 'x' })).rejects.toThrow('El casillero no existe');
    });

    it('debe rechazar asignación a casillero en mantenimiento', async () => {
        vi.mocked(mockRepo.findById).mockResolvedValue({ id: '1', number: 101, status: 'Maintenance', created_at: '' });
        await expect(useCase.execute('1', { memberId: 'abc' })).rejects.toThrow('No se puede asignar un casillero en mantenimiento');
    });
});
