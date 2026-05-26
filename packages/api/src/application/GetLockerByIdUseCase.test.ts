import { describe, it, expect, vi } from 'vitest';
import { GetLockerByIdUseCase } from './GetLockerByIdUseCase.js';
import type { LockerRepository } from '../domain/LockerRepository.js';

describe('GetLockerByIdUseCase', () => {
    const mockRepo: LockerRepository = {
        create: vi.fn(),
        findById: vi.fn(),
        findByNumber: vi.fn(),
        findAll: vi.fn(),
        update: vi.fn(),
        delete: vi.fn(),
    };

    const useCase = new GetLockerByIdUseCase(mockRepo);

    it('debe retornar casillero si existe', async () => {
        vi.mocked(mockRepo.findById).mockResolvedValue({ id: '1', number: 101, status: 'Available', created_at: '' });
        const result = await useCase.execute('1');
        expect(result.id).toBe('1');
    });

    it('debe lanzar error si no existe', async () => {
        vi.mocked(mockRepo.findById).mockResolvedValue(null);
        await expect(useCase.execute('999')).rejects.toThrow('El casillero no existe');
    });
});
