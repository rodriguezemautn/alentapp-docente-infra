import { describe, it, expect, vi } from 'vitest';
import { CreateLockerUseCase } from './CreateLockerUseCase.js';
import { LockerValidator } from '../domain/services/LockerValidator.js';
import type { LockerRepository } from '../domain/LockerRepository.js';

describe('CreateLockerUseCase', () => {
    const mockRepo: LockerRepository = {
        create: vi.fn(),
        findById: vi.fn(),
        findByNumber: vi.fn(),
        findAll: vi.fn(),
        update: vi.fn(),
        delete: vi.fn(),
    };

    const validator = new LockerValidator(mockRepo);
    const useCase = new CreateLockerUseCase(mockRepo, validator);

    it('debe crear un casillero con datos válidos', async () => {
        const dto = { id: '1', number: 101, status: 'Available' as const, created_at: new Date().toISOString() };
        vi.mocked(mockRepo.create).mockResolvedValue(dto);

        const result = await useCase.execute({ number: 101 });

        expect(result.number).toBe(101);
        expect(result.status).toBe('Available');
    });

    it('debe rechazar número negativo', async () => {
        await expect(useCase.execute({ number: -1 })).rejects.toThrow('debe ser un entero positivo');
    });

    it('debe rechazar número cero', async () => {
        await expect(useCase.execute({ number: 0 })).rejects.toThrow('debe ser un entero positivo');
    });

    it('debe rechazar número duplicado', async () => {
        vi.mocked(mockRepo.findByNumber).mockResolvedValue({ id: '1', number: 101, status: 'Available', created_at: '' });
        await expect(useCase.execute({ number: 101 })).rejects.toThrow('Ya existe un casillero con ese número');
    });
});
