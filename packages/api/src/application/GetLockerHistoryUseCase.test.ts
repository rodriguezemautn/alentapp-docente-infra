import { describe, it, expect, vi } from 'vitest';
import { GetLockerHistoryUseCase } from './GetLockerHistoryUseCase.js';
import type { LockerAssignmentLogRepository } from '../domain/LockerRepository.js';

describe('GetLockerHistoryUseCase', () => {
    const mockLogRepo: LockerAssignmentLogRepository = {
        create: vi.fn(),
        findByLocker: vi.fn(),
        findByMember: vi.fn(),
    };

    const useCase = new GetLockerHistoryUseCase(mockLogRepo);

    it('debe retornar historial por lockerId', async () => {
        vi.mocked(mockLogRepo.findByLocker).mockResolvedValue([
            { id: '1', lockerId: 'l1', lockerNumber: 101, memberId: 'm1', memberName: 'Juan', eventType: 'Assignment', assignedAt: '', created_at: '' },
        ]);
        const result = await useCase.execute({ lockerId: 'l1' });
        expect(result).toHaveLength(1);
        expect(result[0].lockerNumber).toBe(101);
    });

    it('debe retornar historial por memberId', async () => {
        vi.mocked(mockLogRepo.findByMember).mockResolvedValue([]);
        await useCase.execute({ memberId: 'm1' });
        expect(mockLogRepo.findByMember).toHaveBeenCalledWith('m1');
    });

    it('debe retornar lista vacía si no hay filtros', async () => {
        const result = await useCase.execute({});
        expect(result).toEqual([]);
    });
});
