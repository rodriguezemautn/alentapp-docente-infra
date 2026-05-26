import { describe, it, expect, vi } from 'vitest';
import { GetLockersUseCase } from './GetLockersUseCase.js';
import type { LockerRepository } from '../domain/LockerRepository.js';

describe('GetLockersUseCase', () => {
    const mockRepo: LockerRepository = {
        create: vi.fn(),
        findById: vi.fn(),
        findByNumber: vi.fn(),
        findAll: vi.fn(),
        update: vi.fn(),
        delete: vi.fn(),
    };

    const useCase = new GetLockersUseCase(mockRepo);

    it('debe retornar lista de casilleros', async () => {
        vi.mocked(mockRepo.findAll).mockResolvedValue([{ id: '1', number: 101, status: 'Available', created_at: '' }]);
        const result = await useCase.execute();
        expect(result).toHaveLength(1);
    });

    it('debe filtrar por status', async () => {
        vi.mocked(mockRepo.findAll).mockResolvedValue([]);
        const result = await useCase.execute('Occupied');
        expect(mockRepo.findAll).toHaveBeenCalledWith('Occupied');
        expect(result).toHaveLength(0);
    });
});
